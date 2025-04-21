import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Info } from "lucide-react";
import { FC } from "react";
import { Button, dsButtonOutline } from "../../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";
import { PersonaModel } from "../persona-services/models";

interface Props {
  persona: PersonaModel;
}

export const ViewPersona: FC<Props> = (props) => {
  const { persona } = props;
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className={`${dsButtonOutline} min-h-11 md:min-h-10 flex-1 w-full sm:w-auto gap-2`}
          title="View persona details"
          data-slot="view-persona-button"
        >
          <Info className="size-5" />
          View Details
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[480px] sm:w-[540px] border-l-2 border-border rounded-xs" data-slot="persona-details">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">{persona.name}</SheetTitle>
          <SheetDescription>{persona.description}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 -mx-6 flex mt-6" type="always">
          <div className="p-6 flex gap-6 flex-col flex-1">
            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-base">Persona Definition</h3>
              <Textarea
                disabled
                className="min-h-[300px] rounded-xs"
                defaultValue={persona.persona_message}
                name="personaMessage"
                placeholder="Personality of your persona"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {persona.isPublished
                  ? `This is published and everyone in your organisation can use ${persona.name} persona`
                  : "This is only visible to you"}
              </p>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
