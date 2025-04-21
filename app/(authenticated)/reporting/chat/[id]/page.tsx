import ReportingChatPage from "@/components/reporting-page/reporting-chat-page";
import { FindAllChatMessagesForAdmin } from "@/components/reporting-page/reporting-services/reporting-service";
import { DisplayError } from "@/components/ui/error/display-error";

interface HomeParams {
  params: Promise<{
    id: string;
  }>;
}

export default async function Home(props: HomeParams) {
  const [chatResponse] = await Promise.all([
    FindAllChatMessagesForAdmin((await props.params).id),
  ]);

  if (chatResponse.status !== "OK") {
    return <DisplayError errors={chatResponse.errors} />;
  }

  return (
    <ReportingChatPage chatDocuments={[]} messages={chatResponse.response} />
  );
}
