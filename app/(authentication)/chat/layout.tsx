import { ChatMenu } from "@/components/chat-page-components/chat-menu/chat-menu";
import { ChatMenuHeader } from "@/components/chat-page-components/chat-menu/chat-menu-header";
import { FindAllChatThreadForCurrentUser } from "@/components/chat-page-components/chat-services/chat-thread-service";
import { MenuTray } from "@/components/main-menu-components/menu-tray";
import { cn } from "@/lib/utils";

import { AI_NAME } from "@/components/theme/theme-config";
import { DisplayError } from "@/components/ui/error/display-error";
import { ScrollArea } from "@/components/ui/scroll-area";

export const dynamic = "force-dynamic";

export const metadata = {
  title: AI_NAME,
  description: AI_NAME,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const chatHistoryResponse = await FindAllChatThreadForCurrentUser();

  // Handle potential unauthorized or other errors gracefully
  if (chatHistoryResponse.status === "UNAUTHORIZED") {
     // TODO: Redirect to login or show an unauthorized message
     // For now, showing a generic error
     return <DisplayError errors={[{ message: "Unauthorized access to chat history." }]} />;
  } else if (chatHistoryResponse.status !== "OK") {
    return <DisplayError errors={chatHistoryResponse.errors} />;
  }

  return (
    <div className={cn("flex flex-1 items-stretch h-full")} data-slot="chat-layout"> {/* Ensure h-full */}
      <div className="flex-1 flex h-full"> {/* Ensure h-full */}
        <MenuTray>
          <div className="flex flex-col h-full">
            <ChatMenuHeader />
            <ScrollArea className="flex-1">
              {/* Adjusted padding to p-2 for tighter menu */}
              <nav className="p-2">
                <ChatMenu menuItems={chatHistoryResponse.response} />
              </nav>
            </ScrollArea>
          </div>
        </MenuTray>
        {/* Ensure children container takes remaining space and allows scrolling if needed */}
        <div className="flex-1 flex flex-col overflow-hidden">
           {children}
        </div>
      </div>
    </div>
  );
}