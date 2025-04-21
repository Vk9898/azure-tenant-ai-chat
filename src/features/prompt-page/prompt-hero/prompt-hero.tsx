"use client";
import { NotebookPen, PlusCircle, Sparkles } from "lucide-react";
import { promptStore } from "../prompt-store";
import { Button } from "@/features/ui/button";

export const PromptHero = () => {
  return (
    <div className="bg-muted py-8 md:py-12 border-b-2 border-border">
      <div className="container px-4 sm:px-6 max-w-6xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-xs">
              <NotebookPen size={32} className="text-primary" strokeWidth={2} />
            </div>
            <div className="max-w-xl">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Prompt Library</h1>
              <p className="text-muted-foreground mt-1">
                Create and manage prompt templates to help users get creative without having to come up with ideas from scratch.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto py-3 justify-start gap-3 border-2"
              onClick={() => promptStore.newPrompt()}
            >
              <div className="bg-primary/10 p-1.5 rounded-xs">
                <PlusCircle className="size-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-bold">Create New</div>
                <div className="text-xs text-muted-foreground">Build custom template</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto py-3 justify-start gap-3 border-2"
              onClick={() =>
                promptStore.updatePrompt({
                  createdAt: new Date(),
                  id: "",
                  name: "Problem Framing",
                  description: `
Given the following problem statement:
[PROBLEM STATEMENT]

Generate a response with the following points:
1. Problem framing
2. Solution overview and recommendations 
3. List down the recommended MVP Scope
4. How to ensure user adoption
5. How to measure success 
6. List down similar products
7. Potential sponsor question (5 questions) 
                  `,
                  isPublished: false,
                  type: "PROMPT",
                  userId: "",
                })
              }
            >
              <div className="bg-primary/10 p-1.5 rounded-xs">
                <Sparkles className="size-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-bold">Problem Framing</div>
                <div className="text-xs text-muted-foreground">Use template</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
