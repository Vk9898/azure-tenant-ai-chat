"use client";
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs";
import { Laptop2, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export const ThemeToggle = () => {
  const { setTheme, theme } = useTheme();

  return (
    <Tabs defaultValue={theme} className="w-full">
      <TabsList className="flex flex-1 border border-border rounded-xs bg-muted">
        <TabsTrigger
          value="light"
          onClick={() => setTheme("light")}
          className="flex-1 rounded-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          title="Light theme"
          data-slot="theme-toggle-light"
        >
          <Sun className="size-5" />
        </TabsTrigger>
        <TabsTrigger
          value="dark"
          onClick={() => setTheme("dark")}
          className="flex-1 rounded-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          title="Dark theme"
          data-slot="theme-toggle-dark"
        >
          <Moon className="size-5" />
        </TabsTrigger>
        <TabsTrigger
          value="system"
          onClick={() => setTheme("system")}
          className="flex-1 rounded-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          title="System theme"
          data-slot="theme-toggle-system"
        >
          <Laptop2 className="size-5" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
