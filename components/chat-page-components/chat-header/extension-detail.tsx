import { ExtensionModel } from "@/components/extensions-page/extension-services/models";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch"; // Ensure Switch uses DS styles
import { PocketKnife } from "lucide-react";
import { FC } from "react";
import { chatStore } from "../chat-store";

interface Props {
  extensions: Array<ExtensionModel>;
  chatThreadId: string;
  installedExtensionIds: Array<string> | undefined;
  disabled: boolean;
}

export const ExtensionDetail: FC<Props> = (props) => {
  const toggleInstall = async (isChecked: boolean, extensionId: string) => {
    if (isChecked) {
      await chatStore.AddExtensionToChatThread(extensionId);
    } else {
      await chatStore.RemoveExtensionFromChatThread(extensionId);
    }
  };

  const installedCount = props.installedExtensionIds?.length ?? 0;
  const totalCount = props.extensions.length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        {/* Ensure button uses DS styles: rounded-xs, variant, sizing */}
        <Button variant={"outline"} className="gap-2 rounded-xs h-9 px-3 text-sm" disabled={props.disabled} aria-label="Current Chat Extensions Menu">
          <PocketKnife size={16} /> {installedCount} ({totalCount})
        </Button>
      </SheetTrigger>
      {/* SheetContent uses DS styles internally */}
      <SheetContent className="min-w-[400px] sm:w-[480px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Extensions</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 -mx-6 flex" type="always">
          {/* Use consistent padding and gap */}
          <div className="pb-6 px-6 flex gap-4 flex-col flex-1" data-slot="extensions-list">
            {props.extensions.length > 0 ? (
                props.extensions.map((extension) => {
                  const isInstalled =
                    props.installedExtensionIds?.includes(extension.id) ?? false;
                  return (
                    // Apply DS card-like styling: rounded-xs, border-2, shadow-xs, padding
                    <div
                      className="flex gap-4 p-4 items-center justify-between border-2 border-border rounded-xs shadow-xs bg-card"
                      key={extension.id}
                      data-slot="extension-item"
                    >
                      <div className="flex flex-col gap-1 flex-1"> {/* Reduced gap */}
                        <div className="font-medium text-sm">{extension.name}</div>
                        <div className="text-muted-foreground text-xs"> {/* Use text-xs for description */}
                          {extension.description}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Switch
                          checked={isInstalled} // Use controlled component
                          onCheckedChange={(e) => toggleInstall(e, extension.id)}
                          aria-label={`Toggle ${extension.name} extension`}
                        />
                      </div>
                    </div>
                  );
                })
             ) : (
                 // Empty state styling
                 <div className="text-center text-muted-foreground text-sm p-6 border-2 border-dashed border-border rounded-xs mt-4">
                    No extensions available.
                 </div>
             )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};