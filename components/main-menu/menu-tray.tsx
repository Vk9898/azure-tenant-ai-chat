"use client";

import { cn } from "@/ui/lib";
import React from "react";
import { useMenuSidebar } from "./menu-store";

export const MenuTray = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isOpen } = useMenuSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col border-r-2 border-sidebar-border bg-sidebar text-sidebar-foreground overflow-hidden transition-all duration-500 w-72 sm:w-80",
        isOpen ? "translate-x-0" : "-translate-x-full -ml-72 sm:-ml-80",
        className
      )}
      data-slot="menu-tray"
      {...props}
    >
      {props.children}
    </div>
  );
});
MenuTray.displayName = "MenuTray";
