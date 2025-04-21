"use client";

import { FC } from "react";
import { usePublicChatStore } from "./public-chat-store";

// Using the same interface as defined in the store
interface PublicChatMessage {
  id: string;
  role: "user" | "assistant";
  name: string;
  content: string;
  createdAt: Date;
}

interface MessageContentProps {
  message: PublicChatMessage;
}

const MessageContent: FC<MessageContentProps> = ({ message }) => {
  // Format content with more robust handling
  const formatContent = (content: string) => {
    return content
      // Handle line breaks
      .split('\n')
      .map((line, i) => <div key={i}>{formatLine(line)}</div>);
  };

  // Format a single line with markdown-like syntax
  const formatLine = (line: string) => {
    // Process code blocks and other formatting separately
    if (line.startsWith('```') && line.endsWith('```')) {
      return <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md my-2 overflow-x-auto">{line.slice(3, -3)}</pre>;
    }
    
    // Bold text
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic text
    line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return <span dangerouslySetInnerHTML={{ __html: line }} />;
  };

  return (
    <div className="public-message-content text-gray-800 dark:text-gray-200">
      {formatContent(message.content)}
    </div>
  );
};

export default MessageContent; 