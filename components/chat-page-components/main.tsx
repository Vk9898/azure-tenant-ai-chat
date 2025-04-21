"use client";
import { ChatInput } from "@/components/chat-page-components/chat-input/chat-input";
import { chatStore, useChat } from "@/components/chat-page-components/chat-store";
import { ChatLoading } from "@/components/ui/chat/chat-message-area/chat-loading";
import { ChatMessageArea } from "@/components/ui/chat/chat-message-area/chat-message-area";
import ChatMessageContainer from "@/components/ui/chat/chat-message-area/chat-message-container";
import ChatMessageContentArea from "@/components/ui/chat/chat-message-area/chat-message-content";
import { useChatScrollAnchor } from "@/components/ui/chat/chat-message-area/use-chat-scroll-anchor";
import { useSession } from "next-auth/react";
import { FC, useEffect, useRef } from "react";
import { ExtensionModel } from "../extensions-page/extension-services/models";
import { ChatHeader } from "./chat-header/chat-header";
import {
  ChatDocumentModel,
  ChatMessageModel,
  ChatThreadModel,
} from "./chat-services/models";
import MessageContent from "./message-content";
import { cn } from "@/lib/utils";

interface ChatPageProps {
  messages: Array<ChatMessageModel>;
  chatThread: ChatThreadModel;
  chatDocuments: Array<ChatDocumentModel>;
  extensions: Array<ExtensionModel>;
}

export const ChatPage: FC<ChatPageProps> = (props) => {
  const { data: session } = useSession();

  useEffect(() => {
    chatStore.initChatSession({
      chatThread: props.chatThread,
      messages: props.messages,
      userName: session?.user?.name!,
    });
  }, [props.messages, session?.user?.name, props.chatThread]);

  const { messages, loading } = useChat();

  const current = useRef<HTMLDivElement>(null);

  useChatScrollAnchor({ ref: current });

  return (
    <main className="flex flex-1 relative flex-col" data-slot="chat-page">
      <ChatHeader
        chatThread={props.chatThread}
        chatDocuments={props.chatDocuments}
        extensions={props.extensions}
      />
      {/* Adjusted container padding/spacing */}
      <ChatMessageContainer ref={current} className={cn("flex-1", "py-4 sm:py-6", "pb-[150px]")}> {/* Reduced bottom padding */}
        <ChatMessageContentArea className="container max-w-3xl px-4 sm:px-6 mx-auto"> {/* Removed space-y, gap is handled by content area */}
          {messages.map((message) => (
            <ChatMessageArea
              key={message.id}
              profileName={message.name}
              role={message.role}
              onCopy={() => {
                navigator.clipboard.writeText(message.content);
              }}
              profilePicture={
                message.role === "user"
                  ? session?.user?.image
                  : undefined // Assistant/Tool uses default icons handled internally
              }
              className="bg-card text-card-foreground border-2 border-border shadow-xs mb-4 sm:mb-6" // Added card-like styling and margin bottom
              data-slot={`message-${message.role}`}
            >
              <MessageContent message={message} />
            </ChatMessageArea>
          ))}
          {loading === "loading" && <ChatLoading />}
        </ChatMessageContentArea>
      </ChatMessageContainer>
      {/* Updated border to border-t-2 */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t-2 border-border pb-safe z-10" data-slot="chat-input-outer-container">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6 py-3" data-slot="chat-input-inner-container"> {/* Adjusted padding */}
          <ChatInput />
        </div>
      </div>
    </main>
  );
};