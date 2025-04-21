import { ChatPage } from "@/components/chat-page/main";
import { FindAllChatDocuments } from "@/components/chat-page/chat-services/chat-document-service";
import { FindAllChatMessagesForCurrentUser } from "@/components/chat-page/chat-services/chat-message-service";
import { FindChatThreadForCurrentUser } from "@/components/chat-page/chat-services/chat-thread-service";
import { FindAllExtensionsForCurrentUser } from "@/components/extensions-page/extension-services/extension-service";
import { AI_NAME } from "@/components/theme/theme-config";
import { DisplayError } from "@/components/ui/error/display-error";

export const metadata = {
  title: AI_NAME,
  description: AI_NAME,
};

interface HomeParams {
  params: Promise<{
    id: string;
  }>;
}

export default async function Home(props: HomeParams) {
  const { id } = (await props.params);
  const [chatResponse, chatThreadResponse, docsResponse, extensionResponse] =
    await Promise.all([
      FindAllChatMessagesForCurrentUser(id),
      FindChatThreadForCurrentUser(id),
      FindAllChatDocuments(id),
      FindAllExtensionsForCurrentUser(),
    ]);

  if (docsResponse.status !== "OK") {
    return <DisplayError errors={docsResponse.errors} />;
  }

  if (chatResponse.status !== "OK") {
    return <DisplayError errors={chatResponse.errors} />;
  }

  if (extensionResponse.status !== "OK") {
    return <DisplayError errors={extensionResponse.errors} />;
  }

  if (chatThreadResponse.status !== "OK") {
    return <DisplayError errors={chatThreadResponse.errors} />;
  }

  return (
    <div className="flex flex-col min-h-screen" data-slot="chat-thread-page">
      <ChatPage
        messages={chatResponse.response}
        chatThread={chatThreadResponse.response}
        chatDocuments={docsResponse.response}
        extensions={extensionResponse.response}
      />
    </div>
  );
}
