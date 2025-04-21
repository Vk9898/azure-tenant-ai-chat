"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingIndicator } from "@/components/ui/loading";
import { cn } from "@/lib/utils";
import { BookmarkCheck, MoreVertical, Pencil, Trash, Bookmark } from "lucide-react"; // Added Bookmark
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC, useState } from "react";
import { ChatThreadModel } from "../chat-services/models";
import {
  BookmarkChatThread,
  DeleteChatThreadByID,
  UpdateChatThreadTitle,
} from "./chat-menu-service";
import { Button } from "@/components/ui/button"; // Import Button

interface ChatMenuItemProps {
  href: string;
  chatThread: ChatThreadModel;
  children?: React.ReactNode;
}

export const ChatMenuItem: FC<ChatMenuItemProps> = (props) => {
  const path = usePathname();
  const isActive = path === props.href; // Exact match for active state
  const { isLoading, handleAction } = useDropdownAction({
    chatThread: props.chatThread,
  });

  return (
    // Apply DS styles for container: flex, items-center, padding, text color, rounding, transitions, hover/active states
    <div className={cn(
        "flex group items-center justify-between pr-2 text-muted-foreground rounded-xs transition-colors h-10", // Added justify-between and height
        isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted hover:text-foreground"
        )}
         data-slot="chat-menu-item-container"
        >
      {/* Link styling */}
      <Link
        href={props.href}
        className={cn(
          "flex-1 flex items-center gap-2 pl-2 py-2 overflow-hidden text-sm", // Adjusted padding
           isActive ? "font-semibold" : "font-medium"
        )}
        data-slot="chat-menu-item-link"
        title={props.chatThread.name} // Add title for overflow
      >
         {props.chatThread.bookmarked && <Bookmark size={14} className={cn("flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")}/>}
        <span className="truncate">{props.children}</span>
      </Link>
      {/* Dropdown trigger */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={isLoading}>
           {/* Use Button for trigger consistency: variant=ghost, size=icon, rounded-xs, touch target */}
          <Button
             variant="ghost"
             size="icon"
             className="h-8 w-8 p-0 rounded-xs ds-touch-target flex-shrink-0" // Ensure size and shrink
             aria-label="Chat Menu Item Options"
          >
            {isLoading ? (
              <LoadingIndicator isLoading={true} size={16} /> // Adjusted size
            ) : (
              <MoreVertical size={16} />
            )}
          </Button>
        </DropdownMenuTrigger>
         {/* DropdownMenuContent uses DS styles internally (border-2, rounded-xs, shadow-xs) */}
        <DropdownMenuContent side="right" align="start" className="w-48">
          <DropdownMenuItemWithIcon
            onClick={async () => await handleAction("bookmark")}
          >
            {props.chatThread.bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            <span>
              {props.chatThread.bookmarked ? "Unbookmark" : "Bookmark"}
            </span>
          </DropdownMenuItemWithIcon>
          <DropdownMenuItemWithIcon
            onClick={async () => await handleAction("rename")}
          >
            <Pencil size={16} />
            <span>Rename</span>
          </DropdownMenuItemWithIcon>
          <DropdownMenuSeparator />
          <DropdownMenuItemWithIcon
            className="text-destructive focus:text-destructive-foreground focus:bg-destructive" // Destructive styling
            onClick={async () => await handleAction("delete")}
          >
            <Trash size={16} />
            <span>Delete</span>
          </DropdownMenuItemWithIcon>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

type DropdownAction = "bookmark" | "rename" | "delete";

const useDropdownAction = (props: { chatThread: ChatThreadModel }) => {
  const { chatThread } = props;
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: DropdownAction) => {
    setIsLoading(true);
    try {
      switch (action) {
        case "bookmark":
          await BookmarkChatThread({ chatThread });
          break;
        case "rename":
          const name = window.prompt(`Enter new name for "${chatThread.name}":`, chatThread.name);
          if (name !== null && name.trim() !== "") {
            await UpdateChatThreadTitle({ chatThread, name: name.trim() });
          }
          break;
        case "delete":
          if (
            window.confirm(`Are you sure you want to delete "${chatThread.name}"?`)
          ) {
            await DeleteChatThreadByID(chatThread.id);
          }
          break;
      }
    } catch (error) {
      console.error(`Error performing action ${action}:`, error);
      // Optionally show an error message to the user
      alert(`An error occurred: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleAction,
  };
};

// Ensure DropdownMenuItem uses DS styles internally (rounded-xs, padding, font)
export const DropdownMenuItemWithIcon: FC<{
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string; // Allow passing className
}> = (props) => {
  return (
    <DropdownMenuItem
        className={cn("flex gap-2 cursor-pointer text-sm p-2 items-center", props.className)} // Ensure internal DS styles applied
        onClick={props.onClick}
        >
      {props.children}
    </DropdownMenuItem>
  );
};