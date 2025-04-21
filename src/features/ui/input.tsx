import * as React from "react";

import { cn } from "./lib";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showError?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, showError, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 md:h-10 w-full rounded-xs border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ds-focus-ring",
          showError && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        data-slot="input"
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
