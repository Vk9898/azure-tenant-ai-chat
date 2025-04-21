import React, { ForwardRefRenderFunction } from "react";
import { cn } from "@/lib/utils";

export interface PublicChatMessageContentAreaProps {
  children?: React.ReactNode;
  className?: string;
}

const PublicChatMessageContentArea: ForwardRefRenderFunction<
  HTMLDivElement,
  PublicChatMessageContentAreaProps
> = ({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("container max-w-3xl relative flex flex-col gap-8", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default React.forwardRef(PublicChatMessageContentArea); 