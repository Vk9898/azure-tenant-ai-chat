import { ScrollArea } from "@/features/ui/scroll-area";
import { getCurrentUser } from "@/features/auth-page/helpers";
import { redirect } from "next/navigation";
import { Hero } from "@/features/ui/hero";
import { SparklesIcon } from "lucide-react";
import { ChatPlayground } from "@/features/admin-dashboard/chat-observability/chat-playground";

export default async function ChatPlaygroundPage() {
  const user = await getCurrentUser();

  if (!user.isAdmin) {
    redirect("/");
  }

  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col">
        <Hero
          title={
            <>
              <SparklesIcon size={36} strokeWidth={1.5} />
              Chat Playground
            </>
          }
          description={
            "Test prompts with different models and parameters, and analyze the results"
          }
        />
        <ChatPlayground />
      </main>
    </ScrollArea>
  );
} 