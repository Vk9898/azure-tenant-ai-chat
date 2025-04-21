import { AI_NAME } from "@/components/theme/theme-config";
import { AuthenticatedProviders } from "@/components/globals/providers";
import { cn } from "@/lib/utils";
import { Inter, Outfit } from "next/font/google";
import "@/styles/globals.css";
import { Metadata } from "next";

// Setup fonts with Next.js font system
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Title font from Google
const titleFont = Outfit({
  subsets: ["latin"],
  variable: "--font-title",
  display: "swap",
});

export const metadata: Metadata = {
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
      <body className={cn(
        inter.variable, 
        titleFont.variable,
        "font-default"
      )}>
        <AuthenticatedProviders>
          {children}
        </AuthenticatedProviders>
      </body>
    </html>
  );
}