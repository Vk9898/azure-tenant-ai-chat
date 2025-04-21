"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function EntraSignInPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Let NextAuth perform the full-page redirect; no JSON expected.
    signIn("microsoft-entra-id", { callbackUrl: "/chat" });
  }, []);

  if (!mounted) return null; // Hydration guard

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[200px]"
      data-slot="entra-signin-page"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">
        Redirecting&nbsp;to&nbsp;Microsoft&nbsp;sign‑in…
      </p>
    </div>
  );
}