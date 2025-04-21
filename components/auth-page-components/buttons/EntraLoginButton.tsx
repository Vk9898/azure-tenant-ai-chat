"use client";

import { FC } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EntraLoginButtonProps {
  callbackUrl?: string;
  className?: string;
}

const EntraLoginButton: FC<EntraLoginButtonProps> = ({
  callbackUrl = "/chat",
  className,
}) => (
  <Button
    onClick={() => signIn("microsoft-entra-id", { callbackUrl })}
    className={cn(
      "ds-button-primary w-full h-12 md:h-10 min-h-11 md:min-h-10",
      className,
    )}
    data-slot="login-button-microsoft"
  >
    <svg className="h-5 w-5 mr-2" viewBox="0 0 23 23">
      <path
        fill="currentColor"
        d="M0 0h10.931v10.931H0zM12.069 0H23v10.931H12.069zM0 12.069h10.931V23H0zM12.069 12.069H23V23H12.069z"
      />
    </svg>
    Continue with Microsoft
  </Button>
);

export default EntraLoginButton;