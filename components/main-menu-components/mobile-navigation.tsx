"use client";

import { cn } from "@/lib/utils";
import { Home, MessageCircle, PocketKnife, VenetianMask, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MobileDrawerMenu } from "./mobile-drawer-menu";

interface MobileNavigationProps {
  isAdmin?: boolean;
}

export const MobileNavigation: FC<MobileNavigationProps> = ({ isAdmin = false }) => {
  const pathname = usePathname();

  const NavItem = ({ href, icon: Icon, label, 'data-slot': dataSlot }: { href: string; icon: typeof Home; label: string; 'data-slot'?: string }) => {
    // More specific check for active state, especially for /chat vs /chat/threads
    const isActive = (href === "/chat" && pathname === "/chat") || (href !== "/chat" && pathname.startsWith(href));

    return (
      <Link 
        href={href}
        className={cn(
          "flex flex-col items-center justify-center gap-1 p-2 text-xs ds-touch-target min-w-[68px] flex-1 rounded-xs ds-focus-ring", // Added flex-1, rounded-xs, focus ring
          isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground hover:bg-accent/50" // Added hover bg
        )}
        data-slot={dataSlot}
      >
        <Icon size={24} strokeWidth={isActive ? 2.5 : 1.8} />
        <span className="mt-0.5">{label}</span>
      </Link>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-border bg-background md:hidden" data-slot="mobile-navigation">
      <div className="flex items-center justify-around px-1 pb-safe"> {/* Use justify-around for better spacing, add pb-safe */}
        <NavItem href="/chat" icon={Home} label="Home" data-slot="mobile-nav-home" />
        {/* TODO: Update href when chat threads page exists */}
        {/* <NavItem href="/chat/threads" icon={MessageCircle} label="Chats" data-slot="mobile-nav-chats" /> */}
        <NavItem href="/personas" icon={VenetianMask} label="Personas" data-slot="mobile-nav-personas" />
        <NavItem href="/extensions" icon={PocketKnife} label="Extensions" data-slot="mobile-nav-extensions" />

        <Sheet>
          <SheetTrigger asChild>
            {/* Use Button component styles for consistency */}
            <Button 
              variant="ghost" // Use ghost variant
              className="flex flex-col items-center justify-center gap-1 p-2 text-xs ds-touch-target min-w-[68px] flex-1 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xs" // Adjusted styles
              data-slot="mobile-nav-more-trigger"
            >
              <Menu size={24} strokeWidth={1.8} />
              <span className="mt-0.5">More</span>
            </Button>
          </SheetTrigger>
          {/* Ensure SheetContent uses design system styles (border, shadow, bg) - assumed handled by ui/sheet */}
          <SheetContent side="right" className="p-0 w-[85vw] max-w-sm" data-slot="mobile-nav-drawer-content"> {/* Adjusted width */}
            <MobileDrawerMenu isAdmin={isAdmin} />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}; 