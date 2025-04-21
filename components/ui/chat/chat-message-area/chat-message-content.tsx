import React, { ForwardRefRenderFunction } from "react";
import { cn } from "@/lib/utils";

interface ChatMessageContentAreaProps {
  children?: React.ReactNode;
  className?: string;
}

const ChatMessageContentArea: ForwardRefRenderFunction<
  HTMLDivElement,
  ChatMessageContentAreaProps
> = (props, ref) => {
  return (
    <div
      ref={ref}
      // Removed min-h-screen, relative. Adjusted py-6. Kept gap-8.
      className={cn("container max-w-3xl py-6 flex flex-col gap-8", props.className)}
      data-slot="chat-message-content-area"
    >
      {props.children}
    </div>
  );
};

export default React.forwardRef(ChatMessageContentArea);