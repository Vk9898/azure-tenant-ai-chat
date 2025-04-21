import { ChatPersonaPage } from "@/features/persona-page/persona-page";
import { FindAllPersonasForAdmin } from "@/features/persona-page/persona-services/persona-service";
import { DisplayError } from "@/features/ui/error/display-error";

export default async function Home() {
  const personasResponse = await FindAllPersonasForAdmin();
  if (personasResponse.status !== "OK") {
    return <DisplayError errors={personasResponse.errors} />;
  }
  return <ChatPersonaPage personas={personasResponse.response} />;
}
