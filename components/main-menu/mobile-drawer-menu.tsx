"use client";

import { cn } from "@/ui/lib";
import { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Book, 
  FileText, 
  Settings, 
  LogOut, 
  LucideIcon, 
  BarChart3,
  ShieldAlert,
  HelpCircle,
  UserSquare
} from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";

interface MobileDrawerMenuProps {
  isAdmin?: boolean;
}

export const MobileDrawerMenu: FC<MobileDrawerMenuProps> = ({ isAdmin = false }) => {
  const pathname = usePathname();

  interface MenuItemProps {
    href: string;
    icon: LucideIcon;
    label: string;
    admin?: boolean;
  }

  const MenuItem = ({ href, icon: Icon, label, admin = false }: MenuItemProps) => {
    if (admin && !isAdmin) return null;

    const isActive = pathname.startsWith(href);
    
    return (
      <SheetClose asChild>
        <Link 
          href={href}
          className={cn(
            "flex items-center gap-3 px-6 py-4 border-b border-border ds-touch-target",
            isActive ? "bg-accent/50 text-foreground" : "text-muted-foreground hover:bg-accent/30"
          )}
        >
          <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
          <span className="text-base font-medium">{label}</span>
        </Link>
      </SheetClose>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b-2 border-border">
        <h2 className="text-lg font-bold">Menu</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <MenuItem href="/profile" icon={UserSquare} label="Your Profile" />
        <MenuItem href="/doc" icon={Book} label="Documentation" />
        <MenuItem href="/privacy" icon={FileText} label="Privacy Policy" />
        <MenuItem href="/terms" icon={FileText} label="Terms of Service" />
        <MenuItem href="/help" icon={HelpCircle} label="Help & Support" />
        <MenuItem href="/admin" icon={ShieldAlert} label="Admin Portal" admin={true} />
        <MenuItem href="/admin/reporting" icon={BarChart3} label="Reports & Analytics" admin={true} />
        <MenuItem href="/settings" icon={Settings} label="Settings" />
      </div>
      
      <div className="p-4 border-t-2 border-border flex items-center justify-between">
        <ThemeToggle />
        
        <form action="/api/auth/signout" method="post">
          <Button 
            type="submit" 
            variant="outline" 
            size="sm"
            className="gap-2"
            uppercase={false}
          >
            <LogOut size={18} />
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  );
}; 