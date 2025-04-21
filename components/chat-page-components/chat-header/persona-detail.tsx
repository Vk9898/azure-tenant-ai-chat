import { CHAT_DEFAULT_SYSTEM_PROMPT } from "@/components/theme/theme-config";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { VenetianMask } from "lucide-react";
import { FC } from "react";
import { ChatThreadModel } from "../chat-services/models";

interface Props {
  chatThread: ChatThreadModel;
}

export const PersonaDetail: FC<Props> = (props) => {
  const persona = props.chatThread.personaMessageTitle;
  const personaMessage = props.chatThread.personaMessage;
  return (
    <Sheet>
      <SheetTrigger asChild>
        {/* Ensure button uses DS styles: rounded-xs, variant=outline, size=icon */}
        <Button variant={"outline"} size={"icon"} className="rounded-xs h-9 w-9" aria-label="Current Chat Persona Menu">
          <VenetianMask size={16} />
        </Button>
      </SheetTrigger>
      {/* SheetContent uses DS styles internally */}
      <SheetContent className="min-w-[400px] sm:w-[480px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Persona</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 -mx-6 flex" type="always">
          {/* Use consistent padding and gap */}
          <div className="pb-6 px-6 flex gap-6 flex-col flex-1" data-slot="persona-details">
             {/* Section for Persona Name */}
            <div className="grid gap-2" data-slot="persona-name">
              <Label className="text-sm font-medium">Name</Label>
              <div className="text-sm text-foreground p-3 border-2 border-border rounded-xs bg-muted/50 shadow-xs">{persona || "Default"}</div>
            </div>

             {/* Section for Persona Personality */}
            <div className="grid gap-2 flex-1" data-slot="persona-personality">
              <Label className="text-sm font-medium" htmlFor="personaMessage">Personality</Label>
              {/* Use consistent styling for displaying pre-formatted text */}
              <div className="text-sm text-foreground p-3 border-2 border-border rounded-xs bg-muted/50 shadow-xs min-h-[100px] whitespace-pre-wrap">{CHAT_DEFAULT_SYSTEM_PROMPT}</div>
              {personaMessage && (
                <div className="text-sm text-foreground p-3 border-2 border-border rounded-xs bg-muted/50 shadow-xs min-h-[100px] whitespace-pre-wrap">{personaMessage}</div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};