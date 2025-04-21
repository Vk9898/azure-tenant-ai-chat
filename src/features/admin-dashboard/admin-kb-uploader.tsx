"use client";

import { useState } from "react";
import { Button } from "@/features/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/features/ui/card";
import { Input } from "@/features/ui/input";
import { Label } from "@/features/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/features/ui/tabs";
import { FileUpIcon, Loader2, UploadIcon } from "lucide-react";
import { IndexDocuments } from "@/features/chat-page/chat-services/ai-search/neondb-ai-search";
import { LoadFile } from "@/features/chat-page/chat-services/chat-document-service";
import { uniqueId } from "@/features/common/util";

export function AdminKnowledgeBaseUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [fileName, setFileName] = useState("");

  const handleFileUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData(event.currentTarget);
      const file = formData.get("file") as File;
      
      if (!file) {
        throw new Error("No file selected");
      }
      
      // Use the file name if provided, otherwise use the uploaded file name
      const documentName = fileName || file.name;
      
      // Extract content from file
      const loadFileResponse = await LoadFile(formData);

      if (loadFileResponse.status !== "OK") {
        throw new Error(loadFileResponse.errors[0]?.message || "Failed to extract content from file");
      }

      // Create a unique thread ID for admin knowledge base
      const adminThreadId = `admin-kb-${uniqueId()}`;

      // Index documents with isAdminKb flag set to true
      const indexResponse = await IndexDocuments(
        documentName,
        loadFileResponse.response,
        adminThreadId,
        true // Set as admin knowledge base document
      );

      // Check if all documents were indexed successfully
      const failedIndexes = indexResponse.filter(res => res.status !== "OK");
      
      if (failedIndexes.length > 0) {
        // Handle the case where errors might not exist or have a different structure
        const errorMessage = failedIndexes[0].status === "ERROR" && 
                             failedIndexes[0].errors && 
                             failedIndexes[0].errors[0]?.message
                           ? failedIndexes[0].errors[0].message
                           : "Failed to index some documents";
        throw new Error(errorMessage);
      }

      setUploadStatus({
        success: true,
        message: `Successfully added ${loadFileResponse.response.length} document chunks to the admin knowledge base`,
      });
      
      // Reset the form
      event.currentTarget.reset();
      setFileName("");
      
    } catch (error) {
      console.error("Error uploading document:", error);
      setUploadStatus({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Admin Knowledge Base</CardTitle>
        <CardDescription>
          Upload documents to the centralized knowledge base for all users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Document</TabsTrigger>
            <TabsTrigger value="manage">Manage Knowledge Base</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <form onSubmit={handleFileUpload} className="space-y-4 mt-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="document-name">Document Name (Optional)</Label>
                <Input
                  id="document-name"
                  placeholder="Enter a descriptive name for this document"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>
              
              <div className="grid w-full gap-1.5">
                <Label htmlFor="file">Document File (PDF, DOCX, TXT)</Label>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Upload to Knowledge Base
                  </>
                )}
              </Button>
              
              {uploadStatus && (
                <div className={`p-3 rounded-xs ${uploadStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {uploadStatus.message}
                </div>
              )}
            </form>
          </TabsContent>
          
          <TabsContent value="manage">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <FileUpIcon className="h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Knowledge Base Management</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Management functionality coming soon. This will allow you to view, categorize, and delete documents from the centralized knowledge base.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Documents added to the admin knowledge base will be available to all users.
        </p>
      </CardFooter>
    </Card>
  );
} 