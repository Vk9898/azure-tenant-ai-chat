import { Markdown } from "@/components/ui/markdown/markdown";
import { FunctionSquare } from "lucide-react";
import React from "react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"; // Ensure Accordion uses DS styles internally
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
        {message.multiModalImage && <Image src={message.multiModalImage} alt="Multimodal content" className="rounded-xs border-2 border-border mt-2 shadow-xs" data-slot="multimodal-image" width={500} height={300} />}
      </div>
    );
  }

  if (message.role === "tool" || message.role === "function") {
    return (
      // Container for the accordion
      <div className="py-3" data-slot="tool-message-container">
        <Accordion
          type="multiple"
          // Accordion itself doesn't need extra classes if its internal components follow DS
          className="w-full" // Ensure it takes full width
          data-slot="tool-message-accordion"
        >
          {/* AccordionItem already applies DS styles (rounded-xs, border-2, shadow-xs) */}
          <AccordionItem value="item-1">
            {/* AccordionTrigger styling comes from the component */}
            <AccordionTrigger className="text-sm py-1 px-2 items-center gap-2">
              <div className="flex gap-2 items-center">
                <FunctionSquare
                  size={20}
                  strokeWidth={1.4}
                  className="text-muted-foreground"
                />
                Show {message.name}{" "}
                {message.name === "tool" ? "output" : "function"}
              </div>
            </AccordionTrigger>
             {/* AccordionContent styling comes from the component */}
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