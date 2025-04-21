import { ChatReportingComponent } from "@/components/reporting-page-components/reporting-component";

// Add a minimal type annotation for the props
export default function ReportingPage(props: any) {
  // Extract page number from search params 
  const searchParams = props.searchParams || {};
  const pageNumberParam = searchParams.pageNumber;
  
  // Handle potential string array for pageNumber, default to 0
  const pageNumberStr = Array.isArray(pageNumberParam)
    ? pageNumberParam[0]
    : pageNumberParam;
    
  const page = pageNumberStr ? parseInt(pageNumberStr) : 0;
  
  return <ChatReportingComponent page={page} />;
}