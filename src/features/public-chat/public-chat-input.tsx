"use client";

import { Button } from "@/features/ui/button";
import { Textarea } from "@/features/ui/textarea";
import { SendHorizontal } from "lucide-react";
import { ChangeEvent, FormEvent, useRef } from "react";
import { publicChatStore, usePublicChat } from "./public-chat-store";

export const PublicChatInput = () => {
  const { input, loading } = usePublicChat();
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    publicChatStore.updateInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    publicChatStore.submitChat(e);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="relative bg-background pt-2 border-t mb-6">
      <div className="mx-auto max-w-3xl px-4 relative">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="relative flex flex-col w-full"
        >
          <div className="relative flex items-center">
            <Textarea
              ref={textareaRef}
              onChange={updateInput}
              value={input}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              className="min-h-12 resize-none pr-20 py-3"
              rows={1}
            />
            <div className="absolute right-2 flex items-center">
              <Button
                type="submit"
                size="icon"
                className={`shrink-0 ${loading === "loading" ? "opacity-50" : ""}`}
                disabled={loading === "loading" || !input.trim()}
              >
                <SendHorizontal className="h-5 w-5" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
          <div className="px-2 pb-2">
            <p className="text-xs text-muted-foreground">
              This is a limited public chat demo. 
              <a href="/auth/signin" className="text-primary underline ml-1">Sign in</a> for full access.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}; 