
import { FC } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddExtension } from "@/components/extensions-page/add-extension/add-new-extension";
import { ExtensionCard } from "@/components/extensions-page/extension-card/extension-card";
import { ExtensionHero } from "@/components/extensions-page/extension-hero/extension-hero";
import { ExtensionModel } from "@/components/extensions-page/extension-services/models";
import { WebSearchTemplates } from "@/components/extensions-page/web-search-templates/web-search-templates";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FindAllExtensionsForAdmin } from "@/components/extensions-page/extension-services/extension-service";
import { DisplayError } from "@/components/ui/error/display-error";


interface Props {
  extensions: ExtensionModel[];
  showWebSearchTemplates?: boolean;
}

export const ExtensionPage: FC<Props> = (props) => {
  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col">
        <ExtensionHero />
        <div className="container max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="ds-section-title">Function Extensions</h2>
                <div className="ds-accent-bar"></div>
              </div>
              
              <AddExtension>
                <Button className="ds-button-primary w-full sm:w-auto gap-2">
                  <PlusCircle className="size-4" />
                  New Extension
                </Button>
              </AddExtension>
            </div>
          </div>
          
          {props.showWebSearchTemplates && (
            <div className="mb-8">
              <WebSearchTemplates />
            </div>
          )}
          
          {props.extensions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {props.extensions.map((extension) => (
                <ExtensionCard
                  extension={extension}
                  key={extension.id}
                  showContextMenu
                />
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-border p-6 sm:p-8 flex flex-col items-center justify-center text-center rounded-xs" data-slot="empty-state">
              <div className="size-12 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-4">
                <PlusCircle className="size-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">No Extensions Found</h3>
              <p className="text-muted-foreground mb-6">Create your first extension to enhance your AI chat capabilities</p>
              <AddExtension>
                <Button className="ds-button-primary">Create Extension</Button>
              </AddExtension>
            </div>
          )}
        </div>
      </main>
    </ScrollArea>
  );
};


