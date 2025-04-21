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
import { Button, dsButtonOutline } from "@/features/ui/button";
import { Trash2, Info } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/features/ui/tooltip";

export const PublicChatPage: FC = () => {
  const { messages, loading } = usePublicChat();
  const current = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session
    publicChatStore.initChatSession();
  }, []);

  useChatScrollAnchor({ ref: current });

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      publicChatStore.clearChatHistory();
    }
  };

  return (
    <main className="flex flex-1 relative flex-col" data-slot="public-chat-page">
      <div className="p-4 sm:p-6 border-b-2 border-border bg-primary/5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="ds-section-title">Public Chat Demo</h1>
            <div className="ds-accent-bar"></div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearChat}
                    className="h-10 w-10 rounded-xs ds-touch-target"
                    uppercase={false}
                    data-slot="clear-button"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Clear Chat</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="rounded-xs">
                  <p>Clear chat history</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground bg-background/50 p-4 rounded-xs border-2 border-border shadow-xs" data-slot="info-box">
          <Info className="h-5 w-5 text-primary flex-shrink-0" />
          <p>
            This is a demo with limited functionality. Public chats are stored only in your browser and not saved to a database. For full features and persistent chats, please login.
          </p>
        </div>
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