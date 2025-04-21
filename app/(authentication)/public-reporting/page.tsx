import { ChatReportingComponent } from "@/components/reporting-page-components/reporting-component";

interface Props {
  params: Promise<{}>;
  searchParams: Promise<{
    pageNumber?: string;
  }>;
}

export default async function Home(props: Props) {
  return (
    (<div className="flex flex-col min-h-screen" data-slot="reporting-page">
      <ChatReportingComponent page={Number((await props.searchParams).pageNumber ?? 0)} />
    </div>)
  );
}
