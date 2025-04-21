import { ChatHome } from "@/features/chat-home-page/chat-home";
import { FindAllExtensionsForCurrentUser } from "@/features/extensions-page/extension-services/extension-service";
import { FindAllPersonaForCurrentUser } from "@/features/persona-page/persona-services/persona-service";
import { DisplayError } from "@/features/ui/error/display-error";

export default async function Home() {
  const [personaResponse, extensionResponse] = await Promise.all([
    FindAllPersonaForCurrentUser(),
    FindAllExtensionsForCurrentUser(),
  ]);

  if (personaResponse.status !== "OK") {
    return <DisplayError errors={personaResponse.errors} />;
  }

  if (extensionResponse.status !== "OK") {
    return <DisplayError errors={extensionResponse.errors} />;
  }
  
  return (
    <div className="flex flex-col min-h-screen" data-slot="chat-home-page">
      <ChatHome
        personas={personaResponse.response}
        extensions={extensionResponse.response}
      />
    </div>
  );
}
