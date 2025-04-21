"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC } from "react";
import { ButtonLinkVariant } from "../ui/button";

interface MenuLinkProps {
  href: string;
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
}

export const MenuLink: FC<MenuLinkProps> = (props) => {
  const path = usePathname();
  // More specific active check: exact match for '/', startsWith otherwise
  const isActive = props.href === "/" ? path === "/" : path.startsWith(props.href);

  return (
    <Link
      className={cn(
        ButtonLinkVariant, // Base button link styles (padding, flex, etc.)
        "rounded-xs hover:bg-sidebar-accent focus-visible:bg-sidebar-accent ds-focus-ring ds-touch-target", // DS styles: radius, hover/focus, focus ring, touch target
        "h-12 w-12", // Ensure consistent square size like toggle button
        isActive ? "text-sidebar-primary bg-sidebar-accent" : "text-sidebar-foreground", // Active/inactive states using sidebar colors
        props.className
      )}
      href={props.href}
      aria-label={props.ariaLabel}
      data-slot="menu-link"
    >
      {props.children}
    </Link>
  );
};