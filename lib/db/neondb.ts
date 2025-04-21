import { neon } from "@neondatabase/serverless";
import path from "path";
import fs from "fs/promises";
import { auth } from "@/lib/auth/auth-api"; // Import auth directly
import type { CustomUser } from "@/lib/auth/auth-helpers"; // Import type if needed
import { getAllSchemaStatements } from "@/lib/db/schema"; // Import centralized schema
import { checkAndCreateTables } from "@/lib/db/drizzle/config"; // Import Drizzle table checking

/**
 * Get a Neon database instance using the appropriate connection string.
 * Prioritizes explicitly provided connection string, then user-specific string from session,
 * then falls back to environment variable.
 * 
 * Also performs automatic table validation and creation if tables are missing.
 */
export const NeonDBInstance = async (connectionString?: string) => {
  try {
    let finalConnectionString: string | undefined;
    let logPrefix = '';

    // Prioritize explicitly provided connection string
    if (connectionString) {
      finalConnectionString = connectionString;
      logPrefix = 'Explicitly provided';
    } else {
      // Get session directly using auth()
      const session = await auth();
      const user = session?.user as CustomUser | undefined;
      const userConnectionString = user?.databaseConnectionString;

      // Check if there's a user-specific connection string in the session
      if (userConnectionString) {
        console.log(`Using user-specific database for user ${user.email || user.id}`);
        finalConnectionString = userConnectionString;
        logPrefix = `User ${user.email || user.id}'s`;
      } else {
        // Fall back to the environment-provided connection string
        finalConnectionString = process.env.DATABASE_URL;
        if (!finalConnectionString) {
          throw new Error("No database connection string available - neither user-specific nor default.");
        }
        console.log("Using default database connection");
        logPrefix = 'Default';
      }
    }

    // Verify tables exist before returning the connection
    console.log(`${logPrefix} database: Checking for required tables...`);
    const checkResult = await checkAndCreateTables(finalConnectionString);
    
    if (!checkResult.success && checkResult.missingTables.includes('chat_threads')) {
      console.error(`CRITICAL: Failed to create chat_threads table. Error: ${checkResult.message}`);
      console.log(`Attempting emergency schema initialization...`);
      await initializeDatabaseSchema(finalConnectionString);
    } else if (checkResult.missingTables.length > 0) {
      console.warn(`Some tables couldn't be auto-created: ${checkResult.missingTables.join(', ')}`);
    }
    
    return neon(finalConnectionString);
  } catch (error) {
    console.error("Error initializing NeonDBInstance:", error);
    // Handle fallback to default connection
    const defaultConnectionString = process.env.DATABASE_URL;
    if (!defaultConnectionString) {
      console.error("FATAL: No default DATABASE_URL found after error in NeonDBInstance.");
      throw new Error("Database initialization failed and no default connection string available.");
    }
    console.warn("NeonDBInstance falling back to default DATABASE_URL due to error:", error);
    
    // Even for fallback, try to ensure tables exist
    try {
      const checkResult = await checkAndCreateTables(defaultConnectionString);
      if (!checkResult.success) {
        console.warn(`Tables check on fallback database failed: ${checkResult.message}`);
      }
    } catch (err) {
      console.error("Failed to check tables on fallback database:", err);
    }
    
    return neon(defaultConnectionString);
  }
};

// API endpoints for Neon
const NEON_API_URL = "https://console.neon.tech/api/v2";
const NEON_API_KEY = process.env.NEON_API_KEY;
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
    const projectName = `user-${userId}`;

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
            region_id: process.env.NEON_REGION_ID || "azure-eastus2",
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
    const defaultBranch = branchesData.branches.find((b: any) => b.primary);
    if (!defaultBranch) throw new Error('Default branch not found');

    const endpointsResponse = await fetch(`${NEON_API_URL}/projects/${projectId}/branches/${defaultBranch.id}/endpoints`, {
      headers: { Authorization: `Bearer ${NEON_API_KEY}`, Accept: 'application/json' },
    });
    if (!endpointsResponse.ok) throw new Error('Failed to fetch endpoints');
    const endpointsData = await endpointsResponse.json();
    const defaultEndpoint = endpointsData.endpoints.find((ep: any) => ep.type === 'read_write');
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
      await initializeDatabaseSchema(connectionString);
    }

    return connectionString;
  } catch (error) {
    console.error(`Error creating/retrieving Neon project for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Initialize the database schema for the project.
 * @param connectionString The connection string for the Neon database.
 */
export const initializeDatabaseSchema = async (connectionString: string) => {
  try {
    console.log("Initializing database schema...");

    // Add check for connection string validity
    if (!connectionString || typeof connectionString !== 'string' || connectionString.trim() === '') {
      console.error("FATAL: Invalid or empty connectionString provided to initializeDatabaseSchema.");
      throw new Error("Invalid database connection string for schema initialization.");
    }
    console.log(`Using connection string for schema init: ${connectionString.substring(0, 20)}...`);

    // Initialize Neon client
    const sql = neon(connectionString);

    // Get all schema statements from the centralized schema definition
    const schemaStatements = getAllSchemaStatements();

    // Execute each SQL statement sequentially and log it
    for (const statement of schemaStatements) {
      console.log(`Executing SQL for ${statement.table}: ${statement.description}`);
      try {
        await sql(statement.sql);
        await logSchemaCorrection(
          "schema_init",
          statement.table, 
          statement.description,
          statement.sql
        );
      } catch (error) {
        // Log the error but continue with other statements
        console.error(`Error executing SQL for ${statement.table}: ${error}`);
        await logSchemaCorrection(
          "schema_error",
          statement.table,
          `Error: ${error instanceof Error ? error.message : String(error)}`,
          statement.sql,
          null,
          connectionString
        );
      }
    }

    console.log("Database schema initialization completed.");
  } catch (error) {
    console.error("Error initializing database schema:", error);
    throw error;
  }
};

/**
 * Log a schema correction or data fix to the database
 * @param correctionType Type of correction (schema_update, data_fix, etc.)
 * @param tableName Target table
 * @param description Description of what was corrected
 * @param sqlExecuted The SQL that was executed (if applicable)
 * @param userId User who made the correction (if applicable)
 * @param specificConnectionString Optional connection string to use specifically for logging
 */
export const logSchemaCorrection = async (
  correctionType: string,
  tableName: string,
  description: string,
  sqlExecuted: string,
  userId?: string | null,
  specificConnectionString?: string
): Promise<void> => {
  try {
    // Use the specified connection string or default
    const connString = specificConnectionString || process.env.DATABASE_URL;
    if (!connString) {
      console.error("Cannot log schema correction: No connection string available");
      return;
    }
    
    const sql = neon(connString);

    // Ensure the schema_corrections table exists
    const createTableSql = `
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
    
    try {
      await sql(createTableSql);
    } catch (err) {
      console.error("Error creating schema_corrections table:", err);
      return; // Cannot log if we can't create the table
    }

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
      userId
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
 * @param connectionString Optional specific connection string to use
 * @returns Array of schema correction logs
 */
export const getSchemaCorrections = async (
  limit: number = 100,
  offset: number = 0,
  connectionString?: string
): Promise<any[]> => {
  try {
    // Use the specified connection string or get from database instance
    const sql = connectionString ? neon(connectionString) : await NeonDBInstance();

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