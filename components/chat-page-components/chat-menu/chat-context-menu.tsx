"use client";
import { RedirectToPage } from "@/components/common/navigation-helpers";
import { showError } from "@/components/globals/global-message-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingIndicator } from "@/components/ui/loading";
import { MoreVertical, Trash } from "lucide-react";
import { useState } from "react";
import { DropdownMenuItemWithIcon } from "./chat-menu-item";
import { DeleteAllChatThreads } from "./chat-menu-service";
import { Button } from "@/components/ui/button"; // Import Button

export const ChatContextMenu = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    if (
      window.confirm("Are you sure you want to delete ALL chat threads? This action cannot be undone.")
    ) {
      setIsLoading(true);
      try {
        const response = await DeleteAllChatThreads();

        if (response.status === "OK") {
          // Redirect happens via revalidation/layout reload now
          // RedirectToPage("chat");
        } else {
          showError(response.errors.map((e) => e.message).join(", "));
        }
      } catch (error) {
        console.error("Error deleting all chat threads:", error);
        showError("An error occurred while deleting chat threads.");
      } finally {
         setIsLoading(false);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isLoading}>
         {/* Use Button for trigger consistency */}
        <Button
           variant="ghost"
           size="icon"
           className="h-10 w-10 p-0 rounded-xs ds-touch-target" // Ensure DS size/rounding/touch target
           aria-label="Chat History Options"
        >
          {isLoading ? (
            <LoadingIndicator isLoading={isLoading} size={18}/>
          ) : (
            <MoreVertical size={18} />
          )}
        </Button>
      </DropdownMenuTrigger>
       {/* DropdownMenuContent should inherit DS styles (border-2, rounded-xs, shadow-xs) */}
      <DropdownMenuContent side="right" align="start" className="rounded-xs border-2 shadow-xs w-48">
        <DropdownMenuItemWithIcon
           className="text-destructive focus:text-destructive-foreground focus:bg-destructive" // Destructive styling
           onClick={async () => await handleAction()}
        >
          <Trash size={16} />
          <span>Delete all</span>
        </DropdownMenuItemWithIcon>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};