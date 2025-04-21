"use client";
import { Hero } from "@/features/ui/hero";
import { ShieldCheck } from "lucide-react";

export const AdminHero = () => {
  return (
    <Hero
      title={
        <>
          <ShieldCheck size={36} strokeWidth={1.5} />
          Admin Dashboard
        </>
      }
      description={
        "System administration dashboard with usage metrics and user activity"
      }
    ></Hero>
  );
}; 