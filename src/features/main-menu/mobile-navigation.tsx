"use client";

import { cn } from "@/ui/lib";
import { Home, MessageCircle, PocketKnife, VenetianMask, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/features/ui/sheet";
import { Button } from "@/features/ui/button";
import { MobileDrawerMenu } from "./mobile-drawer-menu";

interface MobileNavigationProps {
  isAdmin?: boolean;
}

export const MobileNavigation: FC<MobileNavigationProps> = ({ isAdmin = false }) => {
  const pathname = usePathname();
  
  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: typeof Home; label: string }) => {
    const isActive = pathname.startsWith(href) && (href !== "/" || pathname === "/");
    
    return (
      <Link 
        href={href}
        className={cn(
          "flex flex-col items-center justify-center gap-1 py-2 text-xs ds-touch-target min-w-[68px]",
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Icon size={24} strokeWidth={isActive ? 2.5 : 1.8} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-border bg-background md:hidden">
      <div className="flex items-center justify-between px-2">
        <NavItem href="/chat" icon={Home} label="Home" />
        <NavItem href="/chat/threads" icon={MessageCircle} label="Chats" />
        <NavItem href="/personas" icon={VenetianMask} label="Personas" />
        <NavItem href="/extensions" icon={PocketKnife} label="Extensions" />
        
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="flex flex-col items-center justify-center gap-1 py-2 text-xs ds-touch-target min-w-[68px] hover:bg-transparent"
            >
              <Menu size={24} strokeWidth={1.8} />
              <span>More</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 border-l-2">
            <MobileDrawerMenu isAdmin={isAdmin} />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}; 