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

interface LoginProps {
  isDevMode: boolean;
  githubEnabled: boolean;
  entraIdEnabled: boolean;
}

export const LogIn: FC<LoginProps> = (props) => {
  return (
    <Card className={cn(
      "border-2 rounded-xs bg-card text-card-foreground shadow-xs min-w-[300px] sm:min-w-[360px]", // Replaced ds-card
      "transition-all duration-200"
    )} data-slot="login-card">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl font-black flex items-center gap-2">
          <Avatar className="h-8 w-8 rounded-xs">
            <AvatarImage src={"/ai-icon.png"} alt={AI_NAME} />
          </Avatar>
          <span className="text-primary">{AI_NAME}</span>
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1">
          Sign in to access your personal AI chat assistant
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
        {props.githubEnabled && (
          <Button
            onClick={() => signIn("github", { callbackUrl: "/chat" })}
            className={cn(
              "w-full h-12 md:h-10 min-h-11 md:min-h-10 rounded-xs font-bold uppercase", // Standard button sizing
              "bg-primary text-primary-foreground hover:bg-primary/90", // Primary button colors
              "flex items-center justify-center gap-2",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" // Focus ring
            )}
            data-slot="login-button-github"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                fill="currentColor"
              />
            </svg>
            Continue with GitHub
          </Button>
        )}
        {props.entraIdEnabled && (
          <Button
            onClick={() => signIn("azure-ad", { callbackUrl: "/chat" })}
            className={cn(
              "w-full h-12 md:h-10 min-h-11 md:min-h-10 rounded-xs font-bold uppercase", // Standard button sizing
              "bg-primary text-primary-foreground hover:bg-primary/90", // Primary button colors
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" // Focus ring
            )}
            data-slot="login-button-microsoft"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 23 23">
              <path fill="currentColor" d="M0 0h10.931v10.931H0zM12.069 0H23v10.931H12.069zM0 12.069h10.931V23H0zM12.069 12.069H23V23H12.069z"/>
            </svg>
            Continue with Microsoft
          </Button>
        )}
        {props.isDevMode && (
          <Button
            variant="secondary"
            onClick={() => signIn("localdev", { callbackUrl: "/chat" })}
            className={cn(
              "w-full h-12 md:h-10 min-h-11 md:min-h-10 rounded-xs font-bold uppercase",
              "bg-secondary text-secondary-foreground hover:bg-secondary/90", // Secondary button colors
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" // Focus ring
            )}
            data-slot="login-button-dev"
          >
            Basic Auth (DEV ONLY)
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
