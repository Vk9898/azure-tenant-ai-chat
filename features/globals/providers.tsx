"use client";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/features/auth-page/auth-api";

export const AuthenticatedProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  );
};
