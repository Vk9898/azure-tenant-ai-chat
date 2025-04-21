"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Laptop2, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export const ThemeToggle = () => {
  const { setTheme, theme } = useTheme();

  return (
    <Tabs defaultValue={theme} className="w-full" data-slot="theme-toggle-tabs">
      {/* Apply border-2 as per DS Tabs */}
      <TabsList className="flex flex-1 border-2 border-border rounded-xs bg-muted p-0.5" data-slot="theme-toggle-list">
        <TabsTrigger
          value="light"
          onClick={() => setTheme("light")}
          // Apply shadow-xs to active state as per DS Tabs
          className={cn(
            "flex-1 rounded-xs py-1.5 text-sm font-medium ds-focus-ring ds-touch-target", // Base styles
            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs" // Active state styles
          )}
          title="Light theme"
          data-slot="theme-toggle-light"
        >
          <Sun className="size-5" />
        </TabsTrigger>
        <TabsTrigger
          value="dark"
          onClick={() => setTheme("dark")}
          className={cn(
            "flex-1 rounded-xs py-1.5 text-sm font-medium ds-focus-ring ds-touch-target",
            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
          )}
          title="Dark theme"
          data-slot="theme-toggle-dark"
        >
          <Moon className="size-5" />
        </TabsTrigger>
        <TabsTrigger
          value="system"
          onClick={() => setTheme("system")}
          className={cn(
            "flex-1 rounded-xs py-1.5 text-sm font-medium ds-focus-ring ds-touch-target",
            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
          )}
          title="System theme"
          data-slot="theme-toggle-system"
        >
          <Laptop2 className="size-5" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};