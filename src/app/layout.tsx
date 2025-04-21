import { AI_NAME } from "@/features/theme/theme-config";
import { ThemeProvider } from "@/features/theme/theme-provider";
import { Toaster } from "@/features/ui/sonner";
import { cn } from "@/lib/utils";
import { cal, inter } from "@/styles/fonts";
import "@/styles/globals.css";

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
      <body className={cn(cal.variable, inter.variable)} data-slot="root-layout">
        <ThemeProvide
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
