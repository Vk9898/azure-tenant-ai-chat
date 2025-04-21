import React, { ForwardRefRenderFunction } from "react";
import { ScrollArea } from "../../scroll-area";
import { cn } from "@/lib/utils";

interface ChatMessageContainerProps {
  children?: React.ReactNode;
  className?: string;
}

const ChatMessageContainer: ForwardRefRenderFunction<
  HTMLDivElement,
  ChatMessageContainerProps
> = (props, ref) => {
  return (
    // Removed flex-1 and h-full, as flex layout handles this now.
    <ScrollArea ref={ref} className={cn("", props.className)} type="always">
      {props.children}
    </ScrollArea>
  );
};

export default React.forwardRef(ChatMessageContainer);