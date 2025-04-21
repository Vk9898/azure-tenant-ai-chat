import { neon } from "@neondatabase/serverless";
import path from "path";
import fs from "fs/promises";
import { auth } from "@/lib/auth/auth-api"; // Import auth directly
import type { CustomUser } from "@/lib/auth/auth-helpers"; // Import type if needed

export const NeonDBInstance = async (connectionString?: string) => {
  try {
    // Prioritize explicitly provided connection string
    if (connectionString) {
      return neon(connectionString);
    }

    // Get session directly using auth()
    const session = await auth();
    const user = session?.user as CustomUser | undefined;
    const userConnectionString = user?.databaseConnectionString;

    // Check if there's a user-specific connection string in the session
    if (userConnectionString) {
      return neon(userConnectionString);
    }

    // Fall back to the environment-provided connection string
    const defaultConnectionString = process.env.DATABASE_URL;
    if (!defaultConnectionString) {
      throw new Error("No database connection string available - neither user-specific nor default.");
    }

    return neon(defaultConnectionString);
  } catch (error) {
    console.error("Error initializing NeonDBInstance:", error);
    // Rethrow or handle as appropriate for your application
    // Depending on context, you might want to return a default instance or throw
    const defaultConnectionString = process.env.DATABASE_URL;
     if (!defaultConnectionString) {
        console.error("FATAL: No default DATABASE_URL found after error in NeonDBInstance.");
        throw new Error("Database initialization failed and no default connection string available.");
     }
     console.warn("NeonDBInstance falling back to default DATABASE_URL due to error:", error);
     return neon(defaultConnectionString);
  }
};


const NEON_API_URL = "https://console.neon.tech/api/v2";
const NEON_API_KEY = process.env.NEON_API_KEY; // Add your Neon API key to the environment variables
const DEFAULT_DATABASE_NAME = process.env.NEON_DEFAULT_DB_NAME || "neondb";
const DEFAULT_DATABASE_ROLE = process.env.NEON_DEFAULT_DB_ROLE || "neondb_owner";


/**
 * Create or retrieve a Neon project for a user.
 * @param userId The user ID for whom the project is created.
 * @returns The connection string for the user's Neon database.
 */
