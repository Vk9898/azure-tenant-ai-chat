"use client";

import { FC } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DevLoginButtonProps {
  callbackUrl?: string;
  className?: string;
}

const DevLoginButton: FC<DevLoginButtonProps> = ({
  callbackUrl = "/chat",
  className,
}) => (
  <Button
    variant="secondary"
    onClick={() => signIn("localdev", { callbackUrl })}
    className={cn(
      "w-full h-12 md:h-10 min-h-11 md:min-h-10 rounded-xs font-bold uppercase",
      "bg-secondary text-secondary-foreground hover:bg-secondary/90",
      className,
    )}
    data-slot="login-button-dev"
  >
    Basic Auth (DEV ONLY)
  </Button>
);

export default DevLoginButton;