"use client";

import { LogIn } from "@/components/auth-page/login";
import { useRedirectIfAuthenticated } from "@/lib/auth/auth-client";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const [mounted, setMounted] = useState(false);
  const { isLoading } = useRedirectIfAuthenticated();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) return null;

  const isDevMode = process.env.NEXT_PUBLIC_NODE_ENV === "development";
  const githubEnabled = !!process.env.NEXT_PUBLIC_GITHUB_AUTH_ENABLED;
  const entraIdEnabled = !!process.env.NEXT_PUBLIC_ENTRA_ID_AUTH_ENABLED;

  return (
    <div className="flex flex-col items-center" data-slot="signin-page">
      <div className="mb-8 text-center">
        <h1 className="ds-section-title">Sign In</h1>
        <div className="ds-accent-bar mx-auto"></div>
      </div>

      <LogIn 
        isDevMode={isDevMode} 
        githubEnabled={githubEnabled} 
        entraIdEnabled={entraIdEnabled} 
      />
    </div>
  );
} 