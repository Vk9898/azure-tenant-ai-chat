"use client";
import { FC, useEffect, useRef } from "react";
import { useChatScrollAnchor } from "@/components/ui/chat/chat-message-area/use-chat-scroll-anchor";
import { ChatLoading } from "@/components/ui/chat/chat-message-area/chat-loading";
import { PublicChatInput } from "./public-chat-input";
import { usePublicChatStore } from "./public-chat-store"; // Fixed import
import MessageContent from "./message-content";
import { Button } from "@/components/ui/button";
import { Trash2, Info } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PublicChatMessageArea } from "./chat-message-area";
import ChatMessageContainer from "@/components/ui/chat/chat-message-area/chat-message-container";
import ChatMessageContentArea from "@/components/ui/chat/chat-message-area/chat-message-content";

export const PublicChatPage: FC = () => {
  const { messages, loading, initChatSession, clearChatHistory } = usePublicChatStore(); // Use the correct hook
  const current = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session with Guest username
    initChatSession("Guest");
  }, []); // Remove initChatSession from dependencies to avoid re-initialization

  useChatScrollAnchor({ ref: current });

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      clearChatHistory(); // Use the function from the hook
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
      <ChatMessageContainer ref={current} className="flex-1 py-4 sm:py-6 pb-32 sm:pb-24">
        <ChatMessageContentArea className="container max-w-3xl px-4 sm:px-6 mx-auto space-y-8 sm:space-y-10">
          {messages.map((message) => (
            <PublicChatMessageArea
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
              className="rounded-xs"
              data-slot={`message-${message.role}`}
            >
              <MessageContent message={message} />
            </PublicChatMessageArea>
          ))}
          {loading === "loading" && <ChatLoading />}
        </ChatMessageContentArea>
      </ChatMessageContainer>
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border pb-safe" data-slot="chat-input-container">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <PublicChatInput />
        </div>
      </div>
    </main>
  );
}; 