/**
 * Database Initialization Utility
 * 
 * This utility can be used to manually initialize a database with the centralized schema.
 * It's particularly useful for setting up the default database or recovering from schema errors.
 */

import { neon } from "@neondatabase/serverless";
import { getAllSchemaStatements } from "./schema";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Initialize database schema using a connection string
 * @param connectionString The database connection string
 * @returns A report of the initialization results
 */
export async function initializeDatabase(connectionString?: string): Promise<{
  success: boolean;
  tablesCreated: string[];
  errors: { table: string; error: string }[];
}> {
  const connString = connectionString || process.env.DATABASE_URL;
  if (!connString) {
    throw new Error("No connection string provided and DATABASE_URL environment variable is not set");
  }

  console.log("Initializing database schema...");
  console.log(`Using connection string: ${connString.substring(0, 15)}...`);

  const sql = neon(connString);
  const schemaStatements = getAllSchemaStatements();
  
  const result = {
    success: true,
    tablesCreated: [] as string[],
    errors: [] as { table: string; error: string }[],
  };

  // Execute each statement in sequence
  for (const statement of schemaStatements) {
    try {
      console.log(`Creating ${statement.table}: ${statement.description}`);
      await sql(statement.sql);
      result.tablesCreated.push(statement.table);
    } catch (error) {
      console.error(`Error creating ${statement.table}: ${error instanceof Error ? error.message : String(error)}`);
      result.errors.push({
        table: statement.table,
        error: error instanceof Error ? error.message : String(error),
      });
      result.success = false;
    }
  }

  // Verify tables were created
  if (result.success) {
    try {
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      const tables = await sql(tablesQuery);
      console.log(`Successfully created ${tables.length} tables.`);
    } catch (error) {
      console.error("Error verifying table creation:", error);
      result.success = false;
    }
  }

  return result;
}

/**
 * Entry point when script is run directly
 */
if (require.main === module) {
  // This runs when the script is executed directly
  console.log("=== Database Initialization Utility ===");
  
  // Check for DATABASE_URL environment variable
  if (!process.env.DATABASE_URL) {
    console.error("ERROR: DATABASE_URL environment variable is not set");
    console.error("Please set the DATABASE_URL environment variable or specify a connection string as an argument");
    process.exit(1);
  }
  
  // Parse command line arguments
  const connectionString = process.argv[2] || process.env.DATABASE_URL;
  
  initializeDatabase(connectionString)
    .then((result) => {
      console.log("\n=== Initialization Results ===");
      console.log(`Success: ${result.success}`);
      console.log(`Tables Created: ${result.tablesCreated.length}`);
      console.log(`Errors: ${result.errors.length}`);
      
      if (result.errors.length > 0) {
        console.log("\nError Details:");
        result.errors.forEach((error) => {
          console.log(`  - ${error.table}: ${error.error}`);
        });
      }
      
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Fatal error during initialization:", error);
      process.exit(1);
    });
} 