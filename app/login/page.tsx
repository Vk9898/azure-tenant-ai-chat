"use client";

import { useRedirectIfAuthenticated } from "@/lib/auth/auth-client";
import { LogIn } from "@/components/auth-page/login";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const { isLoading } = useRedirectIfAuthenticated();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) return null;
  
  return (
    <main className="container flex flex-col items-center justify-center min-h-screen py-12">
      <h1 className="text-3xl font-bold text-primary mb-8">User Login</h1>
      
      <LogIn
        isDevMode={process.env.NEXT_PUBLIC_NODE_ENV === "development"}
        githubEnabled={!!process.env.NEXT_PUBLIC_GITHUB_AUTH_ENABLED}
        entraIdEnabled={!!process.env.NEXT_PUBLIC_ENTRA_ID_AUTH_ENABLED}
      />
      
      <div className="mt-8 text-center">
        <p className="text-muted-foreground mb-2">
          Need to access administrator features?
        </p>
        <Link
          href="/admin-auth"
          className="text-primary hover:underline"
        >
          Go to Admin Login
        </Link>
      </div>
      
      <div className="mt-4">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:underline"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
} 