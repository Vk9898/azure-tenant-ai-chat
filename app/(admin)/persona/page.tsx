import { FC } from "react";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { AddNewPersona } from "../../../components/persona-page/add-new-persona";
import { PersonaCard } from "../../../components/persona-page/persona-card/persona-card";
import { PersonaHero } from "../../../components/persona-page/persona-hero/persona-hero";
import { PersonaModel } from "../../../components/persona-page/persona-services/models";
import { FindAllPersonasForAdmin } from "../../../components/persona-page/persona-services/persona-service";
import { DisplayError } from "../../../components/ui/error/display-error";

interface ChatPersonaProps {
  personas: PersonaModel[];
}

const ChatPersonaComponent: FC<ChatPersonaProps> = (props) => {
  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col">
        <PersonaHero />
        
        <div className="container max-w-4xl py-8">
          {props.personas && props.personas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {props.personas.map((persona) => {
                return (
                  <PersonaCard
                    persona={persona}
                    key={persona.id}
                    showContextMenu
                  />
                );
              })}
            </div>
          ) : (
            <div className="border-2 border-dashed border-border p-6 sm:p-8 flex flex-col items-center justify-center text-center rounded-xs" data-slot="empty-state">
              <p className="text-muted-foreground mb-4">No personas created</p>
            </div>
          )}
        </div>
        
        <AddNewPersona />
      </main>
    </ScrollArea>
  );
};

export default async function PersonaPage() {
  try {
    const result = await FindAllPersonasForAdmin();
    
    if ('error' in result || !Array.isArray(result)) {
      return <DisplayError errors={[{ message: "Failed to load personas" }]} />;
    }
    
    return <ChatPersonaComponent personas={result} />;
  } catch (error) {
    console.error("Error fetching personas:", error);
    return <DisplayError errors={[{ message: "Error fetching personas" }]} />;
  }
}
