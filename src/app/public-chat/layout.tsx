import { AI_NAME } from "@/features/theme/theme-config";
import { ArrowRight, Info, Layout } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: `Public Chat - ${AI_NAME}`,
  description: "Try our AI assistant without signing in. Your chats are stored only in your browser, not in a database.",
};

export default function PublicChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-3 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Image src="/ai-icon.png" alt="AI Icon" width={32} height={32} className="w-8 h-8" />
          <h1 className="text-lg font-semibold">{AI_NAME} Public Chat</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center text-sm">
            <Info className="h-4 w-4 mr-1" />
            <span>Public demo mode - no sidebar or full features</span>
          </div>
          <Link
            href="/auth/signin"
            className="flex items-center gap-1 text-sm bg-primary-foreground text-primary px-3 py-1 rounded-xs"
          >
            Sign In <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>
      <div className="flex-1 flex flex-col bg-background">
        {children}
      </div>
      <footer className="bg-muted py-2 px-4 text-center text-sm text-muted-foreground">
        <p>
          This is a limited demo without the sidebar menu. For the full experience with sidebar navigation, please{" "}
          <Link href="/auth/signin" className="text-primary underline">
            sign in
          </Link>
          .
        </p>
      </footer>
    </div>
  );
} 