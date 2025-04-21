import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AuthenticatedProviders } from "@/components/globals/providers";

export const metadata: Metadata = {
  title: "Public Chat Demo",
  description: "Try out our AI chat without signing in",
};

export default function PublicChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 min-h-screen flex-col">
      <header className="bg-primary/5 border-b-2 border-border">
        <div className="container pya-4 px-4 sm:px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image 
              src="/ai-icon.png" 
              alt="AI Chat" 
              width={32}
              height={32}
              className="w-8 h-8 rounded-xs" 
            />
            <h1 className="text-xl font-bold">Public Chat Demo</h1>
          </div>
          <Link 
            href="/api/auth/signin" 
            className="ds-button-primary px-4 py-2 text-sm"
          >
            Sign In
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      
      <footer className="bg-muted py-3 border-t-2 border-border text-center text-sm text-muted-foreground">
        <div className="container">
          &copy; {new Date().getFullYear()} - Try the full experience by signing in
        </div>
      </footer>
    </div>
  );
} 