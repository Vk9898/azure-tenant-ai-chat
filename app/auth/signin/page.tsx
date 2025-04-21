"use client";

import { LogIn } from "@/components/auth-page/login";
import { useRedirectIfAuthenticated } from "@/lib/auth/auth-client";
import { useEffect, useState } from "react";

export default function SignInPage() {
  /* ────────────────────────────────────────────────
     1. Hydration guard + redirect if already signed in
     ─────────────────────────────────────────────── */
  const [mounted, setMounted] = useState(false);
  const { isLoading } = useRedirectIfAuthenticated();

  useEffect(() => setMounted(true), []);

  if (!mounted || isLoading) return null;

  /* ────────────────────────────────────────────────
     2. Provider feature flags
        Only NEXT_PUBLIC_* keys are visible in the browser.
     ─────────────────────────────────────────────── */
  const githubEnabled =
    process.env.NEXT_PUBLIC_GITHUB_AUTH_ENABLED === "true";

  const entraIdEnabled =
    process.env.NEXT_PUBLIC_ENTRA_ID_AUTH_ENABLED === "true";

  /* Dev‑mode fallback:
     If no public flags are set *and* we’re in a dev build,
     expose the “localdev” button automatically.            */
  const isDevRuntime =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_NODE_ENV === "development";

  const isDevMode =
    process.env.NEXT_PUBLIC_DEV_AUTH_ENABLED === "true" ||
    (isDevRuntime && !githubEnabled && !entraIdEnabled);

  return (
    <div className="flex flex-col items-center" data-slot="signin-page">
      <div className="mb-8 text-center">
        <h1 className="ds-section-title">Sign In</h1>
        <div className="ds-accent-bar mx-auto" />
      </div>

      <LogIn 
        isDevMode={isDevMode} 
        githubEnabled={githubEnabled} 
        entraIdEnabled={entraIdEnabled} 
      />
    </div>
  );
} 