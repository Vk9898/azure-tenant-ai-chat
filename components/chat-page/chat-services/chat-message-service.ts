"use server";
import { NeonDBInstance } from "@/lib/db/neondb";
import { userHashedId } from "@/lib/auth/auth-helpers";
import { ServerActionResponse } from "@/components/common/server-action-response";
import { uniqueId } from "@/components/common/util";
import { ChatMessageModel, ChatRole, MESSAGE_ATTRIBUTE } from "./models";

export const FindTopChatMessagesForCurrentUser = async (
  chatThreadID: string,
  top: number = 30
): Promise<ServerActionResponse<Array<ChatMessageModel>>> => {
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
      FROM chat_messages
      WHERE type = $1 AND thread_id = $2 AND user_id = $3 AND is_deleted = $4
      ORDER BY created_at DESC
      LIMIT $5;
    `;
    const values = [
      MESSAGE_ATTRIBUTE,
      chatThreadID,
      hashedId,
      false,
      top,
    ];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    return {
      status: "OK",
      response: rows.map(row => ({
        id: row.id,
        createdAt: row.created_at,
        type: row.type,
        isDeleted: row.is_deleted,
        content: row.content,
        name: row.name,
        role: row.role,
        threadId: row.thread_id,
        userId: row.user_id,
        multiModalImage: row.multi_modal_image,
      })),
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

export const FindAllChatMessagesForCurrentUser = async (
  chatThreadID: string
): Promise<ServerActionResponse<Array<ChatMessageModel>>> => {
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
      FROM chat_messages
      WHERE type = $1 AND thread_id = $2 AND user_id = $3 AND is_deleted = $4
      ORDER BY created_at ASC;
    `;
    const values = [
      MESSAGE_ATTRIBUTE,
      chatThreadID,
      hashedId,
      false,
    ];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    return {
      status: "OK",
      response: rows.map(row => ({
        id: row.id,
        createdAt: row.created_at,
        type: row.type,
        isDeleted: row.is_deleted,
        content: row.content,
        name: row.name,
        role: row.role,
        threadId: row.thread_id,
        userId: row.user_id,
        multiModalImage: row.multi_modal_image,
      })),
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

export const CreateChatMessage = async ({
  name,
  content,
  role,
  chatThreadId,
  multiModalImage,
}: {
  name: string;
  role: ChatRole;
  content: string;
  chatThreadId: string;
  multiModalImage?: string;
}): Promise<ServerActionResponse<ChatMessageModel>> => {
  const userId = await userHashedId();
  
  if (!userId) {
    return {
      status: "UNAUTHORIZED",
      errors: [{
        message: "User identification required",
      }],
    };
  }
  
  const modelToSave: ChatMessageModel = {
    id: uniqueId(),
    createdAt: new Date(),
    type: MESSAGE_ATTRIBUTE,
    isDeleted: false,
    content: content,
    name: name,
    role: role,
    threadId: chatThreadId,
    userId: userId,
    multiModalImage: multiModalImage,
  };
  return await UpsertChatMessage(modelToSave);
};

export const UpsertChatMessage = async (
  chatModel: ChatMessageModel
): Promise<ServerActionResponse<ChatMessageModel>> => {
  try {
    const query = `
      INSERT INTO chat_messages (id, created_at, type, is_deleted, content, name, role, thread_id, user_id, multi_modal_image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE
      SET created_at = EXCLUDED.created_at,
          type = EXCLUDED.type,
          is_deleted = EXCLUDED.is_deleted,
          content = EXCLUDED.content,
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          thread_id = EXCLUDED.thread_id,
          user_id = EXCLUDED.user_id,
          multi_modal_image = EXCLUDED.multi_modal_image
      RETURNING *;
    `;
    const values = [
      chatModel.id,
      new Date(),
      MESSAGE_ATTRIBUTE,
      false,
      chatModel.content,
      chatModel.name,
      chatModel.role,
      chatModel.threadId,
      chatModel.userId,
      chatModel.multiModalImage,
    ];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    if (rows.length > 0) {
      return {
        status: "OK",
        response: {
          id: rows[0].id,
          createdAt: rows[0].created_at,
          type: rows[0].type,
          isDeleted: rows[0].is_deleted,
          content: rows[0].content,
          name: rows[0].name,
          role: rows[0].role,
          threadId: rows[0].thread_id,
          userId: rows[0].user_id,
          multiModalImage: rows[0].multi_modal_image,
        },
      };
    }

    return {
      status: "ERROR",
      errors: [
        {
          message: `Chat message not found`,
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
