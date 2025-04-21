import { FC, Suspense } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { AdminHero } from "./admin-hero";
import { PageLoader } from "../ui/page-loader";
import { 
  GetRecentActivities, 
  GetTopActiveUsers, 
  GetUserMetrics 
} from "./admin-services/admin-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { DisplayError } from "../ui/error/display-error";
import { UsersTable } from "./users-table";
import { RecentActivityTable } from "./recent-activity-table";

interface AdminDashboardProps {
  page: number;
}

export const AdminDashboard: FC<AdminDashboardProps> = async (props) => {
  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col">
        <AdminHero />
        <Suspense fallback={<PageLoader />} key={props.page}>
          <DashboardContent {...props} />
        </Suspense>
      </main>
    </ScrollArea>
  );
};

async function DashboardContent(props: AdminDashboardProps) {
  // Get all the data we need for the dashboard
  const [metricsResponse, topUsersResponse, recentActivitiesResponse] = 
    await Promise.all([
      GetUserMetrics(),
      GetTopActiveUsers(5),
      GetRecentActivities(10)
    ]);

  if (metricsResponse.status !== "OK") {
    return <DisplayError errors={metricsResponse.errors} />;
  }

  if (topUsersResponse.status !== "OK") {
    return <DisplayError errors={topUsersResponse.errors} />;
  }

  if (recentActivitiesResponse.status !== "OK") {
    return <DisplayError errors={recentActivitiesResponse.errors} />;
  }

  const metrics = metricsResponse.response;
  const topUsers = topUsersResponse.response;
  const recentActivities = recentActivitiesResponse.response;

  return (
    <div className="container max-w-6xl py-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <MetricCard 
          title="Total Users" 
          value={metrics.totalUsers.toString()} 
          description="Unique users on platform" 
        />
        <MetricCard 
          title="Total Chats" 
          value={metrics.totalChats.toString()} 
          description="Chat threads created" 
        />
        <MetricCard 
          title="Total Messages" 
          value={metrics.totalMessages.toString()} 
          description="Messages exchanged" 
        />
        <MetricCard 
          title="Active Users (7d)" 
          value={metrics.activeUsersLast7Days.toString()} 
          description="Users active in last week" 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Users by Activity</CardTitle>
            <CardDescription>Most active users on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <UsersTable users={topUsers} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivityTable activities={recentActivities} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
}

function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
} 