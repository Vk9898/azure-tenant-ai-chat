import { Button } from "@/features/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/features/ui/card";
import { Checkbox, CheckedState } from "../ui/checkbox";
import { Input } from "@/features/ui/input";
import { Label } from "@/features/ui/label";
import { Textarea } from "@/features/ui/textarea";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ExtensionData } from "./extension-card";

interface ExtensionFormProps {
  extension?: ExtensionData;
  onSave: (extension: Partial<ExtensionData>) => void;
  onCancel: () => void;
  isAdmin?: boolean;
}

export function ExtensionForm({
  extension,
  onSave,
  onCancel,
  isAdmin = false,
}: ExtensionFormProps) {
  const [name, setName] = useState(extension?.name || "");
  const [description, setDescription] = useState(extension?.description || "");
  const [isActive, setIsActive] = useState<boolean>(extension?.isActive ?? true);
  const [isAdminExtension, setIsAdminExtension] = useState<boolean>(extension?.isAdmin ?? false);
  const [jsonContent, setJsonContent] = useState('{\n  "name": "example_function",\n  "parameters": {\n    "type": "object",\n    "properties": {\n      "query": {\n        "type": "object",\n        "description": "Query parameters",\n        "properties": {\n          "search_term": {\n            "type": "string",\n            "description": "The search term"\n          }\n        },\n        "required": ["search_term"]\n      }\n    },\n    "required": ["query"]\n  },\n  "description": "Description of the function"\n}');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      name,
      description,
      isActive,
      isAdmin: isAdminExtension,
      // Other fields would be handled in a real implementation
    });
  };

  return (
    <Card className="ds-card shadow-xs" data-slot="extension-form-card">
      <form onSubmit={handleSubmit}>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl font-bold">
            {extension ? "Edit Extension" : "Create Extension"}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            {extension
              ? "Update your extension configuration"
              : "Configure a new function extension for your AI chat"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Function Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="web_search"
              className="h-12 md:h-10 rounded-xs"
              required
              data-slot="extension-name"
            />
            <p className="text-xs text-muted-foreground">
              Use snake_case for your function name (e.g., web_search)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Search the web for real-time information"
              className="h-12 md:h-10 rounded-xs"
              required
              data-slot="extension-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="json" className="text-sm font-medium">
              Function JSON Schema
            </Label>
            <Textarea
              id="json"
              value={jsonContent}
              onChange={(e) => setJsonContent(e.target.value)}
              className="font-mono text-sm min-h-[200px] rounded-xs"
              required
              data-slot="extension-json"
            />
            <p className="text-xs text-muted-foreground">
              Define your function schema following the OpenAI function calling format
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked: CheckedState) => setIsActive(checked === true)}
                className="rounded-xs data-[state=checked]:bg-primary"
                data-slot="extension-active"
              />
              <Label
                htmlFor="isActive"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Extension is active
              </Label>
            </div>

            {isAdmin && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAdmin"
                  checked={isAdminExtension}
                  onCheckedChange={(checked: CheckedState) => setIsAdminExtension(checked === true)}
                  className="rounded-xs data-[state=checked]:bg-primary"
                  data-slot="extension-admin"
                />
                <Label
                  htmlFor="isAdmin"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Make available to all users (admin extension)
                </Label>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 sm:p-6 flex flex-col sm:flex-row sm:justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto rounded-xs font-medium"
            data-slot="cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="ds-button-primary w-full sm:w-auto"
            data-slot="save-button"
          >
            {extension ? "Update Extension" : "Create Extension"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 