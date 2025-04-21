import { neon } from "@neondatabase/serverless";
import path from "path";
import fs from "fs/promises";
import { getCurrentUser } from "@/features/auth-page/helpers";


export const NeonDBInstance = async () => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.databaseConnectionString) {
      throw new Error("Database connection string is not available for the current user.");
    }
    return neon(currentUser.databaseConnectionString);
  } catch (error) {
    console.error("Error initializing NeonDBInstance:", error);
    throw error;
  }
};

const NEON_API_URL = "https://console.neon.tech/api/v2";
const NEON_API_KEY = process.env.NEON_API_KEY; // Add your Neon API key to the environment variables
const DEFAULT_DATABASE_NAME = "neondb";
const DEFAULT_DATABASE_ROLE = "neondb_owner";

/**
 * Create or retrieve a Neon project for a user.
 * @param userId The user ID for whom the project is created.
 * @returns The connection string for the user's Neon database.
 */
export const createNeonProjectForUser = async (userId: string): Promise<string> => {
  try {
    const projectName = `user-${userId}`;

    // Check if the project already exists
    const projectListResponse = await fetch(`${NEON_API_URL}/projects`, {
      headers: {
        Authorization: `Bearer ${NEON_API_KEY}`,
      },
    });

    if (!projectListResponse.ok) {
      const errorText = await projectListResponse.text();
      throw new Error(`Failed to fetch Neon projects: ${errorText}`);
    }

    const projectList = await projectListResponse.json();
    const existingProject = projectList.projects.find(
      (project: any) => project.name === projectName
    );

    if (existingProject) {
      console.log(`Neon project already exists for user ${userId}`);
      console.log("Existing project details:", JSON.stringify(existingProject, null, 2));

      // Fetch connection URI for the existing project
      const connectionUriResponse = await fetch(
        `${NEON_API_URL}/projects/${existingProject.id}/connection_uri?database_name=${encodeURIComponent(
          DEFAULT_DATABASE_NAME
        )}&role_name=${encodeURIComponent(DEFAULT_DATABASE_ROLE)}`,
        {
          headers: {
            Authorization: `Bearer ${NEON_API_KEY}`,
          },
        }
      );

      if (!connectionUriResponse.ok) {
        const errorText = await connectionUriResponse.text();
        throw new Error(`Failed to fetch connection URI: ${errorText}`);
      }

      const connectionUriData = await connectionUriResponse.json();
      const connectionString = connectionUriData.uri;
      return connectionString;
    }

    // Create a new project if it doesn't exist
    const projectResponse = await fetch(`${NEON_API_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NEON_API_KEY}`,
      },
      body: JSON.stringify({
        project: {
          pg_version: 17, // Specify the PostgreSQL version
          name: projectName, // Specify the project name
          region_id: "azure-eastus2", // Specify the region
        },
      }),
    });

    if (!projectResponse.ok) {
      const errorText = await projectResponse.text();
      throw new Error(`Failed to create Neon project: ${errorText}`);
    }

    const projectData = await projectResponse.json();
    const connectionString = projectData.connection_uris[0].connection_uri;

    console.log(`Neon project created for user ${userId}`);

    await initializeDatabaseSchema(connectionString);

    return connectionString;
  } catch (error) {
    console.error(`Error creating Neon project for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Initialize the database schema for the project.
 * @param connectionString The connection string for the Neon database.
 */
const initializeDatabaseSchema = async (connectionString: string) => {
  try {
    console.log("Initializing database schema...");

    // Initialize Neon client
    const sql = neon(connectionString);

    // First, create the schema_corrections table if it doesn't exist
    const schemaCorrectionsTable = `
      CREATE TABLE IF NOT EXISTS schema_corrections (
        id SERIAL PRIMARY KEY,
        correction_type TEXT NOT NULL,
        table_name TEXT NOT NULL,
        description TEXT NOT NULL,
        sql_executed TEXT,
        user_id TEXT,
        executed_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    
    await sql(schemaCorrectionsTable);
    console.log("Schema corrections table initialized.");
    
    // Helper function to log schema corrections
    const logSchemaCorrection = async (
      correctionType: string,
      tableName: string,
      description: string,
      sqlExecuted: string,
      userId?: string
    ) => {
      const logQuery = `
        INSERT INTO schema_corrections (
          correction_type, table_name, description, sql_executed, user_id
        ) VALUES ($1, $2, $3, $4, $5)
      `;
      
      await sql(logQuery, [
        correctionType,
        tableName,
        description,
        sqlExecuted,
        userId || null
      ]);
      
      console.log(`Logged schema correction: ${description}`);
    };

    // Define the schema creation SQL statements
    const schemaSQLStatements = [
      {
        sql: `CREATE EXTENSION IF NOT EXISTS vector;`,
        table: "postgres_extension",
        description: "Enable vector extension for embeddings"
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS chat_threads (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          use_name TEXT NULL,
          user_id TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          last_message_at TIMESTAMP NOT NULL DEFAULT NOW(),
          bookmarked BOOLEAN NOT NULL DEFAULT FALSE,
          is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
          type TEXT NOT NULL,
          persona_message TEXT,
          persona_message_title TEXT,
          extension TEXT[] DEFAULT '{}'
        );`,
        table: "chat_threads",
        description: "Create chat threads table"
      },

      `CREATE TABLE IF NOT EXISTS chat_citations (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );`,

      `CREATE TABLE IF NOT EXISTS personas (
        id CHAR(64) PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        persona_message TEXT NOT NULL,
        is_published BOOLEAN NOT NULL DEFAULT FALSE,
        user_id CHAR(64) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        type TEXT NOT NULL
      );`,

      `CREATE TABLE IF NOT EXISTS extensions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        execution_steps TEXT NOT NULL,
        description TEXT NOT NULL,
        is_published BOOLEAN NOT NULL DEFAULT FALSE,
        user_id TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        type TEXT NOT NULL,
        functions JSONB DEFAULT '[]'::JSONB,
        headers JSONB DEFAULT '[]'::JSONB
      );`,

      `CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        metadata TEXT,
        page_content TEXT NOT NULL,
        chat_thread_id TEXT NOT NULL,
        embedding VECTOR(1536),
        user_id TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );`,

      `CREATE TABLE IF NOT EXISTS chat_messages (
        id CHAR(64) PRIMARY KEY,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        type TEXT NOT NULL,
        is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
        content TEXT NOT NULL,
        name TEXT,
        role TEXT,
        thread_id CHAR(64) NOT NULL,
        user_id CHAR(64),
        multi_modal_image TEXT
      );`,

      `CREATE TABLE IF NOT EXISTS chat_documents (
        id CHAR(64) PRIMARY KEY,
        chat_thread_id CHAR(64) NOT NULL,
        user_id CHAR(64) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        type TEXT NOT NULL,
        is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
        name TEXT NOT NULL
      );`,

      `CREATE TABLE IF NOT EXISTS prompts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        is_published BOOLEAN NOT NULL DEFAULT FALSE,
        user_id TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        type TEXT NOT NULL,
        embedding VECTOR(1536)
      );`
    ];

    // Execute each SQL statement sequentially and log it
    for (const statement of schemaSQLStatements) {
      console.log(`Executing SQL: ${statement.sql}`);
      await sql(statement.sql);
      await logSchemaCorrection(
        "schema_init",
        statement.table, 
        statement.description,
        statement.sql
      );
    }

    console.log("Database schema initialized successfully.");
  } catch (error) {
    console.error("Error initializing database schema:", error);
    throw error;
  }
};

/**
 * Log a schema correction or data fix to the database
 * @param connectionString Database connection string
 * @param correctionType Type of correction (schema_update, data_fix, etc.)
 * @param tableName Target table
 * @param description Description of what was corrected
 * @param sqlExecuted The SQL that was executed (if applicable)
 * @param userId User who made the correction (if applicable)
 */
export const logSchemaCorrection = async (
  correctionType: string,
  tableName: string,
  description: string,
  sqlExecuted: string,
  userId?: string
): Promise<void> => {
  try {
    const sql = await NeonDBInstance();
    
    const logQuery = `
      INSERT INTO schema_corrections (
        correction_type, table_name, description, sql_executed, user_id
      ) VALUES ($1, $2, $3, $4, $5)
    `;
    
    await sql(logQuery, [
      correctionType,
      tableName,
      description,
      sqlExecuted,
      userId || null
    ]);
    
    console.log(`Logged schema correction: ${description}`);
  } catch (error) {
    console.error("Error logging schema correction:", error);
    // Don't throw here to prevent disruption of normal operations
  }
};

/**
 * Get schema correction logs from the database
 * @param limit Maximum number of logs to retrieve
 * @param offset Offset for pagination
 * @returns Array of schema correction logs
 */
export const getSchemaCorrections = async (
  limit: number = 100,
  offset: number = 0
): Promise<any[]> => {
  try {
    const sql = await NeonDBInstance();
    
    const query = `
      SELECT * FROM schema_corrections
      ORDER BY executed_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const results = await sql(query, [limit, offset]);
    return results;
  } catch (error) {
    console.error("Error retrieving schema corrections:", error);
    return [];
  }
};