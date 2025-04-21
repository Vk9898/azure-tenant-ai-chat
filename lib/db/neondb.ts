import { neon } from "@neondatabase/serverless";
import path from "path";
import fs from "fs/promises";
import { auth } from "@/lib/auth/auth-api"; // Import auth directly
import type { CustomUser } from "@/lib/auth/auth-helpers"; // Import type if needed
import { getAllSchemaStatements } from "@/lib/db/schema"; // Import centralized schema

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
    const defaultConnectionString = process.env.ANON_DATABASE_URL;
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

    // Add check for connection string validity
    if (!connectionString || typeof connectionString !== 'string' || connectionString.trim() === '') {
      console.error("FATAL: Invalid or empty connectionString provided to initializeDatabaseSchema.");
      throw new Error("Invalid database connection string for schema initialization.");
    }
    console.log(`Using connection string for schema init: ${connectionString.substring(0, 20)}...`); // Log prefix

    // Initialize Neon client
    const sql = neon(connectionString);

    // Get all schema statements from the centralized schema definition
    const schemaStatements = getAllSchemaStatements();

    // Execute each SQL statement sequentially and log it
    for (const statement of schemaStatements) {
      console.log(`Executing SQL for ${statement.table}: ${statement.description}`);
      try {
        await sql(statement.sql); // Execute raw SQL directly
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
          statement.sql
        );
      }
    }

    console.log("Database schema initialized successfully.");
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