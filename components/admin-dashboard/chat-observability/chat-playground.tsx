"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { z } from "zod";
import { 
  BarChart3, 
  Clock, 
  RefreshCw, 
  Send, 
  Sparkles, 
  TerminalSquare, 
  Zap 
} from "lucide-react";
import { generatePlaygroundResponse } from "./playground-service";
import { logPrompt } from "./prompt-logging-service";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define the schema for the playground form with required fields
const formSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  model: z.string(),
  temperature: z.number(),
  maxTokens: z.number(),
  expectedResponse: z.string().optional(),
  systemPrompt: z.string().optional(),
});

// Define the form values type manually instead of using z.infer
type FormValues = {
  prompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  expectedResponse?: string;
  systemPrompt?: string;
};

type PromptResult = {
  response: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  timeTaken: number;
};

export function ChatPlayground() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PromptResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      model: "gpt-4o",
      temperature: 0.7,
      maxTokens: 1000,
      expectedResponse: "",
      systemPrompt: "You are a helpful AI assistant working for Azure Tenant AI Chat.",
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    
    try {
      const startTime = Date.now();
      
      const playgroundResponse = await generatePlaygroundResponse({
        prompt: data.prompt,
        model: data.model,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
        systemPrompt: data.systemPrompt || "",
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (playgroundResponse.status === "OK") {
        setResult(playgroundResponse.response);
        
        // Log the prompt and response
        await logPrompt({
          modelName: data.model,
          prompt: data.prompt,
          expectedResponse: data.expectedResponse,
          actualResponse: playgroundResponse.response.response,
          temperature: data.temperature,
          maxTokens: data.maxTokens,
          tokensUsed: playgroundResponse.response.tokens.total,
          responseTimeMs: responseTime,
          success: true,
          metadata: {
            systemPrompt: data.systemPrompt,
            source: "admin-playground"
          }
        });
      } else {
        // Handle error
        console.error("Error from API:", playgroundResponse.errors);
        
        // Log the error
        await logPrompt({
          modelName: data.model,
          prompt: data.prompt,
          expectedResponse: data.expectedResponse,
          actualResponse: "Error: " + (playgroundResponse.errors[0]?.message || "Unknown error"),
          temperature: data.temperature,
          maxTokens: data.maxTokens,
          responseTimeMs: responseTime,
          success: false,
          errorMessage: playgroundResponse.errors[0]?.message || "Unknown error",
          metadata: {
            systemPrompt: data.systemPrompt,
            source: "admin-playground"
          }
        });
        
        throw new Error(playgroundResponse.errors[0]?.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error generating response:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-2">
          <TerminalSquare size={24} className="text-primary" />
          <h2 className="ds-section-title">Chat Playground</h2>
        </div>
        <div className="ds-accent-bar"></div>
        <p className="text-muted-foreground mt-2">
          Test prompts with different models and parameters to fine-tune your system behavior
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="ds-card shadow-xs border-2">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">Model Configuration</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-1">
                      Configure model parameters and prompt settings
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-xs px-2 py-1 rounded-xs">
                    Admin Only
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Model</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 md:h-10 rounded-xs">
                                <SelectValue placeholder="Select model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xs border-2">
                              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                              <SelectItem value="gpt-35-turbo">GPT-3.5 Turbo</SelectItem>
                              <SelectItem value="gpt-4">GPT-4</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs text-muted-foreground">
                            Select the model to use for generating responses
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                
                    <FormField
                      control={form.control}
                      name="temperature"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-sm font-medium">Temperature</FormLabel>
                            <Badge variant="outline" className="font-mono text-xs">
                              {field.value.toFixed(1)}
                            </Badge>
                          </div>
                          <FormControl>
                            <Slider
                              min={0}
                              max={2}
                              step={0.1}
                              value={[field.value]}
                              className="py-2"
                              onValueChange={(value: number[]) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-muted-foreground">
                            Controls randomness. Lower values are more deterministic.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                
                    <FormField
                      control={form.control}
                      name="maxTokens"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-sm font-medium">Max Tokens</FormLabel>
                            <Badge variant="outline" className="font-mono text-xs">
                              {field.value}
                            </Badge>
                          </div>
                          <FormControl>
                            <Slider
                              min={100}
                              max={4096}
                              step={100}
                              value={[field.value]}
                              className="py-2"
                              onValueChange={(value: number[]) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-muted-foreground">
                            Maximum number of tokens to generate
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                
                    <FormField
                      control={form.control}
                      name="systemPrompt"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">System Prompt</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter system prompt..."
                              className="resize-y min-h-[100px] h-12 md:h-32 rounded-xs"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-muted-foreground">
                            Instructions to shape the model&apos;s behavior
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
              
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="prompt"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">User Prompt</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your prompt..."
                              className="resize-y min-h-[150px] h-12 md:h-52 rounded-xs font-medium"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-muted-foreground">
                            The prompt to send to the model
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                
                    <FormField
                      control={form.control}
                      name="expectedResponse"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Expected Response (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter what you expect the model to respond with..."
                              className="resize-y min-h-[150px] h-12 md:h-52 rounded-xs"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-muted-foreground">
                            What you expect the model to respond with
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-4 sm:p-6 flex flex-col sm:flex-row sm:justify-between gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  className="rounded-xs border-2 w-full sm:w-auto"
                  onClick={() => form.reset()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Reset Form
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="ds-button-primary w-full sm:w-auto gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Generate Response
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>

        {result && (
          <div className="mt-6">
            <Tabs defaultValue="result" className="w-full">
              <TabsList className="bg-muted border border-border rounded-xs h-12 mb-6">
                <TabsTrigger 
                  value="result" 
                  className="rounded-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Model Response
                </TabsTrigger>
                {form.getValues("expectedResponse") && (
                  <TabsTrigger 
                    value="comparison" 
                    className="rounded-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Comparison
                  </TabsTrigger>
                )}
                <TabsTrigger 
                  value="metrics" 
                  className="rounded-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Metrics
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="result">
                <Card className="ds-card shadow-xs border-2">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <CardTitle className="text-xl font-bold">Model Response</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground mt-1">
                          Generated using {form.getValues("model")}
                        </CardDescription>
                      </div>
                      <Badge 
                        className="w-fit bg-primary/10 text-primary border-0 px-3 py-1.5 rounded-xs"
                      >
                        Temp: {form.getValues("temperature").toFixed(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                    <ScrollArea className="h-[300px] sm:h-[400px] w-full rounded-xs">
                      <div className="bg-muted/50 p-4 rounded-xs whitespace-pre-wrap font-medium border border-border">
                        {result.response}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {form.getValues("expectedResponse") && (
                <TabsContent value="comparison">
                  <Card className="ds-card shadow-xs border-2">
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-xl font-bold">Response Comparison</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground mt-1">
                        Compare the expected response with the model&apos;s response
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <Label className="mb-2 block text-sm font-bold">Expected Response</Label>
                          <ScrollArea className="h-[300px] w-full rounded-xs">
                            <div className="bg-muted/50 p-4 rounded-xs whitespace-pre-wrap font-medium border border-border">
                              {form.getValues("expectedResponse")}
                            </div>
                          </ScrollArea>
                        </div>
                        <div>
                          <Label className="mb-2 block text-sm font-bold">Model Response</Label>
                          <ScrollArea className="h-[300px] w-full rounded-xs">
                            <div className="bg-muted/50 p-4 rounded-xs whitespace-pre-wrap font-medium border border-border">
                              {result.response}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
              
              <TabsContent value="metrics">
                <Card className="ds-card shadow-xs border-2">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-xl font-bold">Response Metrics</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-1">
                      Performance metrics for this response
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <MetricCard 
                        title="Prompt Tokens" 
                        value={result.tokens.prompt.toString()} 
                        icon={<Sparkles className="h-5 w-5 text-yellow-500" />}
                      />
                      <MetricCard 
                        title="Completion Tokens" 
                        value={result.tokens.completion.toString()} 
                        icon={<Sparkles className="h-5 w-5 text-emerald-500" />}
                      />
                      <MetricCard 
                        title="Total Tokens" 
                        value={result.tokens.total.toString()} 
                        icon={<Zap className="h-5 w-5 text-primary" />}
                      />
                      <MetricCard 
                        title="Response Time" 
                        value={`${result.timeTaken.toFixed(2)}s`} 
                        icon={<Clock className="h-5 w-5 text-violet-500" />}
                      />
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-2">Usage Visualization</h3>
                      <div className="rounded-xs overflow-hidden bg-muted/30 border border-border">
                        <div className="h-8 flex">
                          <div 
                            className="bg-yellow-500/70 flex items-center justify-center text-xs font-medium text-background h-full"
                            style={{ width: `${(result.tokens.prompt / result.tokens.total) * 100}%` }}
                          >
                            {Math.round((result.tokens.prompt / result.tokens.total) * 100)}%
                          </div>
                          <div 
                            className="bg-emerald-500/70 flex items-center justify-center text-xs font-medium text-background h-full"
                            style={{ width: `${(result.tokens.completion / result.tokens.total) * 100}%` }}
                          >
                            {Math.round((result.tokens.completion / result.tokens.total) * 100)}%
                          </div>
                        </div>
                        <div className="flex text-xs text-muted-foreground px-2 py-1 justify-between border-t border-border/50">
                          <span>Prompt: {result.tokens.prompt} tokens</span>
                          <span>Completion: {result.tokens.completion} tokens</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <Card className="ds-card shadow-xs border-2">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{title}</span>
          {icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
} 