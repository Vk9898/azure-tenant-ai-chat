"use server";
import { NeonDBInstance } from "@/features/common/services/neondb";
import { userHashedId } from "@/features/auth-page/helpers";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { uniqueId } from "@/features/common/util";
import { ChatMessageModel, ChatRole, MESSAGE_ATTRIBUTE } from "./models";

export const FindTopChatMessagesForCurrentUser = async (
  chatThreadID: string,
  top: number = 30
): Promise<ServerActionResponse<Array<ChatMessageModel>>> => {
  try {
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
      await userHashedId(),
      false,
      top,
    ];

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

export const FindAllChatMessagesForCurrentUser = async (
  chatThreadID: string
): Promise<ServerActionResponse<Array<ChatMessageModel>>> => {
  try {
    const query = `
      SELECT *
      FROM chat_messages
      WHERE type = $1 AND thread_id = $2 AND user_id = $3 AND is_deleted = $4
      ORDER BY created_at ASC;
    `;
    const values = [
      MESSAGE_ATTRIBUTE,
      chatThreadID,
      await userHashedId(),
      false,
    ];

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
        response: rows[0],
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
