import { Markdown } from "@/features/ui/markdown/markdown";
import React from "react";
import { PublicChatMessageModel } from "./public-chat-store";

interface MessageContentProps {
  message: PublicChatMessageModel;
}

const MessageContent: React.FC<MessageContentProps> = ({ message }) => {
  return (
    <>
      <Markdown content={message.content}></Markdown>
    </>
  );
};

export default MessageContent; 