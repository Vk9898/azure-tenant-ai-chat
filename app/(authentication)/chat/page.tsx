import { FindAllExtensionsForCurrentUser } from "@/components/extensions-page/extension-services/extension-service";
import { FindAllPersonaForCurrentUser } from "@/components/persona-page-components/persona-services/persona-service";
import { DisplayError } from "@/components/ui/error/display-error";
import { ExtensionModel } from "@/components/extensions-page/extension-services/models";
import { PersonaModel } from "@/components/persona-page-components/persona-services/models";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Hero } from "@/components/ui/hero";
import { AI_DESCRIPTION, AI_NAME } from "@/components/theme/theme-config";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ExtensionCard } from "@/components/extensions-page/extension-card/extension-card";
import { PersonaCard } from "@/components/persona-page-components/persona-card/persona-card";
import { AddExtension } from "@/components/extensions-page/add-extension/add-new-extension";
import { auth } from "@/lib/auth/auth-api";
import { redirect } from "next/navigation";

export default async function Home() {
  // Check if user is authenticated - this happens in the server component
  // This is a protected route in the (authentication) folder, so the layout should handle auth
  // But we'll add an extra check here for safety
  const session = await auth();
  
  if (!session?.user) {
    redirect('/api/auth/signin');
    return null;
  }
  
  try {
    const [personaResponse, extensionResponse] = await Promise.all([
      FindAllPersonaForCurrentUser(),
      FindAllExtensionsForCurrentUser(),
    ]);

    if (personaResponse.status !== "OK") {
      return <DisplayError errors={personaResponse.errors} />;
    }

    if (extensionResponse.status !== "OK") {
      return <DisplayError errors={extensionResponse.errors} />;
    }
    
    const personas = personaResponse.response;
    const extensions = extensionResponse.response;
    
    return (
      <div className="flex flex-col min-h-screen" data-slot="chat-home-page">
        <ScrollArea className="flex-1">
          <main className="flex flex-1 flex-col">
            <Hero
              title={
                <>
                  <div className="flex items-center gap-3">
                    <Image
                      src={"/ai-icon.png"}
                      width={64}
                      height={64}
                      quality={100}
                      alt="AI Icon"
                      className="rounded-xs"
                    />
                    <span>{AI_NAME}</span>
                  </div>
                </>
              }
              description={AI_DESCRIPTION}
            />
            
            <div className="container max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-10 sm:space-y-12">
              <section>
                <div className="mb-6 sm:mb-8">
                  <h2 className="ds-section-title">Extensions</h2>
                  <div className="ds-accent-bar"></div>
                </div>

                {extensions && extensions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {extensions.map((extension) => (
                      <ExtensionCard
                        extension={extension}
                        key={extension.id}
                        showContextMenu={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border p-6 sm:p-8 flex flex-col items-center justify-center text-center rounded-xs" data-slot="empty-state">
                    <div className="size-12 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-4">
                      <PlusCircle className="size-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">No Extensions Found</h3>
                    <p className="text-muted-foreground mb-6">Add extensions to enhance your AI chat experience</p>
                    <Button 
                      className="ds-button-primary"
                      onClick={() => {
                        const addExtensionElement = document.querySelector('[data-extension-add]');
                        if (addExtensionElement) {
                          (addExtensionElement as HTMLButtonElement).click();
                        }
                      }}
                    >
                      Create Extension
                    </Button>
                  </div>
                )}
              </section>
              
              <section>
                <div className="mb-6 sm:mb-8">
                  <h2 className="ds-section-title">Personas</h2>
                  <div className="ds-accent-bar"></div>
                </div>

                {personas && personas.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {personas.map((persona) => (
                      <PersonaCard
                        persona={persona}
                        key={persona.id}
                        showContextMenu={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border p-6 sm:p-8 flex flex-col items-center justify-center text-center rounded-xs" data-slot="empty-state">
                    <div className="size-12 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-4">
                      <PlusCircle className="size-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">No Personas Found</h3>
                    <p className="text-muted-foreground mb-6">Create personas to customize your chat experience</p>
                  </div>
                )}
              </section>
            </div>
            
            {/* Hidden AddExtension for triggering */}
            <div className="hidden">
              <AddExtension />
            </div>
          </main>
        </ScrollArea>
      </div>
    );
  } catch (error) {
    console.error("Error loading chat page:", error);
    return <DisplayError errors={[{ message: "Failed to load chat page. Please try again." }]} />;
  }
}
