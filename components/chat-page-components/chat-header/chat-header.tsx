import { ExtensionModel } from "@/components/extensions-page/extension-services/models";
import { CHAT_DEFAULT_PERSONA } from "@/components/theme/theme-config";
import { VenetianMask } from "lucide-react";
import { FC } from "react";
import { ChatDocumentModel, ChatThreadModel } from "../chat-services/models";
import { DocumentDetail } from "./document-detail";
import { ExtensionDetail } from "./extension-detail";
import { PersonaDetail } from "./persona-detail";

interface Props {
  chatThread: ChatThreadModel;
  chatDocuments: Array<ChatDocumentModel>;
  extensions: Array<ExtensionModel>;
}

export const ChatHeader: FC<Props> = (props) => {
  const persona =
    props.chatThread.personaMessageTitle === "" ||
    props.chatThread.personaMessageTitle === undefined
      ? CHAT_DEFAULT_PERSONA
      : props.chatThread.personaMessageTitle;
  return (
    // Use standard DS padding py-2 px-4 sm:px-6
    <div className="bg-background border-b-2 border-border flex items-center py-2 px-4 sm:px-6 sticky top-0 z-10" data-slot="chat-header">
      <div className="container max-w-3xl flex justify-between items-center gap-4"> {/* Added gap */}
        <div className="flex flex-col overflow-hidden"> {/* Added overflow hidden */}
          <span className="font-bold text-sm truncate">{props.chatThread.name}</span> {/* Added truncate */}
          <span className="text-xs text-muted-foreground flex gap-1 items-center mt-0.5 truncate"> {/* Added truncate */}
            <VenetianMask size={14} className="flex-shrink-0"/> {/* Added shrink-0 */}
            {persona}
          </span>
        </div>
        {/* Use consistent gap */}
        <div className="flex gap-2 items-center flex-shrink-0"> {/* Added shrink-0 */}
          <PersonaDetail chatThread={props.chatThread} />
          <DocumentDetail chatDocuments={props.chatDocuments} />
          <ExtensionDetail
            disabled={props.chatDocuments.length !== 0}
            extensions={props.extensions}
            installedExtensionIds={props.chatThread.extension}
            chatThreadId={props.chatThread.id}
          />
        </div>
      </div>
    </div>
  );
};