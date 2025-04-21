"use client";
import { BarChart3 } from "lucide-react";

export const ReportingHero = () => {
  return (
    <div className="bg-muted py-8 md:py-12 border-b-2 border-border">
      <div className="container px-4 sm:px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xs">
              <BarChart3 size={32} className="text-primary" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Reporting Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Monitor user activity and conversation history across the platform
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <div className="bg-background border-2 border-border rounded-xs px-3 py-2 text-center min-w-[100px]">
              <p className="text-2xl font-bold">{new Date().toLocaleDateString()}</p>
              <p className="text-xs text-muted-foreground">Current Date</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
