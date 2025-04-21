"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { DisplayError } from "../../components/ui/error/display-error";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import ChatThreadRow from "./table-row";
import { FindAllChatThreadsForAdmin } from "./reporting-services/reporting-service";
import { Button } from "../../components/ui/button";

const SEARCH_PAGE_SIZE = 100;

export async function ReportingContent({ page }: { page: number }) {
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
    <div className="container max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h2 className="ds-section-title">Chat History</h2>
        <div className="ds-accent-bar"></div>
      </div>
      
      <Card className="ds-card shadow-xs mb-6 sm:mb-8">
        <CardHeader className="p-4 sm:p-6 pb-0 sm:pb-0">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="size-5 text-muted-foreground" />
            </div>
            <Input 
              type="search" 
              placeholder="Search conversations..." 
              className="pl-10 h-12 md:h-10 rounded-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 overflow-auto">
          <Table className="border-collapse w-full">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-base font-bold">Conversation</TableHead>
                <TableHead className="w-[200px] text-base font-bold">User</TableHead>
                <TableHead className="w-[120px] text-base font-bold">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chatThreads && chatThreads.length > 0 ? (
                chatThreads.map((chatThread) => (
                  <ChatThreadRow key={chatThread.id} {...chatThread} />
                ))
              ) : (
                <TableRow>
                  <TableHead colSpan={3} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <p>No conversation history found</p>
                    </div>
                  </TableHead>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              {chatThreads.length > 0 ? 
                `Showing ${page * SEARCH_PAGE_SIZE + 1} to ${page * SEARCH_PAGE_SIZE + chatThreads.length}` : 
                'No results'}
            </p>
            <div className="flex gap-2">
              {previousPage >= 0 && (
                <Button asChild size="sm" variant="outline" className="rounded-xs font-bold">
                  <Link href={"/reporting?pageNumber=" + previousPage}>
                    <ChevronLeft className="size-4 mr-1" />
                    Previous
                  </Link>
                </Button>
              )}
              {hasMoreResults && (
                <Button asChild size="sm" variant="outline" className="rounded-xs font-bold">
                  <Link href={"/reporting?pageNumber=" + nextPage}>
                    Next
                    <ChevronRight className="size-4 ml-1" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 