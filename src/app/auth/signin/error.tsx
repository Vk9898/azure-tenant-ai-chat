"use client";

import { Button } from "@/features/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/features/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const errorMessage = getErrorMessage(error);

  return (
    <div className="flex flex-col items-center" data-slot="auth-error-page">
      <div className="mb-8 text-center">
        <h1 className="ds-section-title">Authentication Error</h1>
        <div className="ds-accent-bar mx-auto"></div>
      </div>

      <Card className={cn(
        "ds-card shadow-xs border-destructive min-w-[300px] sm:min-w-[360px]",
        "transition-all duration-200"
      )} data-slot="error-card">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-xl font-black">Sign In Failed</CardTitle>
          </div>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            We encountered an issue with your authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <p className="text-sm text-foreground">{errorMessage}</p>
        </CardContent>
        <CardFooter className="p-4 sm:p-6 flex flex-col sm:flex-row sm:justify-end gap-3">
          <Button 
            variant="outline"
            onClick={() => window.history.back()}
            className={cn(
              "w-full sm:w-auto rounded-xs font-bold uppercase min-h-11 md:min-h-10"
            )}
            data-slot="back-button"
          >
            Go Back
          </Button>
          <Button 
            onClick={() => window.location.href = "/auth/signin"}
            className={cn(
              "ds-button-primary w-full sm:w-auto"
            )}
            data-slot="retry-button"
          >
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function getErrorMessage(error: string | null): string {
  switch (error) {
    case "OAuthSignin":
      return "Error starting the sign in process. Please try again.";
    case "OAuthCallback":
      return "Error during authentication callback. Please try again.";
    case "OAuthCreateAccount":
      return "Error creating your account. Please contact support.";
    case "EmailCreateAccount":
      return "Error creating your account. Please contact support.";
    case "Callback":
      return "Error during the authentication callback. Please try again.";
    case "OAuthAccountNotLinked":
      return "To confirm your identity, sign in with the same account you used originally.";
    case "EmailSignin":
      return "Error sending the sign in email. Please try again.";
    case "CredentialsSignin":
      return "The credentials you provided are invalid. Please check and try again.";
    case "SessionRequired":
      return "Please sign in to access this page.";
    default:
      return "An unknown error occurred during sign in. Please try again.";
  }
} 