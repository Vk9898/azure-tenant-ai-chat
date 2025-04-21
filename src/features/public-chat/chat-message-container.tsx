import React, { ForwardRefRenderFunction } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/features/ui/scroll-area";

export interface PublicChatMessageContainerProps {
  children?: React.ReactNode;
  className?: string;
}

const PublicChatMessageContainer: ForwardRefRenderFunction<
  HTMLDivElement,
  PublicChatMessageContainerProps
> = ({ children, className, ...props }, ref) => {
  return (
    <ScrollArea 
      ref={ref} 
      className={cn("flex-1 h-full", className)} 
      type="always"
      {...props}
    >
      {children}
    </ScrollArea>
  );
};

export default React.forwardRef(PublicChatMessageContainer); 