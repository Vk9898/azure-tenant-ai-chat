import { ChatPage } from "@/components/chat-page-components/main";
import { FindAllChatDocuments } from "@/components/chat-page-components/chat-services/chat-document-service";
import { FindAllChatMessagesForCurrentUser } from "@/components/chat-page-components/chat-services/chat-message-service";
import { FindChatThreadForCurrentUser } from "@/components/chat-page-components/chat-services/chat-thread-service";
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

   // Prioritize checking chat thread existence and authorization
  if (chatThreadResponse.status === "NOT_FOUND") {
     return <DisplayError errors={[{ message: "Chat not found." }]} />;
  }
  if (chatThreadResponse.status === "UNAUTHORIZED") {
     return <DisplayError errors={[{ message: "Unauthorized to view this chat." }]} />;
  }
   if (chatThreadResponse.status !== "OK") {
    return <DisplayError errors={chatThreadResponse.errors} />;
  }

  if (docsResponse.status !== "OK") {
    // Log error but don't block chat rendering if docs fail
    console.error("Failed to load chat documents:", docsResponse.errors);
    // return <DisplayError errors={docsResponse.errors} />; // Optional: block if docs are critical
  }

  if (chatResponse.status !== "OK") {
     // If messages fail, log but maybe show chat anyway? Or error.
     console.error("Failed to load chat messages:", chatResponse.errors);
    return <DisplayError errors={chatResponse.errors} />;
  }

  if (extensionResponse.status !== "OK") {
     // Log error but don't block chat rendering if extensions fail
     console.error("Failed to load extensions:", extensionResponse.errors);
    // return <DisplayError errors={extensionResponse.errors} />; // Optional: block if extensions are critical
  }


  // Ensure the main container fills the available space within the chat layout
  return (
    <div className="flex flex-1 flex-col" data-slot="chat-thread-page"> {/* Use flex-1 */}
      <ChatPage
        messages={chatResponse.response}
        chatThread={chatThreadResponse.response}
        chatDocuments={docsResponse.status === "OK" ? docsResponse.response : []} // Pass empty array on error
        extensions={extensionResponse.status === "OK" ? extensionResponse.response : []} // Pass empty array on error
      />
    </div>
  );
}