import { ScrollArea } from "@/features/ui/scroll-area";
import { getCurrentUser } from "@/features/auth-page/helpers";
import { redirect } from "next/navigation";
import { Hero } from "@/features/ui/hero";
import { BarChart, Database, SparklesIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/features/ui/card";
import { getPromptLogs, getPromptMetrics } from "@/features/admin-dashboard/chat-observability/prompt-logging-service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/features/ui/tabs";

export default async function PromptLogsPage() {
  const user = await getCurrentUser();

  if (!user.isAdmin) {
    redirect("/");
  }

  const [logsResponse, metricsResponse] = await Promise.all([
    getPromptLogs({ limit: 100 }),
    getPromptMetrics()
  ]);

  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col">
        <Hero
          title={
            <>
              <Database size={36} strokeWidth={1.5} />
              Prompt Logs & Metrics
            </>
          }
          description={
            "Monitor and analyze prompt logs and usage metrics"
          }
        />
        
        <div className="container max-w-7xl py-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="logs">Prompt Logs</TabsTrigger>
            </TabsList>
            
            {metricsResponse.status === "OK" && (
              <TabsContent value="overview">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                  <MetricCard 
                    title="Total Prompts" 
                    value={metricsResponse.response.totalPrompts.toString()} 
                    description="Total prompts processed" 
                    icon={<SparklesIcon className="h-4 w-4" />}
                  />
                  <MetricCard 
                    title="Success Rate" 
                    value={`${metricsResponse.response.successRate.toFixed(2)}%`} 
                    description="Prompt success percentage" 
                    icon={<SparklesIcon className="h-4 w-4" />}
                  />
                  <MetricCard 
                    title="Avg Response Time" 
                    value={`${metricsResponse.response.averageResponseTime.toFixed(2)}ms`} 
                    description="Average response time" 
                    icon={<SparklesIcon className="h-4 w-4" />}
                  />
                  <MetricCard 
                    title="Total Tokens" 
                    value={metricsResponse.response.tokenUsage.toLocaleString()} 
                    description="Total tokens used" 
                    icon={<SparklesIcon className="h-4 w-4" />}
                  />
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Model Usage Breakdown</CardTitle>
                      <CardDescription>Usage by model type</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(metricsResponse.response.modelBreakdown).map(([model, count]) => (
                          <div key={model} className="flex items-center justify-between">
                            <div className="font-medium">{model}</div>
                            <div className="flex items-center">
                              <div className="ml-2">{count} prompts</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Usage</CardTitle>
                      <CardDescription>Prompt count over the last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <BarChart 
                          className="h-[300px] w-full"
                        />
                        <div className="text-center text-sm text-muted-foreground">
                          Chart visualization requires additional configuration
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}
            
            {logsResponse.status === "OK" && (
              <TabsContent value="logs">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Prompt Logs</CardTitle>
                    <CardDescription>
                      Most recent prompts processed by the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Time</th>
                            <th className="text-left p-2">Model</th>
                            <th className="text-left p-2">Prompt</th>
                            <th className="text-left p-2">Response</th>
                            <th className="text-left p-2">Status</th>
                            <th className="text-left p-2">Tokens</th>
                          </tr>
                        </thead>
                        <tbody>
                          {logsResponse.response.map((log) => (
                            <tr key={log.id} className="border-b hover:bg-muted/50">
                              <td className="p-2 align-top">
                                {new Date(log.createdAt as Date).toLocaleString()}
                              </td>
                              <td className="p-2 align-top">{log.modelName}</td>
                              <td className="p-2 align-top">
                                <div className="max-w-[200px] overflow-hidden text-ellipsis max-h-[100px]">
                                  {log.prompt}
                                </div>
                              </td>
                              <td className="p-2 align-top">
                                <div className="max-w-[200px] overflow-hidden text-ellipsis max-h-[100px]">
                                  {log.actualResponse}
                                </div>
                              </td>
                              <td className="p-2 align-top">
                                <span className={`px-2 py-1 rounded-full text-xs ${log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {log.success ? 'Success' : 'Failed'}
                                </span>
                              </td>
                              <td className="p-2 align-top">{log.tokensUsed}</td>
                            </tr>
                          ))}
                          
                          {logsResponse.response.length === 0 && (
                            <tr>
                              <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                No prompt logs found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
    </ScrollArea>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

function MetricCard({ title, value, description, icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
} 