"use client";

import { RedirectToChatThread } from "@/components/common/navigation-helpers";
import { showError } from "@/components/globals/global-message-store";
import { LoadingIndicator } from "@/components/ui/loading";
import { MessageCircle } from "lucide-react";
import { FC, useState } from "react";
import { Button, dsButtonPrimary } from "../../ui/button";
import { PersonaModel } from "../persona-services/models";
import { CreatePersonaChat } from "../persona-services/persona-service";

interface Props {
  persona: PersonaModel;
}

export const StartNewPersonaChat: FC<Props> = (props) => {
  const { persona } = props;
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Button
      className={`${dsButtonPrimary} flex-1 gap-2 min-h-11 md:min-h-10 w-full sm:w-auto`}
      onClick={async () => {
        setIsLoading(true);
        const response = await CreatePersonaChat(persona.id);
        if (response.status === "OK") {
          RedirectToChatThread(response.response.id);
        } else {
          showError(response.errors.map((e) => e.message).join(", "));
        }
        setIsLoading(false);
      }}
      data-slot="start-chat-button"
    >
      {isLoading ? (
        <LoadingIndicator isLoading={isLoading} />
      ) : (
        <MessageCircle className="size-5" />
      )}
      Start Chat
    </Button>
  );
};
