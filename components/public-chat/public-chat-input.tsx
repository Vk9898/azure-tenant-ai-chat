"use client";

import { FC, KeyboardEvent, useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { Send } from "lucide-react";
import { nanoid } from "nanoid";

export const PublicChatInput: FC = () => {
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

  const handleSubmit = async () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage.length > 0) {
      // Direct implementation without using store methods
      // This simulates what the store would do
      const STORAGE_KEY = "public-chat-messages";
      
      // Add user message
      const userMessage = {
        id: nanoid(),
        role: "user",
        name: "You",
        content: trimmedMessage,
        timestamp: Date.now(),
      };
      
      // Get existing messages
      let messages = [];
      try {
        const savedMessages = localStorage.getItem(STORAGE_KEY);
        if (savedMessages) {
          messages = JSON.parse(savedMessages);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      }
      
      // Add user message
      messages.push(userMessage);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      
      // Force a reload to update the UI
      window.dispatchEvent(new Event('storage'));
      
      // Wait 1 second then add AI response
      setTimeout(() => {
        const aiMessage = {
          id: nanoid(),
          role: "assistant",
          name: "Azure AI",
          content: `You said: "${trimmedMessage}"\n\nThis is a demo chat that shows your messages echoed back to you. Sign in for a full chat experience with Azure OpenAI.`,
          timestamp: Date.now(),
        };
        
        messages.push(aiMessage);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        
        // Force a reload to update the UI
        window.dispatchEvent(new Event('storage'));
      }, 1000);
      
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
            className={`${buttonVariants({ variant: "default" })} h-11 w-11 rounded-xs min-h-11 min-w-11`}
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