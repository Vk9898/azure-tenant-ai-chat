import { NeonDBInstance } from "@/features/common/services/neondb";
import { userHashedId } from "@/features/auth-page/helpers";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { uniqueId } from "@/features/common/util";
import { DocumentSearchResponse } from "./ai-search/neondb-ai-search";
import { CHAT_CITATION_ATTRIBUTE, ChatCitationModel } from "./models";

export const CreateCitation = async (
  model: ChatCitationModel
): Promise<ServerActionResponse<ChatCitationModel>> => {
  try {
    const query = `
      INSERT INTO chat_citations (id, content, type, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [
      model.id,
      model.content,
      model.type,
      model.userId,
    ];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    if (rows.length === 0) {
      return {
        status: "ERROR",
        errors: [{ message: "Citation not created" }],
      };
    }

    return {
      status: "OK",
      response: rows[0],
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};

export const CreateCitations = async (
  models: DocumentSearchResponse[],
  userId?: string
): Promise<Array<ServerActionResponse<ChatCitationModel>>> => {
  const items: Array<Promise<ServerActionResponse<ChatCitationModel>>> = [];

  for (const model of models) {
    const res = CreateCitation({
      content: model,
      id: uniqueId(),
      type: CHAT_CITATION_ATTRIBUTE,
      userId: userId || (await userHashedId()),
    });

    items.push(res);
  }

  return await Promise.all(items);
};

export const FindCitationByID = async (
  id: string
): Promise<ServerActionResponse<ChatCitationModel>> => {
  try {
    const query = `
      SELECT *
      FROM chat_citations
      WHERE type = $1 AND id = $2 AND user_id = $3;
    `;
    const values = [CHAT_CITATION_ATTRIBUTE, id, await userHashedId()];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    if (rows.length === 0) {
      return {
        status: "ERROR",
        errors: [{ message: "Citation not found" }],
      };
    }

    return {
      status: "OK",
      response: rows[0],
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};

export const FormatCitations = (citation: DocumentSearchResponse[]) => {
  const withoutEmbedding: DocumentSearchResponse[] = [];
  citation.forEach((d) => {
    withoutEmbedding.push({
      score: d.score,
      document: {
        metadata: d.document.metadata,
        pageContent: d.document.pageContent,
        chatThreadId: d.document.chatThreadId,
        id: "",
        user: "",
      },
    });
  });

  return withoutEmbedding;
};
