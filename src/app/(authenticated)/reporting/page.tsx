import { ChatReportingPage } from "@/features/reporting-page/reporting-page";

interface Props {
  params: Promise<{}>;
  searchParams: Promise<{
    pageNumber?: string;
  }>;
}

export default async function Home(props: Props) {
  return (
    (<div className="flex flex-col min-h-screen" data-slot="reporting-page">
      <ChatReportingPage page={Number((await props.searchParams).pageNumber ?? 0)} />
    </div>)
  );
}
