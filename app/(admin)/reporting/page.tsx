import { ChatReportingComponent } from "@/components/reporting-page/reporting-component";

export default function ReportingPage({ searchParams }: {
  searchParams?: { pageNumber?: string | string[] }
}) {
  // Handle potential string array for pageNumber, default to 0
  const pageNumberParam = searchParams?.pageNumber;
  const pageNumberStr = Array.isArray(pageNumberParam)
    ? pageNumberParam[0]
    : pageNumberParam;
    
  const page = pageNumberStr ? parseInt(pageNumberStr) : 0;
  
  return <ChatReportingComponent page={page} />;
}