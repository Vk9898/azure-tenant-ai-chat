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
    // Read the schema file
    const schemaPath = path.resolve("../data/schema.sql");
    const schemaSQL = await fs.readFile(schemaPath, "utf8");

    // Split the SQL file into individual statements
    const sqlStatements = schemaSQL
      .split(";") // Split by semicolon
      .map((stmt) => stmt.trim()) // Remove extra spaces
      .filter((stmt) => stmt.length > 0); // Exclude empty statements

    // Initialize Neon client
    const sql = neon(connectionString);

    // Execute each SQL statement sequentially
    for (const statement of sqlStatements) {
      console.log(`Executing SQL: ${statement}`);
      await sql(statement); // Execute the SQL statement
    }

    console.log("Database schema initialized successfully.");
  } catch (error) {
    console.error("Error initializing database schema:", error);
    throw error;
  }
};