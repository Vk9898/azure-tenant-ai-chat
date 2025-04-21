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
import { Avatar, AvatarImage } from "../ui/avatar";
import { ThemeToggle } from "./theme-toggle";

export const UserProfile = () => {
  const { data: session } = useSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="ds-touch-target rounded-xs">
        {session?.user?.image ? (
          <Avatar className="size-10 border-2 border-border rounded-xs cursor-pointer" data-slot="user-avatar">
            <AvatarImage
              src={session?.user?.image!}
              alt={session?.user?.name || "User avatar"}
              className="rounded-xs"
            />
          </Avatar>
        ) : (
          <CircleUserRound 
            {...menuIconProps} 
            className="text-sidebar-foreground hover:text-sidebar-primary ds-touch-target rounded-xs cursor-pointer" 
            role="button"
            data-slot="user-icon"
          />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" className="w-56 border-2 border-border rounded-xs" align="end" data-slot="user-dropdown">
        <DropdownMenuLabel className="font-bold">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold leading-none">
              {session?.user?.name || "Guest User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session?.user?.email || "Not signed in"}
            </p>
            {session?.user?.isAdmin && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-xs inline-block w-fit font-medium">
                Admin
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuLabel className="font-bold">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold leading-none mb-2">Theme</p>
            <ThemeToggle />
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          className="flex gap-2 rounded-xs font-medium focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
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
