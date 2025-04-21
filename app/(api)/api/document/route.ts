import { SearchAzureAISimilarDocuments } from "@/components/chat-page-components/chat-services/chat-api/chat-api-rag-extension";

export async function POST(req: Request) {
  return SearchAzureAISimilarDocuments(req);
}
