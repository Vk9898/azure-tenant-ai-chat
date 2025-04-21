import { FC } from "react";
import { PublicChatMessage } from "./public-chat-store";

interface MessageContentProps {
  message: PublicChatMessage;
}

const MessageContent: FC<MessageContentProps> = ({ message }) => {
  // Simple formatting for line breaks and basic markdown
  const formattedContent = message.content
    .replace(/\n/g, '<br />')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  return (
    <div 
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  );
};

export default MessageContent; 