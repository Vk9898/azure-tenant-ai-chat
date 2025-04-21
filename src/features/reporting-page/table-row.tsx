"use client";
import { useRouter } from "next/navigation";
import { ChatThreadModel } from "../chat-page/chat-services/models";
import { TableCell, TableRow } from "../ui/table";
import { ChevronRight } from "lucide-react";

interface ChatThreadRowProps extends ChatThreadModel {}

const ChatThreadRow: React.FC<ChatThreadRowProps> = (props) => {
  const chatThread = props;
  const router = useRouter();
  
  // Format the date in a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <TableRow
      key={chatThread.id}
      className="cursor-pointer transition-colors hover:bg-muted/50"
      onClick={() => {
        router.push("/reporting/chat/" + chatThread.id);
      }}
    >
      <TableCell className="font-medium">
        <div className="flex items-center">
          <span className="truncate max-w-[250px] sm:max-w-none">{chatThread.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{chatThread.useName || "Anonymous User"}</TableCell>
      <TableCell className="text-muted-foreground flex items-center justify-between">
        <span>{formatDate(chatThread.createdAt)}</span>
        <ChevronRight className="size-4 text-muted-foreground/70" />
      </TableCell>
    </TableRow>
  );
};

export default ChatThreadRow;
