"use client";

import { FC, KeyboardEvent, useState } from "react";
import { Textarea } from "@/features/ui/textarea";
import { Button, dsButtonPrimary } from "@/features/ui/button";
import { Send } from "lucide-react";
import { usePublicChat } from "./public-chat-store";

export const PublicChatInput: FC = () => {
  const { sendMessage } = usePublicChat();
  const [message, setMessage] = useState("");
  const [inputRows, setInputRows] = useState(1);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Calculate rows based on content (with min/max limits)
    const rowCount = e.target.value.split('\n').length;
    const calculatedRows = Math.min(Math.max(rowCount, 1), 5);
    setInputRows(calculatedRows);
  };

  const handleSubmit = () => {
    const trimmedMessage: string = message.trim();
    if (trimmedMessage.length > 0) {
      sendMessage(trimmedMessage);
      setMessage("");
      setInputRows(1);
    }
  };

  return (
    <div className="border-t-2 border-border bg-background p-4 sm:p-6 pb-safe" data-slot="chat-input-container">
      <div className="container max-w-4xl mx-auto">
        <div className="flex gap-3 items-end">
          <div className="flex-1 rounded-xs border-2 border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ds-focus-ring">
            <Textarea
              placeholder="Send a message..."
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
              rows={inputRows}
              className="min-h-[44px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xs"
              data-slot="chat-textarea"
            />
          </div>
          <Button
            size="icon"
            className={`${dsButtonPrimary} h-11 w-11 rounded-xs min-h-11 min-w-11`}
            disabled={message.trim().length === 0}
            onClick={handleSubmit}
            data-slot="send-button"
          >
            <Send className="h-5 w-5" strokeWidth={2.5} />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Messages are stored in your browser&apos;s local storage and not sent to a server.
        </p>
      </div>
    </div>
  );
}; 