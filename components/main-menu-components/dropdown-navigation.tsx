"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  BarChart3, 
  Settings, 
  Book, 
  HelpCircle, 
  FileText, 
  ShieldAlert,
  ClipboardList,
  Users,
  Gauge,
  LucideIcon
} from "lucide-react";
import Link from "next/link";
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DropdownNavigationProps {
  isAdmin?: boolean;
}

interface MenuItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  'data-slot'?: string;
}

const MenuItem: FC<MenuItemProps> = ({ icon: Icon, label, href, onClick, ...rest }) => (
  <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-xs ds-focus-ring p-2" {...rest}>
    <Link href={href} className="flex items-center gap-2" onClick={onClick}>
      <Icon className="size-4 text-muted-foreground" /> {/* Consistent icon size and muted color */}
      <span className="text-sm">{label}</span> {/* Use text-sm for consistency */}
    </Link>
  </DropdownMenuItem>
);

export const DropdownNavigation: FC<DropdownNavigationProps> = ({ isAdmin = false }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="ds-touch-target rounded-xs hover:bg-sidebar-accent focus-visible:bg-sidebar-accent text-sidebar-foreground" // Added hover/focus styles
          aria-label="More navigation options"
          data-slot="dropdown-nav-trigger"
        >
          <MoreVertical className="size-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-56 border-2 border-border rounded-xs shadow-xs bg-popover text-popover-foreground" // Use shadow-xs, specific bg/text
        sideOffset={8}
        data-slot="dropdown-nav-content"
      >
        <DropdownMenuLabel className="font-bold px-2 py-1.5 text-sm">Navigation</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border -mx-1" />

        <DropdownMenuGroup className="p-1">
          <MenuItem href="/doc" icon={Book} label="Documentation" data-slot="dropdown-nav-doc" />
          <MenuItem href="/help" icon={HelpCircle} label="Help & Support" data-slot="dropdown-nav-help" />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex cursor-pointer select-none items-center rounded-xs px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent gap-2 ds-focus-ring" data-slot="dropdown-nav-legal-trigger">
              <FileText className="size-4 text-muted-foreground" />
              <span className="text-sm">Legal Documents</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="border-2 border-border rounded-xs shadow-xs bg-popover text-popover-foreground p-1" data-slot="dropdown-nav-legal-content">
              <MenuItem href="/privacy" icon={FileText} label="Privacy Policy" data-slot="dropdown-nav-privacy" />
              <MenuItem href="/terms" icon={FileText} label="Terms of Service" data-slot="dropdown-nav-terms" />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        {isAdmin && (
          <>
            <DropdownMenuSeparator className="bg-border -mx-1" />
            <DropdownMenuLabel className="font-bold px-2 py-1.5 text-sm">Admin</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border -mx-1" />

            <DropdownMenuGroup className="p-1">
              <MenuItem href="/admin" icon={ShieldAlert} label="Admin Portal" data-slot="dropdown-nav-admin-portal" />
              <MenuItem href="/admin/reporting" icon={BarChart3} label="Reporting" data-slot="dropdown-nav-admin-reporting" />
              <MenuItem href="/admin/users" icon={Users} label="User Management" data-slot="dropdown-nav-admin-users" />
              <MenuItem href="/admin/logs" icon={ClipboardList} label="System Logs" data-slot="dropdown-nav-admin-logs" />
              <MenuItem href="/admin/monitor" icon={Gauge} label="System Health" data-slot="dropdown-nav-admin-monitor" />
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator className="bg-border -mx-1" />
        <DropdownMenuGroup className="p-1">
           <MenuItem href="/settings" icon={Settings} label="Settings" data-slot="dropdown-nav-settings" />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 