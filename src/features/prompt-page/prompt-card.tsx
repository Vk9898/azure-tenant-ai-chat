import { FC } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { PromptModel } from "./models";
import { PromptCardContextMenu } from "./prompt-card-context-menu";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { promptStore } from "./prompt-store";
import { CalendarDays, NotebookPen } from "lucide-react";

interface Props {
  prompt: PromptModel;
  showContextMenu: boolean;
}

export const PromptCard: FC<Props> = (props) => {
  const { prompt } = props;
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  return (
    <Card key={prompt.id} className="ds-card shadow-xs hover:border-primary/50 transition-all duration-200 flex flex-col h-full">
      <CardHeader className="p-4 sm:p-5 pb-0 sm:pb-0 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg line-clamp-1">{prompt.name}</CardTitle>
          {props.showContextMenu && <PromptCardContextMenu prompt={prompt} />}
        </div>
        
        <Badge variant={prompt.isPublished ? "success" : "secondary"} className="w-fit text-[10px] font-medium">
          {prompt.isPublished ? "Published" : "Draft"}
        </Badge>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-5 pt-3 sm:pt-3 flex-1">
        <p className="text-muted-foreground text-sm line-clamp-4">
          {prompt.description}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 sm:p-5 pt-2 sm:pt-2 flex flex-col gap-3">
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarDays className="size-3.5 mr-1.5" />
          {formatDate(prompt.createdAt)}
        </div>
        
        <Button 
          variant="outline" 
          className="w-full justify-center gap-2 rounded-xs mt-1"
          onClick={() => promptStore.updatePrompt(prompt)}
        >
          <NotebookPen className="size-4" />
          <span>Edit Prompt</span>
        </Button>
      </CardFooter>
    </Card>
  );
};
