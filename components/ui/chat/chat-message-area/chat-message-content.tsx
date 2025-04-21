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
      // Adjusted padding and gap for DS consistency
      className={cn("container max-w-3xl relative min-h-screen pb-24 pt-8 flex flex-col gap-8", props.className)}
    >
      {props.children}
    </div>
  );
};

export default React.forwardRef(ChatMessageContentArea);