import { ChatAPIEntry } from "@/components/chat-page-components/chat-services/chat-api/chat-api";
import { UserPrompt } from "@/components/chat-page-components/chat-services/models";

export async function POST(req: Request) {
  const formData = await req.formData();
  const content = formData.get("content") as unknown as string;
  const multimodalImage = formData.get("image-base64") as unknown as string;

  const userPrompt: UserPrompt = {
    ...JSON.parse(content),
    multimodalImage,
  };

  return await ChatAPIEntry(userPrompt, req.signal);
}
