"use client";

import { AI_NAME } from "@/components/theme/theme-config";
import { signIn } from "next-auth/react";
import { FC } from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface LoginProps {
  isDevMode: boolean;
  githubEnabled: boolean;
  entraIdEnabled: boolean;
}

export const LogIn: FC<LoginProps> = ({
  isDevMode,
  githubEnabled,
  entraIdEnabled,
}) => {
  const noButtons = !isDevMode && !githubEnabled && !entraIdEnabled;

  return (
    <Card
      className={cn(
        "ds-card shadow-xs min-w-[300px] sm:min-w-[360px]",
        "transition-all duration-200"
      )}
      data-slot="login-card"
    >
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl font-black flex items-center gap-2">
          <Avatar className="h-8 w-8 rounded-xs">
            <AvatarImage src={"ai-icon.png"} alt={AI_NAME} />
          </Avatar>
          <span className="text-primary">{AI_NAME}</span>
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1">
          Sign in to access your personal AI chat assistant
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
        {noButtons && (
          <div className="flex items-center gap-2 bg-destructive/10 text-destructive p-3 rounded-xs text-sm">
            <AlertTriangle className="h-5 w-5" />
            <span>No sign‑in methods are currently available.</span>
          </div>
        )}

        {githubEnabled && (
          <Button
            onClick={() => signIn("github", { callbackUrl: "/chat" })}
            className={cn(
              "ds-button-primary w-full h-12 md:h-10 min-h-11 md:min-h-10",
              "flex items-center justify-center gap-2"
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
        )}

        {entraIdEnabled && (
          <Button
            onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/chat" })}
            className={cn(
              "ds-button-primary w-full h-12 md:h-10 min-h-11 md:min-h-10"
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
        )}

        {isDevMode && (
          <Button
            variant="secondary"
            onClick={() => signIn("localdev", { callbackUrl: "/chat" })}
            className={cn(
              "w-full h-12 md:h-10 min-h-11 md:min-h-10 rounded-xs font-bold uppercase",
              "bg-secondary text-secondary-foreground hover:bg-secondary/90"
            )}
            data-slot="login-button-dev"
          >
            Basic Auth (DEV ONLY)
          </Button>
        )}
      </CardContent>
    </Card>
  );
};