"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function DevSignInPage() {
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState("dev");
  const [password, setPassword] = useState(""); // Keep password empty initially
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isDevAuthEnabled = process.env.NEXT_PUBLIC_DEV_AUTH_ENABLED === "true";
  const isDevelopment = process.env.NODE_ENV === "development";

  useEffect(() => {
    setMounted(true);
    if (!isDevelopment || !isDevAuthEnabled) {
      router.replace("/auth/signin"); // Redirect if not in dev mode or dev auth is disabled
    }
  }, [router, isDevelopment, isDevAuthEnabled]);

  const handleDevLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("localdev", {
        redirect: false, // Handle redirect manually based on result
        username,
        password, // Send password even if empty, provider handles logic
        callbackUrl: "/chat",
      });

      if (result?.error) {
        setError("Authentication failed. Check console for details.");
        console.error("Dev Signin Error:", result.error);
        setLoading(false);
      } else if (result?.url) {
        router.push(result.url); // Use the callbackUrl from the result
      } else {
         // Should not happen with redirect: false if successful, but handle defensively
        router.push("/chat");
      }
      // No need to setLoading(false) on success because of navigation
    } catch (err) {
      setError("An unexpected error occurred during sign in.");
      console.error("Dev Signin Catch Error:", err);
      setLoading(false);
    }
  };

  if (!mounted || !isDevelopment || !isDevAuthEnabled) {
    // Render null or a loading indicator while checking/redirecting
    return null;
  }

  return (
    <div className="flex flex-col items-center" data-slot="dev-signin-page">
      <div className="mb-8 text-center">
        <h1 className="ds-section-title">Developer Sign In</h1>
        <div className="ds-accent-bar mx-auto"></div>
      </div>
      <Card className={cn("ds-card min-w-[300px] sm:min-w-[360px]")}>
        <CardHeader>
          <CardTitle className="text-xl">Local Development Login</CardTitle>
          <CardDescription>
            Use credentials configured for local development environment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleDevLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="dev"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="(Optional)"
              />
            </div>
            <Button
              type="submit"
              className={cn("ds-button-primary w-full")}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In as Developer"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center p-4 sm:p-6">
           <Button
             variant="outline"
             onClick={() => window.history.back()}
             className={cn(
               "w-full sm:w-auto rounded-xs font-bold uppercase min-h-11 md:min-h-10"
             )}
             disabled={loading}
           >
            Go Back
           </Button>
        </CardFooter>
      </Card>
    </div>
  );
}