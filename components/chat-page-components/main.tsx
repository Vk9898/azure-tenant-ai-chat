"use client";
import { ChatInput } from "@/components/chat-page-components/chat-input/chat-input";
import { chatStore, useChat } from "@/components/chat-page-components/chat-store";
import { ChatLoading } from "@/components/ui/chat/chat-message-area/chat-loading";
import { ChatMessageArea } from "@/components/ui/chat/chat-message-area/chat-message-area";
import ChatMessageContainer from "@/components/ui/chat/chat-message-area/chat-message-container";
import ChatMessageContentArea from "@/components/ui/chat/chat-message-area/chat-message-content";
import { useChatScrollAnchor } from "@/components/ui/chat/chat-message-area/use-chat-scroll-anchor";
import { cn } from "@/lib/utils";
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

interface ChatPageProps {
  messages: Array<ChatMessageModel>;
  chatThread: ChatThreadModel;
  chatDocuments: Array<ChatDocumentModel>;
  extensions: Array<ExtensionModel>;
}

export const ChatPage: FC<ChatPageProps> = (props) => {
  const { data: session } = useSession();

  useEffect(() => {
    // Ensure userName is not null/undefined, provide a fallback
    const userName = session?.user?.name ?? "User";
    chatStore.initChatSession({
      chatThread: props.chatThread,
      messages: props.messages,
      userName: userName,
    });
  }, [props.chatThread, props.messages, session?.user?.name]); // Dependency array order doesn't matter, but list all dependencies

  const { messages, loading } = useChat();

  const scrollRef = useRef<HTMLDivElement>(null);

  useChatScrollAnchor({ ref: scrollRef });

  return (
    // Use flex column layout for the entire page height
    <main className="flex flex-1 flex-col h-full max-h-full overflow-hidden" data-slot="chat-page">
      <ChatHeader
        chatThread={props.chatThread}
        chatDocuments={props.chatDocuments}
        extensions={props.extensions}
      />
      {/* Message container takes up remaining space and handles scrolling */}
      <ChatMessageContainer ref={scrollRef} className="flex-1 overflow-y-auto">
        {/* Content area handles container, max-width, internal padding and gap */}
        <ChatMessageContentArea>
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
              // Style consistency handled by the component itself
              data-slot={`message-${message.role}`}
            >
              <MessageContent message={message} />
            </ChatMessageArea>
          ))}
          {loading === "loading" && <ChatLoading />}
        </ChatMessageContentArea>
      </ChatMessageContainer>

      {/* Fixed Input Area at the bottom */}
      <div className="shrink-0 border-t-2 border-border bg-background/80 backdrop-blur-md" data-slot="chat-input-outer-container">
        {/* Container for input with responsive padding and safe area handling */}
        <div className="container max-w-3xl mx-auto px-4 py-2 pb-safe" data-slot="chat-input-inner-container">
          <ChatInput />
        </div>
      </div>
    </main>
  );
};