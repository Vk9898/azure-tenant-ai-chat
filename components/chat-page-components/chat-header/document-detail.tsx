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
        {/* Ensure button uses DS styles: rounded-xs, variant, sizing */}
        <Button variant={"outline"} className="gap-2 rounded-xs h-9 px-3 text-sm" aria-label="Current Chat Documents Menu" disabled={props.chatDocuments.length === 0}>
          <File size={16} /> {props.chatDocuments.length}
        </Button>
      </SheetTrigger>
      {/* SheetContent uses DS styles internally */}
      <SheetContent className="min-w-[400px] sm:w-[480px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Documents</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 -mx-6 flex" type="always">
          {/* Use consistent padding and gap */}
          <div className="pb-6 px-6 flex gap-3 flex-col flex-1">
            {props.chatDocuments.length > 0 ? (
              props.chatDocuments.map((doc) => (
                // Apply DS card-like styling: rounded-xs, border-2, shadow-xs, padding
                <div className="flex gap-3 items-center p-3 border-2 border-border rounded-xs bg-muted/50 shadow-xs" key={doc.id} data-slot="document-item">
                  <File size={16} className="text-muted-foreground flex-shrink-0" />
                  <div className="text-sm font-medium truncate">{doc.name}</div>
                </div>
              ))
            ) : (
               // Empty state styling
               <div className="text-center text-muted-foreground text-sm p-6 border-2 border-dashed border-border rounded-xs mt-4">
                  No documents uploaded for this chat.
               </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};