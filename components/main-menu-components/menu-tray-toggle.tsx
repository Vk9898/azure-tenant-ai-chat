"use client";
import { Button } from "@/components/ui/button";
import { MenuItem } from "@/components/ui/menu";
import { useMenuSidebar } from "./menu-store";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

export const MenuTrayToggle = () => {
  const { isOpen, toggleSidebar } = useMenuSidebar();

  return (
    <MenuItem tooltip={isOpen ? "Collapse Menu" : "Expand Menu"} asChild>
      <Button
        variant="ghost"
        className="h-12 w-12 p-0 text-sidebar-foreground hover:bg-sidebar-accent focus-visible:bg-sidebar-accent ds-touch-target rounded-xs"
        onClick={() => toggleSidebar()}
        data-test="menu-tray-toggle"
        data-slot="menu-tray-toggle"
        uppercase={false} // Assuming this prop exists from previous context
        aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"} // Added aria-label
      >
        {isOpen ? <ChevronsLeft /> : <ChevronsRight />}
        <span className="sr-only">
          {isOpen ? "Collapse sidebar" : "Expand sidebar"}
        </span>
      </Button>
    </MenuItem>
  );
};