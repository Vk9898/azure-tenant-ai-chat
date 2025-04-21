"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface PublicChatMessageAreaProps {
  children?: React.ReactNode;
  profilePicture?: string | null;
  profileName?: string;
  role: "user" | "assistant";
  onCopy: () => void;
  className?: string;
  "data-slot"?: string;
}

export const PublicChatMessageArea = ({
  children,
  profilePicture,
  profileName,
  role,
  onCopy,
  className,
  "data-slot": dataSlot = "public-chat-message",
  ...props
}: PublicChatMessageAreaProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
  };

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  return (
    <div 
      className={cn(
        "flex flex-col p-4 sm:p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm",
        role === "assistant" ? "bg-gray-50 dark:bg-gray-850" : "",
        className
      )} 
      data-slot={dataSlot} 
      {...props}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 dark:bg-gray-700">
            {profilePicture ? (
              <img src={profilePicture} alt={profileName || role} className="w-full h-full object-cover" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
                <circle cx="12" cy="8" r="5" />
                <path d="M20 21a8 8 0 0 0-16 0" />
              </svg>
            )}
          </div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {profileName}
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Copy message"
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
          )}
        </button>
      </div>
      <div className="pl-11">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {children}
        </div>
      </div>
    </div>
  );
}; 