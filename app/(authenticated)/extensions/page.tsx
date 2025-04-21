import { ExtensionPage } from "@/components/extensions-page/extension-page";
import { FindAllExtensionsForAdmin } from "@/components/extensions-page/extension-services/extension-service";
import { DisplayError } from "@/components/ui/error/display-error";

export default async function Home() {
  const extensionResponse = await FindAllExtensionsForAdmin();

  if (extensionResponse.status !== "OK") {
    return <DisplayError errors={extensionResponse.errors} />;
  }

  return (
    <div className="flex flex-col min-h-screen" data-slot="extensions-page">
      <ExtensionPage extensions={extensionResponse.response} showWebSearchTemplates={true} />
    </div>
  );
}
