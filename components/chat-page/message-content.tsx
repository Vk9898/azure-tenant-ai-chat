import { Markdown } from "@/components/ui/markdown/markdown";
import { FunctionSquare } from "lucide-react";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { RecursiveUI } from "../ui/recursive-ui";
import { CitationAction } from "./citation/citation-action";

interface MessageContentProps {
  message: {
    role: string;
    content: string;
    name: string;
    multiModalImage?: string;
  };
}

const MessageContent: React.FC<MessageContentProps> = ({ message }) => {
  if (message.role === "assistant" || message.role === "user") {
    return (
      <div data-slot="message-content-text">
        <Markdown
          content={message.content}
          onCitationClick={CitationAction}
        ></Markdown>
        {message.multiModalImage && <img src={message.multiModalImage} className="rounded-xs border-2 border-border mt-2" data-slot="multimodal-image" />}
      </div>
    );
  }

  if (message.role === "tool" || message.role === "function") {
    return (
      <div className="py-3" data-slot="tool-message-container">
        <Accordion
          type="multiple"
          className="bg-background rounded-xs border-2 border-border p-4 shadow-xs"
          data-slot="tool-message-accordion"
        >
          <AccordionItem value="item-1" className="">
            <AccordionTrigger className="text-sm py-1 items-center gap-2">
              <div className="flex gap-2 items-center">
                <FunctionSquare
                  size={20}
                  strokeWidth={1.4}
                  className="text-muted-foreground"
                />{" "}
                Show {message.name}{" "}
                {message.name === "tool" ? "output" : "function"}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <RecursiveUI documentField={toJson(message.content)} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }

  return null;
};

const toJson = (value: string) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
};

export default MessageContent;
