"use server";
import "server-only";

import { userHashedId } from "@/lib/auth/auth-helpers";
import { OpenAIInstance } from "@/components/common/services/openai";
import {
  ChatCompletionStreamingRunner,
  ChatCompletionStreamParams,
} from "openai/resources/beta/chat/completions";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { SimilaritySearch } from "../../../../lib/db/neondb-ai-search";
import { CreateCitations, FormatCitations } from "../citation-service";
import { ChatCitationModel, ChatThreadModel } from "../models";

export const ChatApiRAG = async (props: {
  chatThread: ChatThreadModel;
  userMessage: string;
  history: ChatCompletionMessageParam[];
  signal: AbortSignal;
  adminKbRatio?: number;
}): Promise<ChatCompletionStreamingRunner> => {
  const { chatThread, userMessage, history, signal, adminKbRatio = 0.7 } = props;
  const openAI = OpenAIInstance();
  
  const hashedId = await userHashedId();
  if (!hashedId) {
    throw new Error("User identification required");
  }

  const documentResponse = await SimilaritySearch(
    userMessage,
    10,
    hashedId,
    chatThread.id,
    adminKbRatio
  );
  
  const documents: ChatCitationModel[] = [];

  if (documentResponse.status === "OK") {
    const withoutEmbedding = FormatCitations(documentResponse.response);
    const citationResponse = await CreateCitations(withoutEmbedding);


    citationResponse.forEach((c) => {
      if (c.status === "OK") {
        documents.push(c.response);
      }
    });
  }

  const content = documents
    .map((result, index) => {
      const parsedContent = JSON.parse(result.content);
      const document = parsedContent.document
      const content = document.pageContent;
      const sourceType = document.isAdminKb ? "[ADMIN]" : "[USER]";
      const context = `[${index}]. ${sourceType} file name: ${document.metadata} \n file id: ${result.id} \n ${content}`;
      return context;
    })
    .join("\n------\n");
  // Augment the user prompt
  const _userMessage = `\n
- Review the following content from documents and create a final answer.
- If you don't know the answer, just say that you don't know. Don't try to make up an answer.
- You must always include a citation at the end of your answer and don't include full stop after the citations.
- Use the format for your citation {% citation items=[{name:"filename 1",id:"file id"}, {name:"filename 2",id:"file id"}] /%}
- Documents marked with [ADMIN] are from the organization's knowledge base and should be given priority.
- Documents marked with [USER] are from the user's personal document collection.
----------------
content: 
${content}
\n
---------------- \n
question: 
${userMessage}
`;

  const stream: ChatCompletionStreamParams = {
    model: "",
    stream: true,
    messages: [
      {
        role: "system",
        content: chatThread.personaMessage,
      },
      ...history,
      {
        role: "user",
        content: _userMessage,
      },
    ],
  };

  return openAI.beta.chat.completions.stream(stream, { signal });
};
