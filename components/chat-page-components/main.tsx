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
      <ChatMessageContainer ref={current} className="flex-1 py-4 sm:py-6 pb-32 sm:pb-24">
        <ChatMessageContentArea className="container max-w-3xl px-4 sm:px-6 mx-auto space-y-8 sm:space-y-10">
          {messages.map((message) => (
            <ChatMessageArea
              key={message.id}
              profileName={message.name}
              role={message.role}
              onCopy={() => {
                navigator.clipboard.writeText(message.content);
              }}
              profilePicture={
                message.role === "assistant"
                  ? "/ai-icon.png"
                  : session?.user?.image
              }
              className="rounded-xs"
              data-slot={`message-${message.role}`}
            >
              <MessageContent message={message} />
            </ChatMessageArea>
          ))}
          {loading === "loading" && <ChatLoading />}
        </ChatMessageContentArea>
      </ChatMessageContainer>
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border pb-safe" data-slot="chat-input-container">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <ChatInput />
        </div>
      </div>
    </main>
  );
};
