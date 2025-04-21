import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "./lib";
import { Button } from "@/components/ui/button";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xs text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary"
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-xs",
        lg: "h-11 px-8 rounded-xs",
        icon: "h-10 w-10"
      },
      uppercase: {
        true: "uppercase",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      uppercase: false
    }
  }
);

// Utility class for button links based on ghost
const ButtonLinkVariant = cn(
  buttonVariants({ variant: "ghost" }),
  "p-0 h-12 w-12 flex items-center justify-center"
);

// Design system compliant button classes
const dsButtonPrimary = "ds-button-primary";
const dsButtonSecondary = "ds-button-secondary";
const dsButtonOutline = "ds-button-outline";

Button.displayName = "Button";

export { Button, ButtonLinkVariant, buttonVariants, dsButtonPrimary, dsButtonSecondary, dsButtonOutline };
