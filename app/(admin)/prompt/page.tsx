import { FC } from "react";

import { DisplayError } from "../../../components/ui/error/display-error";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { AddPromptSlider } from "../../../components/prompt-page/add-new-prompt";
import { PromptCard } from "../../../components/prompt-page/prompt-card";
import { PromptHero } from "../../../components/prompt-page/prompt-hero/prompt-hero";
import { FindAllPrompts } from "../../../components/prompt-page/prompt-service";
import { PlusCircle, Search } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card } from "../../../components/ui/card";

interface ChatSamplePromptProps {
  prompts: Array<{
    id: string;
    name: string;
    type: "PROMPT";
    description: string;
    createdAt: Date;
    isPublished: boolean;
    userId: string;
  }>;
}

const ChatSamplePromptComponent: FC<ChatSamplePromptProps> = (props) => {
  const { prompts } = props;

  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col">
        <PromptHero />
        
        <div className="container max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="ds-section-title">Prompt Library</h2>
                <div className="ds-accent-bar"></div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="size-4 text-muted-foreground" />
                  </div>
                  <Input 
                    type="search" 
                    placeholder="Search prompts..." 
                    className="pl-10 h-12 md:h-10 rounded-xs w-full"
                  />
                </div>
                
                <AddPromptSlider>
                  <Button className="ds-button-primary h-12 md:h-10 gap-2">
                    <PlusCircle className="size-4" />
                    New Prompt
                  </Button>
                </AddPromptSlider>
              </div>
            </div>
          </div>
          
          {prompts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {prompts.map((prompt) => (
                <PromptCard prompt={prompt} key={prompt.id} showContextMenu />
              ))}
            </div>
          ) : (
            <Card className="ds-card border-dashed flex flex-col items-center justify-center text-center p-8 sm:p-12">
              <div className="text-muted-foreground mb-4">
                <PlusCircle className="mx-auto size-12 mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-bold mb-2">No Prompts Available</h3>
                <p className="text-sm mb-6">Start by creating your first prompt template</p>
              </div>
              
              <AddPromptSlider>
                <Button className="ds-button-primary">Create Prompt</Button>
              </AddPromptSlider>
            </Card>
          )}
        </div>
      </main>
    </ScrollArea>
  );
};

export default async function PromptPage() {
  try {
    const promptsResponse = await FindAllPrompts();

    if (promptsResponse.status !== "OK") {
      return <DisplayError errors={promptsResponse.errors} />;
    }

    return <ChatSamplePromptComponent prompts={promptsResponse.response} />;
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return <DisplayError errors={[{ message: "Error fetching prompts" }]} />;
  }
}
