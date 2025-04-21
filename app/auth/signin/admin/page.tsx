"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react"; // For warning

// Assuming you have similar GitHub/Entra buttons or create them
// For simplicity, using basic buttons here. Adapt with your actual components.

const GitHubLoginButton = ({ callbackUrl }: { callbackUrl: string }) => (
  <Button
    variant="outline"
    className="w-full"
    onClick={() => signIn("github", { callbackUrl })}
  >
    <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="currentColor">
       <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
     Sign in with GitHub
  </Button>
);

const EntraLoginButton = ({ callbackUrl }: { callbackUrl: string }) => (
   <Button
     variant="outline"
     className="w-full"
     onClick={() => signIn("microsoft-entra-id", { callbackUrl })}
   >
     {/* You might want a Microsoft icon here */}
     Sign in with Microsoft
   </Button>
);


export default function AdminSignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const githubEnabled = process.env.NEXT_PUBLIC_GITHUB_AUTH_ENABLED === "true";
  const entraIdEnabled = process.env.NEXT_PUBLIC_ENTRA_ID_AUTH_ENABLED === "true";
  const adminCallbackUrl = "/reporting"; // Or your preferred admin landing page

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && status === "authenticated") {
      // If logged in BUT not an admin, redirect away from admin login
      // @ts-ignore // Ignore missing isAdmin potential, handled by check
      if (!session?.user?.isAdmin) {
        router.replace("/unauthorized");
      }
      // If logged in AND admin, redirect to the dashboard directly
       // @ts-ignore
      else if (session?.user?.isAdmin) {
         router.replace(adminCallbackUrl);
      }
    }
  }, [session, status, router, mounted, adminCallbackUrl]);

  if (!mounted || status === "loading") {
     // Render null or a loading indicator while checking session
     return null;
  }

   // If authenticated as admin, this component might briefly render before redirect effect runs
   // If unauthenticated, show the login options

  return (
    <div className="flex flex-col items-center" data-slot="admin-signin-page">
      <div className="mb-8 text-center">
        <h1 className="ds-section-title">Administrator Sign In</h1>
        <div className="ds-accent-bar mx-auto"></div>
      </div>

      <Card className={cn("ds-card min-w-[300px] sm:min-w-[360px]")}>
        <CardHeader>
          <CardTitle className="text-xl">Admin Access Required</CardTitle>
          <CardDescription>
            Please sign in using an administrator-approved account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!githubEnabled && !entraIdEnabled && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-md text-sm">
               <AlertTriangle className="h-5 w-5 flex-shrink-0" />
               <span>No administrator sign-in methods are configured.</span>
            </div>
          )}
          {githubEnabled && <GitHubLoginButton callbackUrl={adminCallbackUrl} />}
          {entraIdEnabled && <EntraLoginButton callbackUrl={adminCallbackUrl} />}
        </CardContent>
         <CardFooter className="flex justify-center p-4 sm:p-6">
           <Button
             variant="outline"
             onClick={() => router.push("/auth/signin")} // Go to general sign-in
             className={cn(
               "w-full sm:w-auto rounded-xs font-bold uppercase min-h-11 md:min-h-10"
             )}
           >
             Not an Admin?
           </Button>
        </CardFooter>
      </Card>
    </div>
  );
}