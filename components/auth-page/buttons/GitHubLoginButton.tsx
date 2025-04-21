"use client";

import { FC } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface GitHubLoginButtonProps {
  callbackUrl?: string;
  className?: string;
}

const GitHubLoginButton: FC<GitHubLoginButtonProps> = ({
  callbackUrl = "/chat",
  className,
}) => (
  <Button
    onClick={() => signIn("github", { callbackUrl })}
    className={cn(
      "ds-button-primary w-full h-12 md:h-10 min-h-11 md:min-h-10",
      "flex items-center justify-center gap-2",
      className,
    )}
    data-slot="login-button-github"
  >
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path
        d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577V20.6c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604C5.407 16.42 2.605 15.391 2.605 10.8c0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.236 1.91 1.236 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.565 21.8 24 17.303 24 12 24 5.373 18.627 0 12 0Z"
        fill="currentColor"
      />
    </svg>
    Continue with GitHub
  </Button>
);

export default GitHubLoginButton;