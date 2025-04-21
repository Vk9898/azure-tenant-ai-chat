import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "./lib";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xs text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ds-focus-ring",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 shadow-xs",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 shadow-xs",
        outline:
          "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70 shadow-xs",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-success text-success-foreground hover:bg-success/90 active:bg-success/80 shadow-xs",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 active:bg-warning/80 shadow-xs",
      },
      size: {
        default: "h-10 px-4 py-2 min-h-10",
        sm: "h-9 px-3 gap-1.5 text-xs",
        lg: "h-12 px-6 min-h-11 text-base",
        icon: "h-10 w-10 min-h-10 min-w-10",
      },
      uppercase: {
        true: "uppercase",
        false: "",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      mobileFullWidth: {
        true: "w-full sm:w-auto",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      uppercase: true,
      fullWidth: false,
      mobileFullWidth: false,
    },
  }
);

// Utility class for button links based on ghost
const ButtonLinkVariant = cn(
  buttonVariants({ variant: "ghost", uppercase: false }),
  "p-0 h-12 w-12 flex items-center justify-center"
);

// Design system compliant button classes
export const dsButtonPrimary = cn(
  buttonVariants({ variant: "default" }),
  "ds-button-primary"
);

export const dsButtonOutline = cn(
  buttonVariants({ variant: "outline" }),
  "ds-button-outline"
);

export const dsButtonSecondary = cn(
  buttonVariants({ variant: "secondary" }),
  "ds-button-secondary"
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    uppercase, 
    fullWidth, 
    mobileFullWidth,
    asChild = false, 
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ 
          variant, 
          size, 
          uppercase, 
          fullWidth,
          mobileFullWidth,
          className 
        }))}
        ref={ref}
        data-slot="button"
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, ButtonLinkVariant, buttonVariants };
