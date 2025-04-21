"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { menuIconProps } from "@/components/ui/menu";
import { CircleUserRound, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"; // Added AvatarFallback
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

export const UserProfile = () => {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Guest";
  const userInitial = userName?.charAt(0).toUpperCase() || "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="ds-touch-target rounded-xs ds-focus-ring">
        {session?.user?.image ? (
          <Avatar className="size-10 border-2 border-border rounded-xs cursor-pointer hover:opacity-90 transition-opacity" data-slot="user-avatar">
            <AvatarImage
              src={session?.user?.image!}
              alt={session?.user?.name || "User avatar"}
              className="rounded-xs"
            />
            <AvatarFallback className="rounded-xs bg-muted text-muted-foreground font-bold">
              {userInitial}
            </AvatarFallback>
          </Avatar>
        ) : (
          <button
             className="flex items-center justify-center size-10 border-2 border-border rounded-xs cursor-pointer bg-muted hover:bg-accent transition-colors ds-focus-ring"
             data-slot="user-icon-button"
             aria-label="User profile options"
          >
            <CircleUserRound
              size={24} // Explicit size
              className="text-muted-foreground"
            />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="end"
        // Apply DS styles: border-2, rounded-xs, shadow-xs, popover bg/text
        className="w-56 border-2 border-border rounded-xs shadow-xs bg-popover text-popover-foreground"
        data-slot="user-dropdown-content"
      >
        <DropdownMenuLabel className="font-normal px-2 py-1.5" data-slot="user-info-label">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none">
              {session?.user?.name || "Guest User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session?.user?.email || "Not signed in"}
            </p>
            {session?.user?.isAdmin && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-xs inline-block w-fit font-medium mt-1">
                Admin
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border -mx-1" />
        <div className="p-2" data-slot="theme-toggle-section">
          <p className="text-sm font-bold leading-none mb-2 px-2">Theme</p>
          <ThemeToggle />
        </div>
        <DropdownMenuSeparator className="bg-border -mx-1" />
        <DropdownMenuItem
          // Apply DS styles: rounded-xs, focus styles for destructive action
          className={cn(
              "flex gap-2 rounded-xs font-medium focus:bg-destructive focus:text-destructive-foreground cursor-pointer m-1 p-2 text-sm",
              "ds-focus-ring" // Ensure focus ring compatibility
          )}
          onClick={() => signOut({ callbackUrl: "/" })}
          data-slot="logout-button"
        >
          <LogOut className="size-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};