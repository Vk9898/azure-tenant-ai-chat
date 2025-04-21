import { AI_NAME } from "@/features/theme/theme-config";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

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
          <img src="/ai-icon.png" alt="AI Icon" className="w-8 h-8" />
          <h1 className="text-lg font-semibold">{AI_NAME} Public Chat</h1>
        </div>
        <Link
          href="/auth/signin"
          className="flex items-center gap-1 text-sm bg-primary-foreground text-primary px-3 py-1 rounded-md"
        >
          Sign In <ArrowRight className="w-4 h-4" />
        </Link>
      </header>
      <div className="flex-1 flex flex-col bg-background">
        {children}
      </div>
      <footer className="bg-muted py-2 px-4 text-center text-sm text-muted-foreground">
        <p>
          This is a limited demo. For the full experience, please{" "}
          <Link href="/auth/signin" className="text-primary underline">
            sign in
          </Link>
          .
        </p>
      </footer>
    </div>
  );
} 