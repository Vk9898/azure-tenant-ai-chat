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
      response: rows,
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
      response: rows,
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};
