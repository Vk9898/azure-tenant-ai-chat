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
      className={cn("container max-w-3xl relative min-h-screen pb-[240px] pt-16 flex flex-col gap-16", props.className)}
    >
      {props.children}
    </div>
  );
};

export default React.forwardRef(ChatMessageContentArea);
