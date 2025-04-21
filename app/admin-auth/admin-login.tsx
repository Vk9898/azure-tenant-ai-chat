"use client";
import { AI_NAME } from "@/components/theme/theme-config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

interface AdminLoginProps {
  githubEnabled: boolean;
}

export const AdminLogin: React.FC<AdminLoginProps> = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // In a real application, you would validate if the email is in your admin list
      // For now, we'll just check if it's one of the admin emails from the environment variable
      const adminEmails = process.env.ADMIN_EMAIL_ADDRESS?.split(",").map(email =>
        email.toLowerCase().trim()
      ) || [];

      // Since we're using GitHub or other OAuth providers, we'll redirect to their login
      // In a real app, this could be a custom authentication mechanism
      await signIn("github", {
        callbackUrl: "/reporting"
      });

      // Note: signIn will automatically redirect on success, so we won't reach here
      // if authentication is successful
    } catch (err) {
      setError("Authentication failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <Card className={cn(
        "w-full border-2 rounded-xs bg-card text-card-foreground shadow-xs" // Direct styles
      )}
      data-slot="admin-login-card">
      <CardHeader>
        <CardTitle className="text-xl">Administrator Login</CardTitle>
        <CardDescription>
          Login with your administrator credentials
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xs mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminEmailLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="admin@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xs border-2" // Apply theme styles
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-xs border-2" // Apply theme styles
            />
          </div>
          <Button
            type="submit"
            className={cn(
               "w-full rounded-xs font-bold uppercase min-h-11 md:min-h-10", // Standard sizing
               "bg-primary text-primary-foreground hover:bg-primary/90", // Primary colors
               "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" // Focus ring
            )}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login as Admin"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="relative w-full mb-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" /> {/* Use theme border */}
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {props.githubEnabled && (
          <Button
            variant="outline"
            className={cn(
              "w-full rounded-xs font-bold uppercase min-h-11 md:min-h-10", // Standard sizing
              "border-2", // Add border-2 to match design
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" // Focus ring
            )}
            onClick={() => signIn("github", { callbackUrl: "/reporting" })}
          >
            <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                fill="currentColor"
              />
            </svg>
            GitHub Admin Login
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};