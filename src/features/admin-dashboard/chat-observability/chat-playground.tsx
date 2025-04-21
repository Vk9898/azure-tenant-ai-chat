"use client";

import { useState } from "react";
import { Button } from "@/features/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/features/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/features/ui/form";
import { Input } from "@/features/ui/input";
import { Textarea } from "@/features/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/features/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/ui/select";
import { Label } from "@/features/ui/label";
import { Slider } from "@/features/ui/slider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { RefreshCw, SendIcon, SparklesIcon } from "lucide-react";
import { generatePlaygroundResponse } from "./playground-service";

// Define the schema for the playground form
const formSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  expectedResponse: z.string().optional(),
  model: z.string().default("gpt-4o"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(4096).default(1000),
  systemPrompt: z.string().optional(),
});

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      expectedResponse: "",
      model: "gpt-4o",
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt: "You are a helpful AI assistant working for Azure Tenant AI Chat.",
    },
  });

  // Update the onSubmit function to use the actual API
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    try {
      const startTime = Date.now();
      
      const playgroundResponse = await generatePlaygroundResponse({
        prompt: values.prompt,
        model: values.model,
        temperature: values.temperature,
        maxTokens: values.maxTokens,
        systemPrompt: values.systemPrompt || "",
      });
      
      if (playgroundResponse.status === "OK") {
        setResult(playgroundResponse.response);
      } else {
        // Handle error
        console.error("Error from API:", playgroundResponse.errors);
        throw new Error(playgroundResponse.errors[0]?.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error generating response:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Chat Playground</CardTitle>
                <CardDescription>
                  Test prompts with different models and parameters
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                              <SelectItem value="gpt-35-turbo">GPT-3.5 Turbo</SelectItem>
                              <SelectItem value="gpt-4">GPT-4</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the model to use for generating responses
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                
                    <FormField
                      control={form.control}
                      name="temperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature: {field.value}</FormLabel>
                          <FormControl>
                            <Slider
                              min={0}
                              max={2}
                              step={0.1}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            Controls randomness. Lower values are more deterministic.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                
                    <FormField
                      control={form.control}
                      name="maxTokens"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Tokens: {field.value}</FormLabel>
                          <FormControl>
                            <Slider
                              min={100}
                              max={4096}
                              step={100}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of tokens to generate
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                
                    <FormField
                      control={form.control}
                      name="systemPrompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>System Prompt</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter system prompt..."
                              className="resize-y min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Instructions to shape the model's behavior
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
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>User Prompt</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your prompt..."
                              className="resize-y min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The prompt to send to the model
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                
                    <FormField
                      control={form.control}
                      name="expectedResponse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Response (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter what you expect the model to respond with..."
                              className="resize-y min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            What you expect the model to respond with
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Reset
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <SendIcon className="mr-2 h-4 w-4" />
                      Generate Response
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>

        {result && (
          <Tabs defaultValue="result" className="w-full">
            <TabsList>
              <TabsTrigger value="result">Model Response</TabsTrigger>
              {form.getValues("expectedResponse") && (
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
              )}
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="result">
              <Card>
                <CardHeader>
                  <CardTitle>Response</CardTitle>
                  <CardDescription>
                    Generated using {form.getValues("model")} with temperature {form.getValues("temperature")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                    {result.response}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {form.getValues("expectedResponse") && (
              <TabsContent value="comparison">
                <Card>
                  <CardHeader>
                    <CardTitle>Response Comparison</CardTitle>
                    <CardDescription>
                      Compare the expected response with the model's response
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-2 block font-semibold">Expected Response</Label>
                        <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                          {form.getValues("expectedResponse")}
                        </div>
                      </div>
                      <div>
                        <Label className="mb-2 block font-semibold">Model Response</Label>
                        <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                          {result.response}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            
            <TabsContent value="metrics">
              <Card>
                <CardHeader>
                  <CardTitle>Response Metrics</CardTitle>
                  <CardDescription>
                    Performance metrics for this response
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard 
                      title="Prompt Tokens" 
                      value={result.tokens.prompt.toString()} 
                      icon={<SparklesIcon className="h-4 w-4" />}
                    />
                    <MetricCard 
                      title="Completion Tokens" 
                      value={result.tokens.completion.toString()} 
                      icon={<SparklesIcon className="h-4 w-4" />}
                    />
                    <MetricCard 
                      title="Total Tokens" 
                      value={result.tokens.total.toString()} 
                      icon={<SparklesIcon className="h-4 w-4" />}
                    />
                    <MetricCard 
                      title="Response Time" 
                      value={`${result.timeTaken.toFixed(2)}s`} 
                      icon={<SparklesIcon className="h-4 w-4" />}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-2">
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="mt-2 text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
} 