export const createNeonProjectForUser = async (userId: string): Promise<string> => {
  if (!NEON_API_KEY) {
    throw new Error("NEON_API_KEY is not set in environment variables.");
  }

  try {
    const projectName = `user-${userId}`; // Consider making prefix configurable

    // Check if the project already exists
    const projectListResponse = await fetch(`${NEON_API_URL}/projects`, {
      headers: {
        Authorization: `Bearer ${NEON_API_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!projectListResponse.ok) {
      const errorText = await projectListResponse.text();
      console.error(`Failed to fetch Neon projects (${projectListResponse.status}): ${errorText}`);
      throw new Error(`Failed to fetch Neon projects: ${projectListResponse.statusText}`);
    }

    const projectList = await projectListResponse.json();
    const existingProject = projectList.projects.find(
      (project: any) => project.name === projectName
    );

    let projectId: string;
    let needsInitialization = false;

    if (existingProject) {
      console.log(`Neon project '${projectName}' already exists for user ${userId}`);
      projectId = existingProject.id;
    } else {
      console.log(`Creating new Neon project '${projectName}' for user ${userId}...`);
      // Create a new project if it doesn't exist
      const createResponse = await fetch(`${NEON_API_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${NEON_API_KEY}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          project: {
            name: projectName,
            pg_version: process.env.NEON_PG_VERSION ? parseInt(process.env.NEON_PG_VERSION) : 16,
            region_id: process.env.NEON_REGION_ID || "azure-eastus2", // Changed default region
          },
        }),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
         console.error(`Failed to create Neon project (${createResponse.status}): ${errorText}`);
        throw new Error(`Failed to create Neon project: ${createResponse.statusText}`);
      }

      const projectData = await createResponse.json();
      projectId = projectData.project.id;
      needsInitialization = true; // Needs schema initialization
      console.log(`Neon project '${projectName}' created successfully.`);
    }

    // Fetch connection URI for the project's default branch and db/role
     console.log(`Fetching connection URI for project ${projectId}...`);
     const branchesResponse = await fetch(`${NEON_API_URL}/projects/${projectId}/branches`, {
       headers: { Authorization: `Bearer ${NEON_API_KEY}`, Accept: 'application/json' },
     });
     if (!branchesResponse.ok) throw new Error('Failed to fetch branches');
     const branchesData = await branchesResponse.json();
     const defaultBranch = branchesData.branches.find((b: any) => b.primary); // Or find by name if needed
     if (!defaultBranch) throw new Error('Default branch not found');

     const endpointsResponse = await fetch(`${NEON_API_URL}/projects/${projectId}/branches/${defaultBranch.id}/endpoints`, {
       headers: { Authorization: `Bearer ${NEON_API_KEY}`, Accept: 'application/json' },
     });
     if (!endpointsResponse.ok) throw new Error('Failed to fetch endpoints');
     const endpointsData = await endpointsResponse.json();
     const defaultEndpoint = endpointsData.endpoints.find((ep: any) => ep.type === 'read_write'); // Find the read-write endpoint
     if (!defaultEndpoint) throw new Error('Default read-write endpoint not found');


     const connectionUriResponse = await fetch(
       `${NEON_API_URL}/projects/${projectId}/connection_uri?endpoint_id=${defaultEndpoint.id}&role_name=${encodeURIComponent(DEFAULT_DATABASE_ROLE)}&database_name=${encodeURIComponent(DEFAULT_DATABASE_NAME)}`,
       { headers: { Authorization: `Bearer ${NEON_API_KEY}`, Accept: 'application/json' } }
     );


    if (!connectionUriResponse.ok) {
      const errorText = await connectionUriResponse.text();
      console.error(`Failed to fetch connection URI (${connectionUriResponse.status}): ${errorText}`);
      throw new Error(`Failed to fetch connection URI: ${connectionUriResponse.statusText}`);
    }

    const connectionUriData = await connectionUriResponse.json();
    const connectionString = connectionUriData.connection_uri;

    if (needsInitialization) {
        console.log(`Initializing schema for new project '${projectName}'...`);
        await initializeDatabaseSchema(connectionString); // Initialize schema only for new projects
    }


    return connectionString;
  } catch (error) {
    console.error(`Error creating/retrieving Neon project for user ${userId}:`, error);
    throw error; // Re-throw the error to be handled by the caller
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

    await sql.unsafe(schemaCorrectionsTable); // Use unsafe for CREATE TABLE IF NOT EXISTS
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
          extension TEXT[] DEFAULT '{}'::text[]
        );`,
        table: "chat_threads",
        description: "Create chat threads table"
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS chat_citations (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          type TEXT NOT NULL,
          user_id TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );`,
        table: "chat_citations",
        description: "Create chat citations table"
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS personas (
          id CHAR(36) PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          persona_message TEXT NOT NULL,
          is_published BOOLEAN NOT NULL DEFAULT FALSE,
          user_id TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          type TEXT NOT NULL
        );`,
        table: "personas",
        description: "Create personas table (ID changed to 36 chars)"
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS extensions (
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
        table: "extensions",
        description: "Create extensions table"
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY,
          metadata TEXT,
          page_content TEXT NOT NULL,
          chat_thread_id TEXT NOT NULL,
          embedding VECTOR(1536),
          user_id TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          is_admin_kb BOOLEAN DEFAULT FALSE
        );`,
        table: "documents",
        description: "Create documents table with is_admin_kb flag"
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS chat_messages (
          id CHAR(36) PRIMARY KEY,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          type TEXT NOT NULL,
          is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
          content TEXT NOT NULL,
          name TEXT,
          role TEXT,
          thread_id TEXT NOT NULL,
          user_id TEXT,
          multi_modal_image TEXT
        );`,
        table: "chat_messages",
        description: "Create chat messages table (ID changed to 36 chars)"
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS chat_documents (
          id CHAR(36) PRIMARY KEY,
          chat_thread_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          type TEXT NOT NULL,
          is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
          name TEXT NOT NULL
        );`,
        table: "chat_documents",
        description: "Create chat documents table (ID changed to 36 chars)"
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS prompts (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          is_published BOOLEAN NOT NULL DEFAULT FALSE,
          user_id TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          type TEXT NOT NULL,
          embedding VECTOR(1536)
        );`,
        table: "prompts",
        description: "Create prompts table"
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS prompt_logs (
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
        );`,
        table: "prompt_logs",
        description: "Create prompt logs table for monitoring"
      }
    ];

    // Execute each SQL statement sequentially and log it
    for (const statement of schemaSQLStatements) {
      console.log(`Executing SQL for table: ${statement.table}`);
      await sql.unsafe(statement.sql); // Use unsafe for CREATE TABLE, etc.
      await logSchemaCorrection(
        "schema_init",
        statement.table, 
        statement.description,
        statement.sql
      );
    }

     // Add indexes after tables are created
    const indexStatements = [
        { sql: `CREATE INDEX IF NOT EXISTS idx_chat_threads_user_id ON chat_threads (user_id);`, table: "chat_threads", description: "Index on user_id"},
        { sql: `CREATE INDEX IF NOT EXISTS idx_chat_threads_type ON chat_threads (type);`, table: "chat_threads", description: "Index on type"},
        { sql: `CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id ON chat_messages (thread_id);`, table: "chat_messages", description: "Index on thread_id"},
        { sql: `CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages (user_id);`, table: "chat_messages", description: "Index on user_id"},
        { sql: `CREATE INDEX IF NOT EXISTS idx_documents_chat_thread_id ON documents (chat_thread_id);`, table: "documents", description: "Index on chat_thread_id"},
        { sql: `CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents (user_id);`, table: "documents", description: "Index on user_id"},
        { sql: `CREATE INDEX IF NOT EXISTS idx_documents_is_admin_kb ON documents (is_admin_kb);`, table: "documents", description: "Index on is_admin_kb"},
        // Add HNSW index for vector similarity search if not exists
        { sql: `CREATE INDEX IF NOT EXISTS idx_documents_embedding ON documents USING hnsw (embedding vector_cosine_ops);`, table: "documents", description: "HNSW index on embedding"},
    ];

     for (const statement of indexStatements) {
      console.log(`Executing SQL for index on: ${statement.table}`);
      await sql.unsafe(statement.sql); // Use unsafe for CREATE INDEX IF NOT EXISTS
      await logSchemaCorrection(
        "index_creation",
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
    // Use the default instance for logging corrections, regardless of user DB
    const defaultConnectionString = process.env.DATABASE_URL;
    if (!defaultConnectionString) {
      console.error("Cannot log schema correction: Default DATABASE_URL is not set.");
      return;
    }
    const sql = neon(defaultConnectionString);

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
     // Use the default instance for reading corrections
     const defaultConnectionString = process.env.DATABASE_URL;
     if (!defaultConnectionString) {
       console.error("Cannot get schema corrections: Default DATABASE_URL is not set.");
       return [];
     }
     const sql = neon(defaultConnectionString);

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