import { getCurrentUser } from "@/components/auth-page/helpers";
import { FindAllChatMessagesForAdmin } from "@/components/reporting-page/reporting-services/reporting-service";
import { Button } from "@/components/ui/button";
import { DisplayError } from "@/components/ui/error/display-error";
import { Hero } from "@/components/ui/hero";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ChatDetailPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const user = await getCurrentUser();

  if (!user.isAdmin) {
    redirect("/");
  }

  const chatId = params.id;

  const messagesResponse = await FindAllChatMessagesForAdmin(chatId);

  if (messagesResponse.status !== "OK") {
    return <DisplayError errors={messagesResponse.errors} />;
  }

  const messages = messagesResponse.response;

  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col">
        <Hero
          title={
            <>
              <ShieldCheck size={36} strokeWidth={1.5} />
              Chat Detail
            </>
          }
          description={`Viewing chat thread: ${chatId}`}
        />
        
        <div className="container max-w-4xl py-3">
          <div className="mb-4">
            <Button asChild variant="outline">
              <Link href="/admin/chats">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to all chats
              </Link>
            </Button>
          </div>
          
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`p-4 rounded-lg ${
                  message.role === "user" 
                    ? "bg-primary/10 ml-auto max-w-[80%]" 
                    : "bg-muted mr-auto max-w-[80%]"
                }`}
              >
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">
                    {message.role === "user" ? "User" : message.role}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            ))}
            
            {messages.length === 0 && (
              <div className="text-center p-8 text-muted-foreground">
                No messages found in this chat thread.
              </div>
            )}
          </div>
        </div>
      </main>
    </ScrollArea>
  );
} 