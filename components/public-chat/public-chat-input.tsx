"use client";

import { FC, KeyboardEvent, useRef, FormEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { Send } from "lucide-react";
import { usePublicChatStore } from "./public-chat-store"; // Correct import

export const PublicChatInput: FC = () => {
  const { input, loading, updateInput, submitChat } = usePublicChatStore(); // Use the correct hook
  const formRef = useRef<HTMLFormElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitChat(e as FormEvent<HTMLFormElement>); // Use the function from the hook
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="w-full"
    >
      <div className="flex gap-3 items-end">
        <div className="flex-1 rounded-xs border-2 border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ds-focus-ring">
          <Textarea
            placeholder="Send a message..."
            value={input}
            onChange={(e) => updateInput(e.target.value)} // Use the function from the hook
            onKeyDown={handleKeyDown}
            rows={Math.min(Math.max(input.split('\n').length, 1), 5)}
            className="min-h-[44px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xs"
            data-slot="chat-textarea"
          />
        </div>
        <Button
          type="submit"
          size="icon"
          className={`${buttonVariants({ variant: "default" })} h-11 w-11 rounded-xs min-h-11 min-w-11`}
          disabled={input.trim().length === 0 || loading === "loading"}
          data-slot="send-button"
        >
          <Send className="h-5 w-5" strokeWidth={2.5} />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Public chat messages are stored in your browser&apos;s local storage and are not permanently saved to a server.
      </p>
    </form>
  );
}; 