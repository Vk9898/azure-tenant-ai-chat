import { Markdown } from "@/features/ui/markdown/markdown";
import React from "react";

// Define the ChatMessage type directly
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  name: string;
  content: string;
  timestamp: number;
}

interface MessageContentProps {
  message: ChatMessage;
}

const MessageContent: React.FC<MessageContentProps> = ({ message }) => {
  // Define the citation click handler with the required signature
  const handleCitationClick = async (
    previousState: any,
    formData: FormData
  ): Promise<React.JSX.Element> => {
    // For public chat, we don't need to do anything with citations
    // Just return an empty element
    return <></>;
  };

  return (
    <>
      <Markdown content={message.content} onCitationClick={handleCitationClick} />
    </>
  );
};

export default MessageContent; 