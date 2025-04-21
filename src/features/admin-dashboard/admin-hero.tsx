"use client";
import { Hero } from "@/features/ui/hero";
import { BarChart3, Shield, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/features/ui/button";

export const AdminHero = () => {
  return (
    <Hero
      title="Admin Dashboard"
      description="System administration dashboard with usage metrics and user activity"
      icon={<ShieldCheck size={32} className="text-primary" strokeWidth={2} />}
    >
      <Button
        variant="outline"
        className="h-auto py-3 justify-start gap-3 border-2"
        onClick={() => window.location.href = '/admin/users'}
      >
        <div className="bg-primary/10 p-1.5 rounded-xs">
          <Users className="size-5 text-primary" />
        </div>
        <div className="text-left">
          <div className="font-bold">View Users</div>
          <div className="text-xs text-muted-foreground">Manage system users</div>
        </div>
      </Button>
      
      <Button
        variant="outline"
        className="h-auto py-3 justify-start gap-3 border-2"
        onClick={() => window.location.href = '/admin/chat-observability'}
      >
        <div className="bg-primary/10 p-1.5 rounded-xs">
          <BarChart3 className="size-5 text-primary" />
        </div>
        <div className="text-left">
          <div className="font-bold">Analytics</div>
          <div className="text-xs text-muted-foreground">Usage statistics and logs</div>
        </div>
      </Button>
    </Hero>
  );
}; 