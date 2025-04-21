import { ChatReportingComponent } from "@/components/reporting-page/reporting-component";

interface PageProps {
  searchParams?: { pageNumber?: string };
}

export default function ReportingPage({ searchParams }: PageProps) {
  const page = searchParams?.pageNumber ? parseInt(searchParams.pageNumber) : 0;
  return <ChatReportingComponent page={page} />;
}
