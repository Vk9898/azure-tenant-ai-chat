"use server";
import { getCurrentUser } from "@/features/auth-page/helpers";
import {
  CHAT_THREAD_ATTRIBUTE,
  ChatThreadModel,
  MESSAGE_ATTRIBUTE,
} from "@/features/chat-page/chat-services/models";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { NeonDBInstance } from "@/features/common/services/neondb";
import { userHashedId } from "@/features/auth-page/helpers";
import { redirect } from "next/navigation";

export const GetUserMetrics = async (): Promise<ServerActionResponse<{
  totalUsers: number;
  totalChats: number;
  totalMessages: number;
  activeUsersLast7Days: number;
}>> => {
  const user = await getCurrentUser();

  if (!user.isAdmin) {
    return {
      status: "UNAUTHORIZED",
      errors: [{ message: "Admin access required" }],
    };
  }

  try {
    const sql = await NeonDBInstance();
    
    // Count unique users
    const usersQuery = `
      SELECT COUNT(DISTINCT user_id) as count
      FROM chat_threads
      WHERE type = $1;
    `;
    const usersResult = await sql(usersQuery, [CHAT_THREAD_ATTRIBUTE]);
    
    // Count total chat threads
    const chatsQuery = `
      SELECT COUNT(*) as count
      FROM chat_threads
      WHERE type = $1;
    `;
    const chatsResult = await sql(chatsQuery, [CHAT_THREAD_ATTRIBUTE]);
    
    // Count total messages
    const messagesQuery = `
      SELECT COUNT(*) as count
      FROM chat_messages
      WHERE type = $1;
    `;
    const messagesResult = await sql(messagesQuery, [MESSAGE_ATTRIBUTE]);
    
    // Count active users in the last 7 days
    const activeUsersQuery = `
      SELECT COUNT(DISTINCT user_id) as count
      FROM chat_threads
      WHERE type = $1 AND created_at > NOW() - INTERVAL '7 days';
    `;
    const activeUsersResult = await sql(activeUsersQuery, [CHAT_THREAD_ATTRIBUTE]);

    return {
      status: "OK",
      response: {
        totalUsers: usersResult[0].count,
        totalChats: chatsResult[0].count,
        totalMessages: messagesResult[0].count,
        activeUsersLast7Days: activeUsersResult[0].count,
      },
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};

export const GetTopActiveUsers = async (
  limit: number = 10
): Promise<ServerActionResponse<Array<{
  userId: string;
  userName: string;
  chatCount: number;
  messageCount: number;
  lastActive: Date;
}>>> => {
  const user = await getCurrentUser();

  if (!user.isAdmin) {
    return {
      status: "UNAUTHORIZED",
      errors: [{ message: "Admin access required" }],
    };
  }

  try {
    const sql = await NeonDBInstance();
    
    const query = `
      SELECT 
        t.user_id as user_id,
        t.use_name as user_name,
        COUNT(DISTINCT t.id) as chat_count,
        COUNT(m.id) as message_count,
        MAX(t.last_message_at) as last_active
      FROM 
        chat_threads t
      LEFT JOIN 
        chat_messages m ON t.id = m.thread_id
      WHERE 
        t.type = $1
      GROUP BY 
        t.user_id, t.use_name
      ORDER BY 
        last_active DESC
      LIMIT $2;
    `;
    
    const results = await sql(query, [CHAT_THREAD_ATTRIBUTE, limit]);

    return {
      status: "OK",
      response: results.map(row => ({
        userId: row.user_id,
        userName: row.user_name,
        chatCount: parseInt(row.chat_count),
        messageCount: parseInt(row.message_count),
        lastActive: row.last_active,
      })),
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};

export const GetRecentActivities = async (
  limit: number = 20
): Promise<ServerActionResponse<Array<{
  id: string;
  userId: string;
  userName: string;
  activityType: string;
  entityId: string;
  entityName: string;
  timestamp: Date;
}>>> => {
  const user = await getCurrentUser();

  if (!user.isAdmin) {
    return {
      status: "UNAUTHORIZED",
      errors: [{ message: "Admin access required" }],
    };
  }

  try {
    const sql = await NeonDBInstance();
    
    // Get recent messages
    const recentMessagesQuery = `
      SELECT 
        m.id as id,
        t.user_id as user_id,
        t.use_name as user_name,
        'message' as activity_type,
        t.id as entity_id,
        t.name as entity_name,
        m.created_at as timestamp
      FROM 
        chat_messages m
      JOIN
        chat_threads t ON m.thread_id = t.id
      WHERE 
        m.type = $1
      ORDER BY 
        m.created_at DESC
      LIMIT $2;
    `;
    
    const results = await sql(recentMessagesQuery, [MESSAGE_ATTRIBUTE, limit]);

    return {
      status: "OK",
      response: results.map(row => ({
        id: row.id,
        userId: row.user_id,
        userName: row.user_name || 'Unknown User',
        activityType: row.activity_type,
        entityId: row.entity_id,
        entityName: row.entity_name || 'Unnamed',
        timestamp: row.timestamp,
      })),
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};

export const GetUserChatHistory = async (
  userId: string,
  limit: number = 20
): Promise<ServerActionResponse<Array<ChatThreadModel>>> => {
  const user = await getCurrentUser();

  if (!user.isAdmin) {
    return {
      status: "UNAUTHORIZED",
      errors: [{ message: "Admin access required" }],
    };
  }

  try {
    const query = `
      SELECT *
      FROM chat_threads
      WHERE type = $1 AND user_id = $2
      ORDER BY created_at DESC
      LIMIT $3;
    `;
    const values = [CHAT_THREAD_ATTRIBUTE, userId, limit];

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
        useName: row.use_name,
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

export interface User {
  id: string;
  name: string;
  email: string | null;
  chatCount: number;
  messageCount: number;
  lastActive: string | null;
}

export async function GetAllUsers(): Promise<User[]> {
  const currentUserId = await userHashedId();
  
  if (!currentUserId) {
    throw new Error("Unauthorized: User not authenticated");
  }
  
  const hasPermission = await hasAdminPermission(currentUserId);
  
  if (!hasPermission) {
    throw new Error("Unauthorized: User does not have admin permission");
  }
  
  try {
    const users = await sql<User>`
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(DISTINCT ct.id) AS "chatCount",
        COUNT(cm.id) AS "messageCount",
        MAX(cm.created_at) AS "lastActive"
      FROM 
        users u
      LEFT JOIN 
        chat_threads ct ON u.id = ct.user_id
      LEFT JOIN 
        chat_messages cm ON ct.id = cm.thread_id
      GROUP BY 
        u.id, u.name, u.email
      ORDER BY 
        MAX(cm.created_at) DESC NULLS LAST
    `;
    
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
} 