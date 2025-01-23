"use server";
import { NeonDBInstance } from "@/features/common/services/neondb";

import { userHashedId } from "@/features/auth-page/helpers";
import { RevalidateCache } from "@/features/common/navigation-helpers";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { DocumentIntelligenceInstance } from "@/features/common/services/document-intelligence";
import { uniqueId } from "@/features/common/util";
import { CHAT_DOCUMENT_ATTRIBUTE, ChatDocumentModel } from "./models";

const MAX_UPLOAD_DOCUMENT_SIZE: number = 20000000;
const CHUNK_SIZE = 2300;
// 25% overlap
const CHUNK_OVERLAP = CHUNK_SIZE * 0.25;

export const CrackDocument = async (
  formData: FormData
): Promise<ServerActionResponse<string[]>> => {
  try {
    const fileResponse = await LoadFile(formData);
    if (fileResponse.status === "OK") {
      const splitDocuments = await ChunkDocumentWithOverlap(
        fileResponse.response.join("\n")
      );

      return {
        status: "OK",
        response: splitDocuments,
      };
    }

    return fileResponse;
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

const LoadFile = async (
  formData: FormData
): Promise<ServerActionResponse<string[]>> => {
  try {
    const file: File | null = formData.get("file") as unknown as File;

    const fileSize = process.env.MAX_UPLOAD_DOCUMENT_SIZE
      ? Number(process.env.MAX_UPLOAD_DOCUMENT_SIZE)
      : MAX_UPLOAD_DOCUMENT_SIZE;

    if (file && file.size < fileSize) {
      const client = DocumentIntelligenceInstance();

      const blob = new Blob([file], { type: file.type });

      const poller = await client.beginAnalyzeDocument(
        "prebuilt-read",
        await blob.arrayBuffer()
      );
      const { paragraphs } = await poller.pollUntilDone();

      const docs: Array<string> = [];

      if (paragraphs) {
        for (const paragraph of paragraphs) {
          docs.push(paragraph.content);
        }
      }

      return {
        status: "OK",
        response: docs,
      };
    } else {
      return {
        status: "ERROR",
        errors: [
          {
            message: `File is too large and must be less than ${MAX_UPLOAD_DOCUMENT_SIZE} bytes.`,
          },
        ],
      };
    }
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

export const FindAllChatDocuments = async (
  chatThreadID: string
): Promise<ServerActionResponse<ChatDocumentModel[]>> => {
  try {
    const query = `
      SELECT *
      FROM chat_documents
      WHERE type = $1 AND chat_thread_id = $2 AND is_deleted = $3;
    `;
    const values = [CHAT_DOCUMENT_ATTRIBUTE, chatThreadID, false];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    return {
      status: "OK",
      response: rows,
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

export const CreateChatDocument = async (
  fileName: string,
  chatThreadID: string
): Promise<ServerActionResponse<ChatDocumentModel>> => {
  try {
    const modelToSave: ChatDocumentModel = {
      chatThreadId: chatThreadID,
      id: uniqueId(),
      userId: await userHashedId(),
      createdAt: new Date(),
      type: CHAT_DOCUMENT_ATTRIBUTE,
      isDeleted: false,
      name: fileName,
    };

    const query = `
      INSERT INTO chat_documents (id, chat_thread_id, user_id, created_at, type, is_deleted, name)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      modelToSave.id,
      modelToSave.chatThreadId,
      modelToSave.userId,
      modelToSave.createdAt,
      modelToSave.type,
      modelToSave.isDeleted,
      modelToSave.name,
    ];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    if (rows.length > 0) {
      RevalidateCache({
        page: "chat",
        params: chatThreadID,
      });

      return {
        status: "OK",
        response: rows[0],
      };
    }

    return {
      status: "ERROR",
      errors: [
        {
          message: "Unable to save chat document",
        },
      ],
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

export async function ChunkDocumentWithOverlap(
  document: string
): Promise<string[]> {
  const chunks: string[] = [];

  if (document.length <= CHUNK_SIZE) {
    // If the document is smaller than the desired chunk size, return it as a single chunk.
    chunks.push(document);
    return chunks;
  }

  let startIndex = 0;

  // Split the document into chunks of the desired size, with overlap.
  while (startIndex < document.length) {
    const endIndex = startIndex + CHUNK_SIZE;
    const chunk = document.substring(startIndex, endIndex);
    chunks.push(chunk);
    startIndex = endIndex - CHUNK_OVERLAP;
  }

  return chunks;
}
