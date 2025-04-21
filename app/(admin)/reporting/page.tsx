import { ChatReportingComponent } from "@/components/reporting-page/reporting-component";

// Updated PageProps for Server Component
interface PageProps {
  searchParams?: { pageNumber?: string | string[] | undefined }; // searchParams are directly passed as an object
}

export default function ReportingPage({ searchParams }: PageProps) {
  // Handle potential string array for pageNumber, default to 0
  const pageNumberStr = Array.isArray(searchParams?.pageNumber)
    ? searchParams.pageNumber[0]
    : searchParams?.pageNumber;
    
  const page = pageNumberStr ? parseInt(pageNumberStr) : 0;
  
  return <ChatReportingComponent page={page} />;
}