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
      // Apply container constraints, responsive padding, and vertical gap
      className={cn("container max-w-3xl py-6 flex flex-col gap-6", props.className)} // Use gap-6 consistent with DS
      data-slot="chat-message-content-area"
    >
      {props.children}
    </div>
  );
};

export default React.forwardRef(ChatMessageContentArea);