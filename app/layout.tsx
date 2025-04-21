import { AI_NAME } from "@/components/theme/theme-config";
import { AuthenticatedProviders } from "@/components/globals/providers";
import { cn } from "@/lib/utils";
import { cal, inter } from "@/styles/fonts";
import "@/styles/globals.css";
import { Metadata } from "next";

export const metadata = {
  title: AI_NAME,
  description: AI_NAME,
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={cn(cal.variable, inter.variable)}>
        <AuthenticatedProviders>
          {children}
        </AuthenticatedProviders>
      </body>
    </html>
  );
}
