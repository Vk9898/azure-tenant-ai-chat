import { getCurrentUser } from "@/features/auth-page/helpers";
import {
  CHAT_THREAD_ATTRIBUTE,
  ChatMessageModel,
  ChatThreadModel,
  MESSAGE_ATTRIBUTE,
} from "@/features/chat-page/chat-services/models";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { NeonDBInstance } from "@/features/common/services/neondb";


export const FindAllChatThreadsForAdmin = async (
  limit: number,
  offset: number
): Promise<ServerActionResponse<Array<ChatThreadModel>>> => {
  const user = await getCurrentUser();

  if (!user.isAdmin) {
    return {
      status: "ERROR",
      errors: [{ message: "You are not authorized to perform this action" }],
    };
  }

  try {
    const query = `
      SELECT *
      FROM chat_threads
      WHERE type = $1
      ORDER BY created_at DESC
      OFFSET $2 LIMIT $3;
    `;
    const values = [CHAT_THREAD_ATTRIBUTE, offset, limit];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    return {
      status: "OK",
      response: rows.map(row => ({
        id: row.id,
        name: row.name,
        createdAt: row.created_at,
        lastMessageAt: row.last_message_at,
        userId: row.user_id,
        useName: row.user_name,
        isDeleted: row.is_deleted,
        bookmarked: row.bookmarked,
        personaMessage: row.persona_message,
        personaMessageTitle: row.persona_message_title,
        extension: row.extension,
        type: row.type,
      })),
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};

export const FindAllChatMessagesForAdmin = async (
  chatThreadID: string
): Promise<ServerActionResponse<Array<ChatMessageModel>>> => {
  const user = await getCurrentUser();

  if (!user.isAdmin) {
    return {
      status: "ERROR",
      errors: [{ message: "You are not authorized to perform this action" }],
    };
  }

  try {
    const query = `
      SELECT *
      FROM chat_messages
      WHERE type = $1 AND thread_id = $2
      ORDER BY created_at ASC;
    `;
    const values = [MESSAGE_ATTRIBUTE, chatThreadID];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    return {
      status: "OK",
      response: rows.map(row => ({
        id: row.id,
        createdAt: row.created_at,
        isDeleted: row.is_deleted,
        threadId: row.thread_id,
        userId: row.user_id,
        userName: row.user_name,
        content: row.content,
        contentType: row.content_type,
        updatedAt: row.updated_at,
        role: row.role,
        name: row.name,
        type: row.type,
      })),
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};
