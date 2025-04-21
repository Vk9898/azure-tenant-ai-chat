import { AdminDashboard } from "@/features/admin-dashboard/admin-dashboard";

export default async function AdminPage(
  props: {
    searchParams?: Promise<{ [key: string]: string | string[] }>;
  }
) {
  const searchParams = await props.searchParams;
  const pageNumber = searchParams?.page ? parseInt(searchParams.page as string) : 0;

  return <AdminDashboard page={pageNumber} />;
} 