"use client";

import { FC, Suspense } from "react";
import { ScrollArea } from "../../components/ui/scroll-area";
import { ReportingHero } from "./reporting-hero";
import { PageLoader } from "../../components/ui/page-loader";
import { ReportingContent } from "./reporting-content";

export interface ChatReportingProps {
  page: number;
}

export const ChatReportingComponent: FC<ChatReportingProps> = (props) => {
  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col">
        <ReportingHero />
        <Suspense fallback={<PageLoader />} key={props.page}>
          <ReportingContent page={props.page} />
        </Suspense>
      </main>
    </ScrollArea>
  );
}; 