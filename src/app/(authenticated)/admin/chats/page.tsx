import { ScrollArea } from "@/features/ui/scroll-area";
import { Suspense } from "react";
import { PageLoader } from "@/features/ui/page-loader";
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/features/ui/table";
import { DisplayError } from "@/features/ui/error/display-error";
import { Button } from "@/features/ui/button";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { FindAllChatThreadsForAdmin } from "@/features/reporting-page/reporting-services/reporting-service";
import { Hero } from "@/features/ui/hero";
import ChatThreadRow from "@/features/reporting-page/table-row";

const SEARCH_PAGE_SIZE = 100;

export default async function AdminChatHistoriesPage(
  props: {
    searchParams?: Promise<{ [key: string]: string | string[] }>;
  }
) {
  const searchParams = await props.searchParams;
  const pageNumber = searchParams?.page ? parseInt(searchParams.page as string) : 0;

  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col">
        <AdminChatsHero />
        <Suspense fallback={<PageLoader />} key={pageNumber}>
          <ChatsContent page={pageNumber} />
        </Suspense>
      </main>
    </ScrollArea>
  );
}

const AdminChatsHero = () => {
  return (
    <Hero
      title={
        <>
          <ShieldCheck size={36} strokeWidth={1.5} />
          Admin Chat Histories
        </>
      }
      description={
        "View and monitor all chat conversations in the system"
      }
    />
  );
};

async function ChatsContent({ page }: { page: number }) {
  let pageNumber = page < 0 ? 0 : page;
  let nextPage = pageNumber + 1;
  let previousPage = pageNumber - 1;

  const chatHistoryResponse = await FindAllChatThreadsForAdmin(
    SEARCH_PAGE_SIZE,
    page * SEARCH_PAGE_SIZE
  );

  if (chatHistoryResponse.status !== "OK") {
    return <DisplayError errors={chatHistoryResponse.errors} />;
  }

  const chatThreads = chatHistoryResponse.response;
  const hasMoreResults = chatThreads.length === SEARCH_PAGE_SIZE;
  
  return (
    <div className="container max-w-4xl py-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Conversation</TableHead>
            <TableHead className="w-[200px]">User</TableHead>
            <TableHead className="w-[100px]">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chatThreads &&
            chatThreads.map((chatThread) => (
              <ChatThreadRow key={chatThread.id} {...chatThread} />
            ))}
        </TableBody>
      </Table>
      <div className="flex gap-2 p-2 justify-end">
        {previousPage >= 0 && (
          <Button asChild size={"icon"} variant={"outline"}>
            <Link href={`/admin/chats?page=${previousPage}`}>
              <ChevronLeft />
            </Link>
          </Button>
        )}
        {hasMoreResults && (
          <Button asChild size={"icon"} variant={"outline"}>
            <Link href={`/admin/chats?page=${nextPage}`}>
              <ChevronRight />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
} 