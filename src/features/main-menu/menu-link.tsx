"use client";
import { cn } from "@/ui/lib";
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
  return (
    <Link
      className={cn(
        ButtonLinkVariant,
        "rounded-xs hover:bg-sidebar-accent focus-visible:bg-sidebar-accent ds-focus-ring",
        path.startsWith(props.href) && props.href !== "/" ? "text-sidebar-primary" : "",
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
