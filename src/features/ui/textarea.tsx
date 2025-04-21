import * as React from "react";

import { cn } from "./lib";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  showError?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, showError, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[100px] w-full rounded-xs border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ds-focus-ring",
          showError && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        data-slot="textarea"
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
