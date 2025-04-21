import { ImageAPIEntry } from "@/components/chat-page/chat-services/images-api";

export async function GET(req: Request) {
  return await ImageAPIEntry(req);
}