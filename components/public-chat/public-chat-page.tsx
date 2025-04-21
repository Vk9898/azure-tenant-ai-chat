"use client";

import { FC, useEffect, useRef } from "react";
import { usePublicChatStore } from "@/components/public-chat/public-chat-store";
import MessageContent from "@/components/public-chat/message-content";
import { PublicChatMessageArea } from "@/components/public-chat/chat-message-area";
import { PublicChatInput } from "@/components/public-chat/public-chat-input";

// Renamed to match Next.js App Router conventions
export default function PublicChatContent() {
  const { messages, loading, initChatSession, clearChatHistory } = usePublicChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session with Guest username
    initChatSession("Guest");
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      clearChatHistory();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Public Chat Demo
            </h1>
            <div className="h-1.5 w-24 bg-blue-500 mt-2"></div>
          </div>
          <div>
            <button
              onClick={handleClearChat}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              aria-label="Clear chat history"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 flex-shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p>
            This is a demo with limited functionality. Public chats are stored only in your browser and not saved to a database.
          </p>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-6">
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
            >
              <MessageContent message={message} />
            </PublicChatMessageArea>
          ))}
          {loading === "loading" && (
            <div className="flex justify-center p-4">
              <div className="animate-pulse flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-4">
        <div className="max-w-3xl mx-auto">
          <PublicChatInput />
        </div>
      </div>
    </div>
  );
}

// Keep the old export for backward compatibility
export const PublicChatPage = PublicChatContent; 