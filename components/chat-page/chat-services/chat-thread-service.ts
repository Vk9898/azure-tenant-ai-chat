"use server";
import { NeonDBInstance } from "@/components/common/services/neondb";

import {
  getCurrentUser,
  userHashedId,
  userSession,
} from "@/lib/auth/auth-helpers";
import { RedirectToChatThread } from "@/components/common/navigation-helpers";
import { ServerActionResponse } from "@/components/common/server-action-response";
import { uniqueId } from "@/components/common/util";
import {
  CHAT_DEFAULT_PERSONA,
  NEW_CHAT_NAME,
} from "@/components/theme/theme-config";
import {
  CHAT_THREAD_ATTRIBUTE,
  ChatDocumentModel,
  ChatThreadModel,
} from "./models";


export const FindAllChatThreadForCurrentUser = async (): Promise<
  ServerActionResponse<Array<ChatThreadModel>>
> => {
  try {
    const hashedId = await userHashedId();
    
    if (!hashedId) {
      return {
        status: "UNAUTHORIZED",
        errors: [{ message: "User identification required" }],
      };
    }
    
    const query = `
      SELECT *
      FROM chat_threads
      WHERE type = $1 AND user_id = $2 AND is_deleted = $3
      ORDER BY created_at DESC;
    `;
    const values = [CHAT_THREAD_ATTRIBUTE, hashedId, false];

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
        type: row.type,
        isDeleted: row.is_deleted,
        bookmarked: row.bookmarked,
        personaMessage: row.persona_message,
        personaMessageTitle: row.persona_message_title,
        extension: row.extension,
        useName: row.use_name,
      })),
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};

