import { ChatHome } from "@/app/chat-home-page/page";
import { FindAllExtensionsForCurrentUser } from "@/components/extensions-page/extension-services/extension-service";
import { FindAllPersonaForCurrentUser } from "@/components/persona-page/persona-services/persona-service";
import { DisplayError } from "@/components/ui/error/display-error";

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
