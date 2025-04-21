"use client";

import { cn } from "@/lib/utils";
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
    'data-slot'?: string;
  }

  const MenuItem = ({ href, icon: Icon, label, admin = false, ...rest }: MenuItemProps) => {
    if (admin && !isAdmin) return null;

    const isActive = pathname.startsWith(href);

    return (
      <SheetClose asChild>
        <Link 
          href={href}
          className={cn(
            "flex items-center gap-3 px-6 py-4 border-b border-border ds-touch-target ds-focus-ring rounded-none", // Use rounded-none for full width feel, ensure focus ring
            isActive ? "bg-accent/50 text-foreground font-bold" : "text-muted-foreground hover:bg-accent/30" // Make active bolder
          )}
          {...rest} // Pass data-slot
        >
          <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
          <span className="text-base font-medium">{label}</span>
        </Link>
      </SheetClose>
    );
  };

  return (
    <div className="flex flex-col h-full" data-slot="mobile-drawer-menu">
      <div className="p-6 border-b-2 border-border">
        <h2 className="text-lg font-bold">Menu</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <MenuItem href="/profile" icon={UserSquare} label="Your Profile" data-slot="mobile-menu-profile" />
        <MenuItem href="/doc" icon={Book} label="Documentation" data-slot="mobile-menu-doc" />
        <MenuItem href="/privacy" icon={FileText} label="Privacy Policy" data-slot="mobile-menu-privacy" />
        <MenuItem href="/terms" icon={FileText} label="Terms of Service" data-slot="mobile-menu-terms" />
        <MenuItem href="/help" icon={HelpCircle} label="Help & Support" data-slot="mobile-menu-help" />
        <MenuItem href="/admin" icon={ShieldAlert} label="Admin Portal" admin={true} data-slot="mobile-menu-admin" />
        <MenuItem href="/admin/reporting" icon={BarChart3} label="Reports & Analytics" admin={true} data-slot="mobile-menu-reporting" />
        <MenuItem href="/settings" icon={Settings} label="Settings" data-slot="mobile-menu-settings" />
      </div>

      <div className="p-4 border-t-2 border-border flex items-center justify-between gap-4">
        <div className="flex-1">
           <ThemeToggle />
        </div>

        <form action="/api/auth/signout" method="post">
          {/* Apply button styles correctly */}
          <Button 
            type="submit" 
            variant="outline" // Use outline variant
            size="sm" // Use small size
            className="gap-2 ds-touch-target" // Ensure touch target
            uppercase={false} // Keep text case as is
            data-slot="mobile-menu-signout"
          >
            <LogOut size={18} />
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  );
}; 