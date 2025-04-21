import { FC } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TerminalSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatObservabilityDashboard } from "@/components/admin-dashboard-components/chat-observability/chat-observability-dashboard";
import { ChatPlayground } from "@/components/admin-dashboard-components/chat-observability/chat-playground";

const ChatObservabilityPage: FC = () => {
  return (
    <ScrollArea className="flex-1">
      <Tabs defaultValue="dashboard" className="w-full">
        <div className="border-b border-border bg-muted/30 sticky top-0 z-10">
          <div className="container max-w-6xl px-4 sm:px-6">
            <TabsList className="border-0 bg-transparent h-14 px-0">
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none transition-none h-full"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="playground" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none transition-none h-full"
              >
                <TerminalSquare className="mr-2 h-4 w-4" />
                Chat Playground
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="dashboard" className="mt-0 border-none">
          <ChatObservabilityDashboard />
        </TabsContent>
        
        <TabsContent value="playground" className="mt-0 border-none">
          <ChatPlayground />
        </TabsContent>
      </Tabs>
    </ScrollArea>
  );
};

export default ChatObservabilityPage; 