import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { File } from "lucide-react";
import { FC } from "react";
import { ChatDocumentModel } from "../chat-services/models";

interface Props {
  chatDocuments: Array<ChatDocumentModel>;
}

export const DocumentDetail: FC<Props> = (props) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {/* Added rounded-xs */}
        <Button variant={"outline"} className="gap-2 rounded-xs" aria-label="Current Chat Documents Menu" disabled={props.chatDocuments.length === 0}>
          <File size={16} /> {props.chatDocuments.length}
        </Button>
      </SheetTrigger>
       {/* SheetContent should inherit DS styles (border-2, rounded-xs, shadow-xs) */}
      <SheetContent className="min-w-[480px] sm:w-[540px] flex flex-col rounded-xs border-2 shadow-xs">
        <SheetHeader>
          <SheetTitle>Documents</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 -mx-6 flex" type="always">
          <div className="pb-6 px-6 flex gap-3 flex-col flex-1"> {/* Increased gap */}
            {props.chatDocuments.length > 0 ? (
              props.chatDocuments.map((doc) => (
                <div className="flex gap-2 items-center p-3 border rounded-xs bg-muted/50" key={doc.id}> {/* Added styling */}
                  <File size={16} className="text-muted-foreground" />
                  <div className="text-sm font-medium">{doc.name}</div>
                </div>
              ))
            ) : (
               <div className="text-center text-muted-foreground text-sm p-6">
                  No documents uploaded for this chat.
               </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};