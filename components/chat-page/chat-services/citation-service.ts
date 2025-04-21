import { NeonDBInstance } from "@/components/common/services/neondb";
import { userHashedId } from "@/lib/auth/auth-helpers";
import { ServerActionResponse } from "@/components/common/server-action-response";
import { uniqueId } from "@/components/common/util";
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
      response: {
        id: rows[0].id,
        content: rows[0].content,
        type: rows[0].type,
        userId: rows[0].user_id,
      },
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
  try {
    const hashedId = userId || await userHashedId();
    
    if (!hashedId) {
      return [{
        status: "UNAUTHORIZED",
        errors: [{
          message: "User identification required",
        }],
      }];
    }
    
    const items: Array<Promise<ServerActionResponse<ChatCitationModel>>> = [];

    for (const model of models) {
      const res = CreateCitation({
        content: model,
        id: uniqueId(),
        type: CHAT_CITATION_ATTRIBUTE,
        userId: hashedId,
      });

      items.push(res);
    }

    return await Promise.all(items);
  } catch (error) {
    return [{
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }];
  }
};

export const FindCitationByID = async (
  id: string
): Promise<ServerActionResponse<ChatCitationModel>> => {
  try {
    const hashedId = await userHashedId();
    
    if (!hashedId) {
      return {
        status: "UNAUTHORIZED",
        errors: [{
          message: "User identification required",
        }],
      };
    }
    
    const query = `
      SELECT *
      FROM chat_citations
      WHERE type = $1 AND id = $2 AND user_id = $3;
    `;
    const values = [CHAT_CITATION_ATTRIBUTE, id, hashedId];

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
      response: {
        id: rows[0].id,
        content: rows[0].content,
        type: rows[0].type,
        userId: rows[0].user_id,
      },
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
        userId: "",
      },
    });
  });

  return withoutEmbedding;
};
