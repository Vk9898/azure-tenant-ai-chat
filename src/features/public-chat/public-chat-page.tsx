"use client";
import { FC, useEffect, useRef } from "react";
import { useChatScrollAnchor } from "@/features/ui/chat/chat-message-area/use-chat-scroll-anchor";
import { ChatLoading } from "@/features/ui/chat/chat-message-area/chat-loading";
import { ChatMessageArea } from "@/features/ui/chat/chat-message-area/chat-message-area";
import ChatMessageContainer from "@/features/ui/chat/chat-message-area/chat-message-container";
import ChatMessageContentArea from "@/features/ui/chat/chat-message-area/chat-message-content";
import { PublicChatInput } from "./public-chat-input";
import { publicChatStore, usePublicChat } from "./public-chat-store";
import MessageContent from "./message-content";

export const PublicChatPage: FC = () => {
  const { messages, loading } = usePublicChat();
  const current = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session
    publicChatStore.initChatSession();
  }, []);

  useChatScrollAnchor({ ref: current });

  return (
    <main className="flex flex-1 relative flex-col">
      <div className="p-4 border-b bg-primary/5 text-center">
        <h1 className="text-xl font-semibold">Public Chat Demo</h1>
        <p className="text-sm text-muted-foreground">
          Try our AI assistant without signing in. For full features, please login.
        </p>
      </div>
      <ChatMessageContainer ref={current}>
        <ChatMessageContentArea>
          {messages.map((message) => {
            return (
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
                    : undefined
                }
              >
                <MessageContent message={message} />
              </ChatMessageArea>
            );
          })}
          {loading === "loading" && <ChatLoading />}
        </ChatMessageContentArea>
      </ChatMessageContainer>
      <PublicChatInput />
    </main>
  );
}; 