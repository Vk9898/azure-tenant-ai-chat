"use server";
import { NeonDBInstance } from "@/features/common/services/neondb";

import { userHashedId } from "@/features/auth-page/helpers";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { OpenAIEmbeddingInstance } from "@/features/common/services/openai";
import { uniqueId } from "@/features/common/util";

export interface NeonSearchDocument {
  id: string;
  pageContent: string;
  embedding?: number[];
  userId: string;
  chatThreadId: string;
  metadata: string;
}

export type DocumentSearchResponse = {
  score: number;
  document: NeonSearchDocument;
};

export const SimpleSearch = async (
  searchText?: string,
  filter?: string
): Promise<ServerActionResponse<Array<DocumentSearchResponse>>> => {
  try {
    const query = `
      SELECT id, page_content AS "pageContent", user, chat_thread_id AS "chatThreadId", metadata, embedding
      FROM documents
      WHERE ($1::text IS NULL OR page_content ILIKE '%' || $1 || '%')
      AND ($2::text IS NULL OR metadata = $2);
    `;
    const values = [searchText, filter];
    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    return {
      status: "OK",
      response: rows.map((row: any) => ({
        score: 1, // Placeholder for actual scoring logic
        document: row,
      })),
    };
  } catch (e) {
    return {
      status: "ERROR",
      errors: [{
        message: `${e}`,
      }],
    };
  }
};

export const SimilaritySearch = async (
  searchText: string,
  k: number,
  userId: string,
  chatThreadId: string,
): Promise<ServerActionResponse<Array<DocumentSearchResponse>>> => {
  try {
    const openai = OpenAIEmbeddingInstance();
    const embeddings = await openai.embeddings.create({
      input: searchText,
      model: "",
    });

    const embeddingVector = embeddings.data[0].embedding;

    const query = `
        SELECT id, 
               page_content AS "pageContent", 
               user_id, 
               chat_thread_id AS "chatThreadId", 
               metadata, 
               embedding,
               (embedding <-> $1::vector) AS distance
        FROM documents
        WHERE user_id = $2 AND chat_thread_id = $3
        ORDER BY distance ASC
        LIMIT $4;
    `;

    const values = [
      `[${embeddingVector.join(", ")}]`,
      userId,
      chatThreadId,
      k,
    ];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    return {
      status: "OK",
      response: rows.map((row: Record<string, any>) => ({
        score: 1 / (1 + row.distance), // Convert distance to similarity score
        document: row,
      })),
    };
  } catch (e) {
    console.error(e);
    return {
      status: "ERROR",
      errors: [{
        message: `${e}`,
      }],
    };
  }
};

export const IndexDocuments = async (
  fileName: string,
  docs: string[],
  chatThreadId: string
): Promise<Array<ServerActionResponse<boolean>>> => {
  try {
    const documentsToIndex: NeonSearchDocument[] = [];
    const sql = await NeonDBInstance();
    for (const doc of docs) {
      documentsToIndex.push({
        id: uniqueId(),
        chatThreadId,
        userId: await userHashedId(),
        pageContent: doc,
        metadata: fileName,
        embedding: [],
      });
    }

    const embeddingsResponse = await EmbedDocuments(documentsToIndex);

    if (embeddingsResponse.status === "OK") {
      try {
        const queries = embeddingsResponse.response.map((doc) => {
          // Ensure embedding is valid
          if (!Array.isArray(doc.embedding) || doc.embedding.length !== 1536) {
            throw new Error('Embedding must be a 1536-dimensional vector');
          }
          // Insert into the database
          return sql(
            `INSERT INTO documents (id, page_content, user_id, chat_thread_id, metadata, embedding)
             VALUES ($1, $2, $3, $4, $5, $6);`,
            [
              doc.id,
              doc.pageContent,
              doc.userId,
              doc.chatThreadId,
              doc.metadata,
              `[${doc.embedding.join(', ')}]`, // Pass valid vector
            ]
          );
        });
        await Promise.all(queries);
        return documentsToIndex.map(() => ({ status: "OK", response: true }));
      } catch (e) {
        console.error(e);
        throw e;
      }
    }

    return [embeddingsResponse];
  } catch (e) {
    return [{
      status: "ERROR",
      errors: [{
        message: `${e}`,
      }],
    }];
  }
};

export const EmbedDocuments = async (
  documents: Array<NeonSearchDocument>
): Promise<ServerActionResponse<Array<NeonSearchDocument>>> => {
  try {
    const openai = OpenAIEmbeddingInstance();
    const contentsToEmbed = documents.map((d) => d.pageContent);

    const embeddings = await openai.embeddings.create({
      input: contentsToEmbed,
      model: process.env.OPENAI_EMBEDDING_MODEL,
    });

    embeddings.data.forEach((embedding: { embedding: number[] | undefined; }, index: number) => {
      documents[index].embedding = embedding.embedding;
    });

    return {
      status: "OK",
      response: documents,
    };
  } catch (e) {
    return {
      status: "ERROR",
      errors: [{
        message: `${e}`,
      }],
    };
  }
};
