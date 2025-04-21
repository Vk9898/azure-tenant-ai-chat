"use client";

import { FC, useEffect, useState } from "react";
import { 
  BarChart3, 
  Clock, 
  FileText, 
  ListFilter, 
  Search, 
  Sparkles, 
  TerminalSquare,
  Zap
} from "lucide-react";
import { getPromptLogs, getPromptMetrics, PromptLogEntry } from "./prompt-logging-service";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

interface MetricsData {
  totalPrompts: number;
  successRate: number;
  averageResponseTime: number;
  tokenUsage: number;
  modelBreakdown: Record<string, number>;
  dailyUsage: Array<{date: string; count: number}>;
}

export const ChatObservabilityDashboard: FC = () => {
  const [logs, setLogs] = useState<PromptLogEntry[]>([]);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      
      try {
        // Fetch metrics
        const metricsResponse = await getPromptMetrics();
        if (metricsResponse.status === "OK") {
          setMetrics(metricsResponse.response);
        }
        
        // Fetch logs
        const logsResponse = await getPromptLogs({ 
          limit: 100, 
          success: filter === "success" ? true : filter === "error" ? false : undefined
        });
        
        if (logsResponse.status === "OK") {
          setLogs(logsResponse.response);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [filter]);

  // Filter logs by search query
  const filteredLogs = logs.filter(log => 
    searchQuery === "" || 
    log.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.actualResponse.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.modelName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={24} className="text-primary" />
          <h2 className="ds-section-title">Chat Observability</h2>
        </div>
        <div className="ds-accent-bar"></div>
        <p className="text-muted-foreground mt-2">
          Monitor and analyze AI interactions across the platform
        </p>
      </div>
      
      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard 
            title="Total Prompts" 
            value={metrics.totalPrompts.toLocaleString()} 
            icon={<FileText className="h-5 w-5 text-primary" />}
          />
          <MetricCard 
            title="Success Rate" 
            value={`${metrics.successRate.toFixed(1)}%`} 
            icon={<Zap className="h-5 w-5 text-emerald-500" />}
          />
          <MetricCard 
            title="Avg Response Time" 
            value={`${(metrics.averageResponseTime / 1000).toFixed(2)}s`} 
            icon={<Clock className="h-5 w-5 text-yellow-500" />}
          />
          <MetricCard 
            title="Total Tokens Used" 
            value={metrics.tokenUsage.toLocaleString()} 
            icon={<Sparkles className="h-5 w-5 text-violet-500" />}
          />
        </div>
      )}
      
      <Tabs defaultValue="logs" className="w-full">
        <TabsList className="bg-muted border border-border rounded-xs h-12 mb-6">
          <TabsTrigger 
            value="logs" 
            className="rounded-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Prompt Logs
          </TabsTrigger>
          <TabsTrigger 
            value="models" 
            className="rounded-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Model Usage
          </TabsTrigger>
          <TabsTrigger 
            value="trends" 
            className="rounded-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Usage Trends
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs">
          <Card className="ds-card shadow-xs border-2">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold">Prompt Logs</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-1">
                    View and analyze all AI interactions
                  </CardDescription>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="size-4 text-muted-foreground" />
                    </div>
                    <Input 
                      type="search" 
                      placeholder="Search logs..." 
                      className="pl-10 h-12 md:h-10 rounded-xs w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ListFilter className="size-4 text-muted-foreground" />
                    <Select 
                      value={filter} 
                      onValueChange={setFilter}
                    >
                      <SelectTrigger className="h-12 md:h-10 rounded-xs w-[130px]">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xs border-2">
                        <SelectItem value="all">All Logs</SelectItem>
                        <SelectItem value="success">Success Only</SelectItem>
                        <SelectItem value="error">Errors Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <ScrollArea className="h-[500px] w-full rounded-xs">
                <Table className="border-collapse w-full">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-sm font-bold w-[180px]">Timestamp</TableHead>
                      <TableHead className="text-sm font-bold w-[120px]">Model</TableHead>
                      <TableHead className="text-sm font-bold">Prompt</TableHead>
                      <TableHead className="text-sm font-bold w-[100px]">Tokens</TableHead>
                      <TableHead className="text-sm font-bold w-[100px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
                            <p className="text-muted-foreground">Loading logs...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <FileText className="h-10 w-10 mb-2 opacity-40" />
                            <p>No logs found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow 
                          key={log.id} 
                          className="hover:bg-muted/50 cursor-pointer"
                        >
                          <TableCell className="font-mono text-xs">
                            {formatDate(log.createdAt as Date)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              {log.modelName}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[320px] truncate">
                            {log.prompt}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.tokensUsed?.toLocaleString() || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={log.success ? "success" : "destructive"} 
                              className="w-[90px] justify-center font-medium text-xs"
                            >
                              {log.success ? "Success" : "Error"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
            
            <CardFooter className="p-4 sm:p-6 flex justify-between border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {filteredLogs.length} of {logs.length} logs
              </p>
              <Button variant="outline" className="rounded-xs">
                <FileText className="mr-2 h-4 w-4" />
                Export Logs
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="models">
          <Card className="ds-card shadow-xs border-2">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl font-bold">Model Usage</CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                Breakdown of AI model usage across the platform
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              {metrics && (
                <div className="space-y-4">
                  {Object.entries(metrics.modelBreakdown).map(([model, count]) => (
                    <div key={model} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="font-medium">{model}</span>
                        </div>
                        <span className="text-sm font-mono">
                          {count.toLocaleString()} prompts
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-2 bg-primary rounded-full" 
                          style={{ 
                            width: `${(count / metrics.totalPrompts) * 100}%` 
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {((count / metrics.totalPrompts) * 100).toFixed(1)}% of total usage
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends">
          <Card className="ds-card shadow-xs border-2">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl font-bold">Usage Trends</CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                Daily usage trends over the last 30 days
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              {metrics && metrics.dailyUsage.length > 0 ? (
                <div className="h-80">
                  <div className="flex h-64 items-end gap-2">
                    {metrics.dailyUsage.map((day) => {
                      const maxCount = Math.max(...metrics.dailyUsage.map(d => d.count));
                      const height = (day.count / maxCount) * 100;
                      
                      return (
                        <div 
                          key={day.date} 
                          className="flex-1 flex flex-col items-center justify-end"
                        >
                          <div 
                            className="bg-primary/80 hover:bg-primary w-full rounded-t-xs relative group"
                            style={{ height: `${height}%` }}
                          >
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow opacity-0 group-hover:opacity-100 transition-opacity">
                              {day.count} prompts
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex gap-2 mt-2 overflow-x-auto">
                    {metrics.dailyUsage.map((day) => (
                      <div 
                        key={day.date} 
                        className="flex-1 text-xs text-muted-foreground text-center whitespace-nowrap"
                      >
                        {new Date(day.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <BarChart3 className="h-10 w-10 mb-4 opacity-40" />
                  <p>No usage data available for the past 30 days</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 flex justify-end">
        <Button className="ds-button-primary gap-2">
          <TerminalSquare className="size-4" />
          Open Chat Playground
        </Button>
      </div>
    </div>
  );
};

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