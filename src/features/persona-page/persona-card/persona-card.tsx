import { FC } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  dsCard
} from "../../ui/card";
import { PersonaModel } from "../persona-services/models";
import { PersonaCardContextMenu } from "./persona-card-context-menu";
import { ViewPersona } from "./persona-view";
import { StartNewPersonaChat } from "./start-new-persona-chat";

interface Props {
  persona: PersonaModel;
  showContextMenu: boolean;
}

export const PersonaCard: FC<Props> = (props) => {
  const { persona } = props;
  return (
    <Card className={`${dsCard} flex flex-col h-full`} data-slot="persona-card">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-row justify-between items-start">
          <CardTitle className="flex-1 text-lg font-bold">{persona.name}</CardTitle>
          {props.showContextMenu && (
            <div>
              <PersonaCardContextMenu persona={persona} />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="text-muted-foreground flex-1 p-4 pt-0 sm:p-6 sm:pt-0">
        {persona.description}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3 p-4 pt-0 sm:p-6 sm:pt-0">
        {props.showContextMenu && <ViewPersona persona={persona} />}
        <StartNewPersonaChat persona={persona} />
      </CardFooter>
    </Card>
  );
};
