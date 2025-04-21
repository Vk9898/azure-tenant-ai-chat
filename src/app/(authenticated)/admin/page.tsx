import { AdminDashboard } from "@/features/admin-dashboard/admin-dashboard";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] };
}) {
  const pageNumber = searchParams?.page ? parseInt(searchParams.page as string) : 0;
  
  return <AdminDashboard page={pageNumber} />;
} 