"use client";

import { LogIn } from "@/features/auth-page/login";
import { redirectIfAuthenticated } from "@/features/auth-page/helpers";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user is already authenticated and redirect if needed
    redirectIfAuthenticated();
  }, []);

  if (!mounted) return null;

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