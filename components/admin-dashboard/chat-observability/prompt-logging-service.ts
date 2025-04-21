"use server";

import { NeonDBInstance } from "@/components/common/services/neondb";
import { ServerActionResponse } from "@/components/common/server-action-response";
import { getCurrentUser, userHashedId } from "@/components/auth-page/helpers";

export interface PromptLogEntry {
  id?: number;
  userId?: string;
  threadId?: string;
  modelName: string;
  prompt: string;
  expectedResponse?: string;
  actualResponse: string;
  temperature?: number;
  maxTokens?: number;
  tokensUsed?: number;
  responseTimeMs?: number;
  success: boolean;
  errorMessage?: string;
  createdAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * Log a prompt and its response to the database
 * @param entry Prompt log entry to save
 * @returns The saved log entry
 */
export async function logPrompt(
  entry: PromptLogEntry
): Promise<ServerActionResponse<PromptLogEntry>> {
  try {
    const sql = await NeonDBInstance();
    const userId = await userHashedId();
    
    // First, make sure the prompt_logs table exists
    try {
      await sql(`
        CREATE TABLE IF NOT EXISTS prompt_logs (
          id SERIAL PRIMARY KEY,
          user_id TEXT,
          thread_id TEXT,
          model_name TEXT NOT NULL,
          prompt TEXT NOT NULL,
          expected_response TEXT,
          actual_response TEXT NOT NULL,
          temperature FLOAT,
          max_tokens INTEGER,
          tokens_used INTEGER,
          response_time_ms INTEGER,
          success BOOLEAN NOT NULL DEFAULT TRUE,
          error_message TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          metadata JSONB
        );
      `);
    } catch (error) {
      console.warn("Could not verify prompt_logs table:", error);
      // Continue anyway - the table might already exist
    }
    
    // Create the log entry
    const query = `
      INSERT INTO prompt_logs (
        user_id, thread_id, model_name, prompt, expected_response, actual_response,
        temperature, max_tokens, tokens_used, response_time_ms, success, error_message, metadata
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      ) RETURNING *;
    `;
    
    const params = [
      entry.userId || userId || null,
      entry.threadId || null,
      entry.modelName,
      entry.prompt,
      entry.expectedResponse || null,
      entry.actualResponse,
      entry.temperature || null,
      entry.maxTokens || null, 
      entry.tokensUsed || null,
      entry.responseTimeMs || null,
      entry.success,
      entry.errorMessage || null,
      entry.metadata ? JSON.stringify(entry.metadata) : null
    ];
    
    const result = await sql(query, params);
    
    if (result && result.length > 0) {
      return {
        status: "OK",
        response: result[0] as PromptLogEntry
      };
    } else {
      throw new Error("Failed to insert prompt log entry");
    }
  } catch (error) {
    console.error("Error logging prompt:", error);
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }]
    };
  }
}

/**
 * Retrieve prompt logs from the database
 * @param limit Maximum number of logs to retrieve
 * @param offset Offset for pagination
 * @param userId Optional user ID to filter logs
 * @param threadId Optional thread ID to filter logs
 * @param success Optional success flag to filter logs
 * @param fromDate Optional start date for filtering
 * @param toDate Optional end date for filtering
 * @returns Array of prompt log entries
 */
export async function getPromptLogs(
  options: {
    limit?: number,
    offset?: number,
    userId?: string,
    threadId?: string,
    modelName?: string,
    success?: boolean,
    fromDate?: Date,
    toDate?: Date
  } = {}
): Promise<ServerActionResponse<PromptLogEntry[]>> {
  try {
    const user = await getCurrentUser();
    
    if (!user.isAdmin) {
      return {
        status: "UNAUTHORIZED",
        errors: [{ message: "Admin access required" }]
      };
    }
    
    const {
      limit = 100,
      offset = 0,
      userId,
      threadId,
      modelName,
      success,
      fromDate,
      toDate
    } = options;
    
    const sql = await NeonDBInstance();
    
    // Build the WHERE clause dynamically
    const conditions = [];
    const params = [];
    let paramIndex = 1;
    
    if (userId) {
      conditions.push(`user_id = $${paramIndex++}`);
      params.push(userId);
    }
    
    if (threadId) {
      conditions.push(`thread_id = $${paramIndex++}`);
      params.push(threadId);
    }
    
    if (modelName) {
      conditions.push(`model_name = $${paramIndex++}`);
      params.push(modelName);
    }
    
    if (success !== undefined) {
      conditions.push(`success = $${paramIndex++}`);
      params.push(success);
    }
    
    if (fromDate) {
      conditions.push(`created_at >= $${paramIndex++}`);
      params.push(fromDate);
    }
    
    if (toDate) {
      conditions.push(`created_at <= $${paramIndex++}`);
      params.push(toDate);
    }
    
    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';
    
    // Add limit and offset parameters
    params.push(limit);
    params.push(offset);
    
    const query = `
      SELECT * FROM prompt_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    const results = await sql(query, params);
    
    return {
      status: "OK",
      response: results as PromptLogEntry[]
    };
  } catch (error) {
    console.error("Error retrieving prompt logs:", error);
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }]
    };
  }
}

/**
 * Get metrics and statistics about prompt logs
 * @returns Object containing usage metrics and statistics
 */
export async function getPromptMetrics(): Promise<ServerActionResponse<{
  totalPrompts: number;
  successRate: number;
  averageResponseTime: number;
  tokenUsage: number;
  modelBreakdown: Record<string, number>;
  dailyUsage: Array<{date: string; count: number}>;
}>> {
  try {
    const user = await getCurrentUser();
    
    if (!user.isAdmin) {
      return {
        status: "UNAUTHORIZED",
        errors: [{ message: "Admin access required" }]
      };
    }
    
    const sql = await NeonDBInstance();
    
    // Get total count and success rate
    const countQuery = `
      SELECT 
        COUNT(*) as total_prompts,
        SUM(CASE WHEN success = TRUE THEN 1 ELSE 0 END)::float / COUNT(*)::float * 100 as success_rate,
        AVG(response_time_ms) as avg_response_time,
        SUM(tokens_used) as total_tokens
      FROM prompt_logs;
    `;
    
    const countResult = await sql(countQuery);
    
    // Get model breakdown
    const modelQuery = `
      SELECT model_name, COUNT(*) as count
      FROM prompt_logs
      GROUP BY model_name
      ORDER BY count DESC;
    `;
    
    const modelResult = await sql(modelQuery);
    
    // Get daily usage (last 30 days)
    const dailyQuery = `
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM-DD') as date,
        COUNT(*) as count
      FROM prompt_logs
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY date;
    `;
    
    const dailyResult = await sql(dailyQuery);
    
    // Format model breakdown as a record
    const modelBreakdown: Record<string, number> = {};
    modelResult.forEach((row: any) => {
      modelBreakdown[row.model_name] = parseInt(row.count);
    });
    
    return {
      status: "OK",
      response: {
        totalPrompts: parseInt(countResult[0]?.total_prompts || "0"),
        successRate: parseFloat(countResult[0]?.success_rate || "0"),
        averageResponseTime: parseFloat(countResult[0]?.avg_response_time || "0"),
        tokenUsage: parseInt(countResult[0]?.total_tokens || "0"),
        modelBreakdown,
        dailyUsage: dailyResult as Array<{date: string; count: number}>
      }
    };
  } catch (error) {
    console.error("Error retrieving prompt metrics:", error);
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }]
    };
  }
} 