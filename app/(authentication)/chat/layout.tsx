import { ChatMenu } from "@/components/chat-page/chat-menu/chat-menu";
import { ChatMenuHeader } from "@/components/chat-page/chat-menu/chat-menu-header";
import { FindAllChatThreadForCurrentUser } from "@/components/chat-page/chat-services/chat-thread-service";
import { MenuTray } from "@/components/main-menu/menu-tray";
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

  if (chatHistoryResponse.status !== "OK") {
    return <DisplayError errors={chatHistoryResponse.errors} />;
  }

  return (
    <div className={cn("flex flex-1 items-stretch")} data-slot="chat-layout">
      <div className="flex-1 flex">
        <MenuTray>
          <div className="flex flex-col h-full">
            <ChatMenuHeader />
            <ScrollArea className="flex-1">
              <nav className="p-4 sm:p-6">
                <ChatMenu menuItems={chatHistoryResponse.response} />
              </nav>
            </ScrollArea>
          </div>
        </MenuTray>
        {children}
      </div>
    </div>
  );
}
