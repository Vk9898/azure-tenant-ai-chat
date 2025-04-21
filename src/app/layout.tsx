import { AI_NAME } from "@/features/theme/theme-config";
import { ThemeProvider } from "@/features/theme/theme-provider";
import { Toaster } from "@/features/ui/toaster";
import { cn } from "@/ui/lib";
import { cal, inter, jetbrainsMono } from "@/styles/fonts";
import "./globals.css";

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
    <html lang="en" className={cn("h-full w-full overflow-hidden", inter.variable, cal.variable, jetbrainsMono.variable)} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        className={cn(
          "h-full w-full flex bg-background text-foreground antialiased",
          inter.className
        )}
        data-slot="root-layout"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
