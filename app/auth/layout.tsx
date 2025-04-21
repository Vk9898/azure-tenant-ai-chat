"use client";

import { AI_NAME } from "@/components/theme/theme-config";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    // Apply base background/text colors here if needed, or rely on layout.tsx
    <div className={cn("flex flex-col min-h-screen bg-background text-foreground")} data-slot="auth-layout">
      <header className="pt-safe border-b-2 border-border bg-background">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/ai-icon.png"
              alt={AI_NAME}
              width={32}
              height={32}
              className="size-8 rounded-xs" // Use theme variable
            />
            <span className="font-bold text-lg">{AI_NAME}</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      <footer className="pb-safe bg-muted py-4 border-t-2 border-border">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {AI_NAME} - All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}