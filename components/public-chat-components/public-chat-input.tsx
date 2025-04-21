"use client";

import { FC, KeyboardEvent, useRef, FormEvent, useState, ChangeEvent } from "react";
import { usePublicChatStore } from "./public-chat-store";
import { cn } from "@/lib/utils";

export const PublicChatInput: FC = () => {
  const store = usePublicChatStore();
  const [localInput, setLocalInput] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalInput(value);
    store.updateInput(value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (localInput.trim() === "" || store.loading === "loading") return;
    
    // Call the submit function directly without trying to clone the event
    if (formRef.current) {
      store.submitChat(e as unknown as FormEvent<HTMLFormElement>);
      setLocalInput("");
      
      // Focus textarea after submitting
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 10);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="w-full"
    >
      <div className="flex gap-3 items-end">
        <div className="flex-1 rounded-md border-2 border-gray-300 dark:border-gray-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
          <textarea
            ref={textareaRef}
            placeholder="Send a message..."
            value={localInput}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={Math.min(Math.max(localInput.split('\n').length, 1), 5)}
            className={cn(
              "w-full min-h-[44px] py-3 px-4 bg-transparent outline-none resize-none",
              "focus:outline-none focus:ring-0 rounded-md"
            )}
            data-slot="public-chat-textarea"
          />
        </div>
        <button
          type="submit"
          className={cn(
            "h-11 w-11 rounded-md flex items-center justify-center",
            "bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          )}
          disabled={localInput.trim().length === 0 || store.loading === "loading"}
          data-slot="public-chat-send-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
          <span className="sr-only">Send message</span>
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
        Public chat messages are stored in your browser&apos;s local storage and are not permanently saved to a server.
      </p>
    </form>
  );
}; 