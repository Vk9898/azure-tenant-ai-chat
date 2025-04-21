import { ChatPersonaPage } from "@/app/(admin)/persona/page";
import { FindAllPersonasForAdmin } from "@/components/persona-page/persona-services/persona-service";
import { DisplayError } from "@/components/ui/error/display-error";

export default async function Home() {
  const personasResponse = await FindAllPersonasForAdmin();
  if (personasResponse.status !== "OK") {
    return <DisplayError errors={personasResponse.errors} />;
  }
  return <ChatPersonaPage personas={personasResponse.response} />;
}