export const FindChatThreadForCurrentUser = async (
  id: string
): Promise<ServerActionResponse<ChatThreadModel>> => {
  try {
    const hashedId = await userHashedId();
    
    if (!hashedId) {
      return {
        status: "UNAUTHORIZED",
        errors: [{ message: "User identification required" }],
      };
    }
    
    const query = `
      SELECT *
      FROM chat_threads
      WHERE type = $1 AND user_id = $2 AND id = $3 AND is_deleted = $4;
    `;
    const values = [CHAT_THREAD_ATTRIBUTE, hashedId, id, false];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    if (rows.length === 0) {
      return {
        status: "NOT_FOUND",
        errors: [{ message: `Chat thread not found` }],
      };
    }

    return {
      status: "OK",
      response: rows[0] as ChatThreadModel,
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};

export const SoftDeleteChatThreadForCurrentUser = async (
  chatThreadID: string
): Promise<ServerActionResponse<ChatThreadModel>> => {
  try {
    const response = await FindChatThreadForCurrentUser(chatThreadID);

    if (response.status === "OK") {
      const chatThread = response.response;
      chatThread.isDeleted = true;

      const updateQuery = `
        UPDATE chat_threads
        SET is_deleted = $1
        WHERE id = $2;
      `;

      const sql = await NeonDBInstance();
      await sql(updateQuery, [true, chatThread.id]);

      return {
        status: "OK",
        response: chatThread,
      };
    }

    return response;
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};

export const EnsureChatThreadOperation = async (
  chatThreadID: string
): Promise<ServerActionResponse<ChatThreadModel>> => {
  const response = await FindChatThreadForCurrentUser(chatThreadID);
  const currentUser = await getCurrentUser();
  const hashedId = await userHashedId();

  if (response.status === "OK") {
    if (currentUser.isAdmin || (hashedId && response.response.userId === hashedId)) {
      return response;
    }
  }

  return response;
};

export const AddExtensionToChatThread = async (props: {
  chatThreadId: string;
  extensionId: string;
}): Promise<ServerActionResponse<ChatThreadModel>> => {
  try {
    const response = await FindChatThreadForCurrentUser(props.chatThreadId);
    if (response.status === "OK") {
      const chatThread = response.response;

      if (!chatThread.extension.includes(props.extensionId)) {
        chatThread.extension.push(props.extensionId);
        return await UpsertChatThread(chatThread);
      }

      return {
        status: "OK",
        response: chatThread,
      };
    }

    return response;
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};

export const RemoveExtensionFromChatThread = async (props: {
  chatThreadId: string;
  extensionId: string;
}): Promise<ServerActionResponse<ChatThreadModel>> => {
  try {
    const response = await FindChatThreadForCurrentUser(props.chatThreadId);
    if (response.status === "OK") {
      const chatThread = response.response;
      chatThread.extension = chatThread.extension.filter(
        (e) => e !== props.extensionId
      );

      return await UpsertChatThread(chatThread);
    }

    return response;
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};

export const UpsertChatThread = async (
  chatThread: ChatThreadModel
): Promise<ServerActionResponse<ChatThreadModel>> => {
  try {
    // If userId is not provided, get current user's hashedId
    if (!chatThread.userId) {
      const hashedId = await userHashedId();
      if (!hashedId) {
        return {
          status: "UNAUTHORIZED",
          errors: [{
            message: "User identification required",
          }],
        };
      }
      chatThread.userId = hashedId;
    }
    
    const query = `
      INSERT INTO chat_threads (id, created_at, last_message_at, name, user_id, type, is_deleted, bookmarked, persona_message, persona_message_title, extension)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE
      SET created_at = EXCLUDED.created_at,
          last_message_at = EXCLUDED.last_message_at,
          name = EXCLUDED.name,
          user_id = EXCLUDED.user_id,
          type = EXCLUDED.type,
          is_deleted = EXCLUDED.is_deleted,
          bookmarked = EXCLUDED.bookmarked,
          persona_message = EXCLUDED.persona_message,
          persona_message_title = EXCLUDED.persona_message_title,
          extension = EXCLUDED.extension
      RETURNING *;
    `;
    const values = [
      chatThread.id || uniqueId(),
      chatThread.createdAt || new Date(),
      new Date(),
      chatThread.name,
      chatThread.userId,
      CHAT_THREAD_ATTRIBUTE,
      chatThread.isDeleted || false,
      chatThread.bookmarked || false,
      chatThread.personaMessage || "",
      chatThread.personaMessageTitle || CHAT_DEFAULT_PERSONA,
      chatThread.extension || [],
    ];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    if (rows.length > 0) {
      return {
        status: "OK",
        response: rows[0] as ChatThreadModel,
      };
    }

    return {
      status: "ERROR",
      errors: [{ message: `Chat thread not found` }],
    };
  } catch (error) {
    console.error(error);
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};

export const CreateChatThread = async (): Promise<
  ServerActionResponse<ChatThreadModel>
> => {
  try {
    const session = await userSession();
    const hashedId = await userHashedId();
    
    if (!session || !hashedId) {
      return {
        status: "UNAUTHORIZED",
        errors: [{
          message: "User identification required",
        }],
      };
    }
    
    const modelToSave: ChatThreadModel = {
      name: NEW_CHAT_NAME,
      useName: session.name ?? "User",
      userId: hashedId,
      id: uniqueId(),
      createdAt: new Date(),
      lastMessageAt: new Date(),
      bookmarked: false,
      isDeleted: false,
      type: CHAT_THREAD_ATTRIBUTE,
      personaMessage: "",
      personaMessageTitle: CHAT_DEFAULT_PERSONA,
      extension: [],
    };

    const query = `
      INSERT INTO chat_threads (id, created_at, last_message_at, name, user_id, type, is_deleted, bookmarked, persona_message, persona_message_title, extension)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
    const values = [
      modelToSave.id,
      modelToSave.createdAt,
      modelToSave.lastMessageAt,
      modelToSave.name,
      modelToSave.userId,
      modelToSave.type,
      modelToSave.isDeleted,
      modelToSave.bookmarked,
      modelToSave.personaMessage,
      modelToSave.personaMessageTitle,
      modelToSave.extension,
    ];

    const sql = await NeonDBInstance();
    const rows = await sql(query, values);

    if (rows.length > 0) {
      return {
        status: "OK",
        response: rows[0] as ChatThreadModel,
      };
    }

    return {
      status: "ERROR",
      errors: [{ message: `Chat thread not found` }],
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};

export const UpdateChatTitle = async (
  chatThreadId: string,
  title: string
): Promise<ServerActionResponse<ChatThreadModel>> => {
  try {
    const response = await FindChatThreadForCurrentUser(chatThreadId);
    if (response.status === "OK") {
      const chatThread = response.response;
      chatThread.name = title.substring(0, 30);
      return await UpsertChatThread(chatThread);
    }
    return response;
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};

export const CreateChatAndRedirect = async () => {
  const response = await CreateChatThread();
  if (response.status === "OK") {
    RedirectToChatThread(response.response.id);
  }
};
