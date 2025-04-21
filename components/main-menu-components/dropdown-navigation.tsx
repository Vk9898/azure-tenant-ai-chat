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

interface DropdownNavigationProps {
  isAdmin?: boolean;
}

interface MenuItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

const MenuItem: FC<MenuItemProps> = ({ icon: Icon, label, href, onClick }) => (
  <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-xs">
    <Link href={href} className="flex items-center gap-2" onClick={onClick}>
      <Icon className="size-4" />
      <span>{label}</span>
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
          className="ds-touch-target rounded-xs"
          aria-label="More navigation options"
        >
          <MoreVertical className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-56 border-2 border-border rounded-xs shadow-md"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-bold">Navigation</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        
        <DropdownMenuGroup>
          <MenuItem href="/doc" icon={Book} label="Documentation" />
          <MenuItem href="/help" icon={HelpCircle} label="Help & Support" />
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              <FileText className="size-4" />
              <span>Legal Documents</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="border-2 border-border rounded-xs">
              <MenuItem href="/privacy" icon={FileText} label="Privacy Policy" />
              <MenuItem href="/terms" icon={FileText} label="Terms of Service" />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        
        {isAdmin && (
          <>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuLabel className="font-bold">Admin</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            
            <DropdownMenuGroup>
              <MenuItem href="/admin" icon={ShieldAlert} label="Admin Portal" />
              <MenuItem href="/admin/reporting" icon={BarChart3} label="Reporting" />
              <MenuItem href="/admin/users" icon={Users} label="User Management" />
              <MenuItem href="/admin/logs" icon={ClipboardList} label="System Logs" />
              <MenuItem href="/admin/monitor" icon={Gauge} label="System Health" />
            </DropdownMenuGroup>
          </>
        )}
        
        <DropdownMenuSeparator className="bg-border" />
        <MenuItem href="/settings" icon={Settings} label="Settings" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 