import { AI_NAME } from "@/features/theme/theme-config";
import { ThemeProvider } from "@/features/theme/theme-provider";
import { Toaster } from "@/features/ui/sonner";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "@/styles/globals.css";

// Initialize fonts directly in the layout
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cal = localFont({
  src: "../../public/fonts/CalSans-SemiBold.otf",
  variable: "--font-cal",
  weight: "600",
  display: "swap",
});

const openAiSans = localFont({
  src: [
    {
      path: "../../public/fonts/OpenAISans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/OpenAISans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/OpenAISans-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-openai-sans",
  display: "swap",
});

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
      <body className={cn(cal.variable, inter.variable, openAiSans.variable)} data-slot="root-layout">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
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
