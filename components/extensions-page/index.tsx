"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { PlusCircle, Search } from "lucide-react";
import { useState } from "react";
import { ExtensionCard, ExtensionData } from "./extension-card";

const MOCK_EXTENSIONS: ExtensionData[] = [
  {
    id: "1",
    name: "web_search",
    description: "Search the web for real-time information about any topic",
    isActive: true,
    isAdmin: false,
    createdAt: new Date("2023-10-01"),
  },
  {
    id: "2",
    name: "citation_search",
    description: "Search for academic citations and research papers on a given topic",
    isActive: true,
    isAdmin: true,
    createdAt: new Date("2023-09-15"),
  },
  {
    id: "3",
    name: "news_search",
    description: "Search for recent news articles on a specific topic",
    isActive: false,
    isAdmin: false,
    createdAt: new Date("2023-08-20"),
  },
];

export default function ExtensionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("all");

  const handleSettings = (id: string) => {
    console.log(`Open settings for extension ${id}`);
    // Implementation would go here
  };

  const handleDelete = (id: string) => {
    console.log(`Delete extension ${id}`);
    // Implementation would go here
  };

  const filteredExtensions = MOCK_EXTENSIONS.filter((extension) => {
    // Filter by search query
    if (
      searchQuery &&
      !extension.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !extension.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Filter by tab
    if (currentTab === "active" && !extension.isActive) return false;
    if (currentTab === "inactive" && extension.isActive) return false;
    if (currentTab === "admin" && !extension.isAdmin) return false;
    if (currentTab === "personal" && extension.isAdmin) return false;

    return true;
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8" data-slot="extensions-page">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div>
          <h1 className="ds-section-title">Extensions</h1>
          <div className="ds-accent-bar"></div>
          <p className="text-muted-foreground">
            Enhance your AI chat with powerful extensions
          </p>
        </div>
        <Button className="ds-button-primary w-full sm:w-auto" data-slot="create-extension">
          <PlusCircle className="h-5 w-5 mr-2" />
          New Extension
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9">
          <Card className="ds-card shadow-xs mb-6" data-slot="search-card">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 h-12 md:h-10 rounded-xs"
                  placeholder="Search extensions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-slot="search-input"
                />
              </div>
            </CardContent>
          </Card>

          <Tabs 
            defaultValue="all" 
            onValueChange={setCurrentTab}
            className="mb-6"
            data-slot="extensions-tabs"
          >
            <TabsList className="bg-muted border border-border h-12 rounded-xs mb-4">
              <TabsTrigger 
                value="all"
                className="rounded-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold"
                data-slot="tab"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="active"
                className="rounded-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold"
                data-slot="tab"
              >
                Active
              </TabsTrigger>
              <TabsTrigger 
                value="inactive"
                className="rounded-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold"
                data-slot="tab"
              >
                Inactive
              </TabsTrigger>
              <TabsTrigger 
                value="admin"
                className="rounded-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold"
                data-slot="tab"
              >
                Admin
              </TabsTrigger>
              <TabsTrigger 
                value="personal"
                className="rounded-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold"
                data-slot="tab"
              >
                Personal
              </TabsTrigger>
            </TabsList>

            {/* Content for all tabs is the same, just filtered differently */}
            {["all", "active", "inactive", "admin", "personal"].map((tab) => (
              <TabsContent 
                key={tab} 
                value={tab} 
                className="space-y-4 sm:space-y-6"
                data-slot="tab-content"
              >
                {filteredExtensions.length === 0 ? (
                  <div 
                    className="border-2 border-dashed border-border p-6 sm:p-8 rounded-xs flex flex-col items-center justify-center text-center"
                    data-slot="empty-state"
                  >
                    <Search className="h-10 sm:h-12 w-10 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                    <h3 className="text-lg font-bold mb-1 sm:mb-2">No Extensions Found</h3>
                    <p className="text-muted-foreground mb-3 sm:mb-4">
                      Try adjusting your search or filters, or create a new extension
                    </p>
                    <Button className="ds-button-primary min-h-11">Create Extension</Button>
                  </div>
                ) : (
                  filteredExtensions.map((extension) => (
                    <ExtensionCard
                      key={extension.id}
                      extension={extension}
                      onSettings={handleSettings}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="lg:col-span-3">
          <Card className="ds-card shadow-xs sticky top-6" data-slot="info-card">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base font-bold">About Extensions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Extensions enhance your AI chat by connecting it to internal APIs or external resources.
                </p>
                <p>
                  Create your own extensions to access specific data sources, perform custom calculations, or integrate with your company's tools.
                </p>
                <p>
                  Admin extensions are available to all users in your organization, while personal extensions are only available to you.
                </p>
              </div>
            </CardContent>
            <CardFooter className="p-4 sm:p-6 pt-0 sm:pt-0">
              <Button 
                variant="outline" 
                className="w-full rounded-xs font-medium"
                onClick={() => window.open("/docs/extensions", "_blank")}
                data-slot="learn-more"
              >
                Learn More
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 