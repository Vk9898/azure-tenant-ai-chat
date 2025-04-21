import * as React from "react";

import { cn } from "@/ui/lib";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showError?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, type, showError, ...props }, ref) {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
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
