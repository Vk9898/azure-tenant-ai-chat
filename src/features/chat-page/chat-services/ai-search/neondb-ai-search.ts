"use server";
import { NeonDBInstance } from "@/features/common/services/neondb";

import { getCurrentUser, userHashedId } from "@/features/auth-page/helpers";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { OpenAIEmbeddingInstance } from "@/features/common/services/openai";
import { uniqueId } from "@/features/common/util";
import {
  AzureKeyCredential,
  SearchClient,
} from "@azure/search-documents";

export interface NeonSearchDocument {
  id: string;
  pageContent: string;
  embedding?: number[];
  userId: string;
  chatThreadId: string;
  metadata: string;
  isAdminKb?: boolean;
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
      SELECT id, page_content AS "pageContent", user_id, chat_thread_id AS "chatThreadId", metadata, embedding, is_admin_kb AS "isAdminKb"
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
  adminRatio: number = 0.7 // 70% admin documents by default
): Promise<ServerActionResponse<Array<DocumentSearchResponse>>> => {
  try {
    const openai = OpenAIEmbeddingInstance();
    const embeddings = await openai.embeddings.create({
      input: searchText,
      model: "",
    });

    const embeddingVector = embeddings.data[0].embedding;
    
    // Calculate the number of documents to retrieve from each source
    const adminK = Math.max(1, Math.floor(k * adminRatio));
    const userK = Math.max(1, k - adminK);

    const sql = await NeonDBInstance();
    
    // Query admin documents first
    const adminQuery = `
      SELECT id, 
             page_content AS "pageContent", 
             user_id, 
             chat_thread_id AS "chatThreadId", 
             metadata, 
             embedding,
             is_admin_kb AS "isAdminKb",
             (embedding <-> $1::vector) AS distance
      FROM documents
      WHERE is_admin_kb = TRUE
      ORDER BY distance ASC
      LIMIT $2;
    `;

    const adminValues = [
      `[${embeddingVector.join(", ")}]`,
      adminK,
    ];
    
    const adminRows = await sql(adminQuery, adminValues);

    // Then query user's personal documents
    const userQuery = `
      SELECT id, 
             page_content AS "pageContent", 
             user_id, 
             chat_thread_id AS "chatThreadId", 
             metadata, 
             embedding,
             is_admin_kb AS "isAdminKb",
             (embedding <-> $1::vector) AS distance
      FROM documents
      WHERE user_id = $2 AND chat_thread_id = $3 AND is_admin_kb = FALSE
      ORDER BY distance ASC
      LIMIT $4;
    `;

    const userValues = [
      `[${embeddingVector.join(", ")}]`,
      userId,
      chatThreadId,
      userK,
    ];

    const userRows = await sql(userQuery, userValues);
    
    // Combine results and sort by distance
    const combinedRows = [...adminRows, ...userRows].sort((a, b) => a.distance - b.distance);

    return {
      status: "OK",
      response: combinedRows.map((row: Record<string, any>) => ({
        score: 1 / (1 + row.distance), // Convert distance to similarity score
        document: {
          id: row.id,
          pageContent: row.pageContent,
          userId: row.user_id,
          chatThreadId: row.chatThreadId,
          metadata: row.metadata,
          embedding: row.embedding,
          isAdminKb: row.isAdminKb,
        },
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

export const ExtensionSimilaritySearch = async (props: {
  searchText: string;
  vectors: string[];
  apiKey: string;
  searchName: string;
  indexName: string;
}): Promise<ServerActionResponse<Array<DocumentSearchResponse>>> => {
  try {
    const openai = OpenAIEmbeddingInstance();
    const { searchText, vectors, apiKey, searchName, indexName } = props;

    const embeddings = await openai.embeddings.create({
      input: searchText,
      model: "",
    });
    const endpointSuffix = process.env.AZURE_SEARCH_ENDPOINT_SUFFIX || "search.windows.net";

    const endpoint = `https://${searchName}.${endpointSuffix}`;

    const searchClient = new SearchClient(
      endpoint,
      indexName,
      new AzureKeyCredential(apiKey)
    );

    const searchResults = await searchClient.search(searchText, {
      top: 3,

      // filter: filter,
      vectorSearchOptions: {
        queries: [
          {
            vector: embeddings.data[0].embedding,
            fields: vectors,
            kind: "vector",
            kNearestNeighborsCount: 10,
          },
        ],
      },
    });

    const results: Array<any> = [];
    for await (const result of searchResults.results) {
      const item = {
        score: result.score,
        document: result.document,
      };

      // exclude the all the fields that are not in the fields array
      const document = item.document as any;
      const newDocument: any = {};

      // iterate over the object entries in document
      // and only include the fields that are in the fields array

      for (const key in document) {
        const hasKey = vectors.includes(key);
        if (!hasKey) {
          newDocument[key] = document[key];
        }
      }

      results.push({
        score: result.score,
        document: newDocument, // Use the newDocument object instead of the original document
      });
    }

    return {
      status: "OK",
      response: results,
    };
  } catch (e) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `${e}`,
        },
      ],
    };
  }
};

export const IndexDocuments = async (
  fileName: string,
  docs: string[],
  chatThreadId: string,
  isAdminKb: boolean = false
): Promise<Array<ServerActionResponse<boolean>>> => {
  try {
    const hashedId = await userHashedId();
    
    if (!hashedId) {
      return [{
        status: "UNAUTHORIZED",
        errors: [{
          message: "User identification required",
        }],
      }];
    }
    
    // If trying to add admin documents, check admin status
    if (isAdminKb) {
      const currentUser = await getCurrentUser();
      if (!currentUser || !currentUser.isAdmin) {
        return [{
          status: "UNAUTHORIZED",
          errors: [{
            message: "Admin access required to update the central knowledge base",
          }],
        }];
      }
    }
    
    const documentsToIndex: NeonSearchDocument[] = [];
    const sql = await NeonDBInstance();
    for (const doc of docs) {
      documentsToIndex.push({
        id: uniqueId(),
        chatThreadId,
        userId: hashedId,
        pageContent: doc,
        metadata: fileName,
        embedding: [],
        isAdminKb: isAdminKb,
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
          // Insert into the database with the is_admin_kb flag
          return sql(
            `INSERT INTO documents (id, page_content, user_id, chat_thread_id, metadata, embedding, is_admin_kb)
             VALUES ($1, $2, $3, $4, $5, $6, $7);`,
            [
              doc.id,
              doc.pageContent,
              doc.userId,
              doc.chatThreadId,
              doc.metadata,
              `[${doc.embedding.join(', ')}]`, // Pass valid vector
              doc.isAdminKb || false, // Include the admin KB flag
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
      model: "",
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
