import { ImageAPIEntry } from "@/components/chat-page-components/chat-services/images-api";

export async function GET(req: Request) {
  return await ImageAPIEntry(req);
}