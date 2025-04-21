#!/usr/bin/env node
/**
 * Neon DB Validator Tool
 * 
 * This script helps diagnose issues with Neon DB setup by:
 * 1. Checking environment variables
 * 2. Testing database connections
 * 3. Verifying table existence
 * 4. Running basic queries
 */

import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { getSchemaCorrections } from "../lib/db/neondb";

// Load environment variables
dotenv.config();

// Color formatting for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

// Print a formatted message
function printMessage(message: string, color: keyof typeof colors = "white") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Format success/error messages
function success(message: string) {
  printMessage(`✅ ${message}`, "green");
}

function error(message: string) {
  printMessage(`❌ ${message}`, "red");
}

function warning(message: string) {
  printMessage(`⚠️ ${message}`, "yellow");
}

function info(message: string) {
  printMessage(`ℹ️ ${message}`, "blue");
}

// Validate environment variables
async function checkEnvironmentVariables() {
  printMessage("\n==== Environment Variables ====", "cyan");
  
  const requiredVars = [
    "DATABASE_URL",
    "NEON_API_KEY",
    "NEON_DEFAULT_DB_NAME",
    "NEON_DEFAULT_DB_ROLE",
  ];
  
  let allPresent = true;
  
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      success(`${varName} is set`);
    } else {
      error(`${varName} is missing`);
      allPresent = false;
    }
  }
  
  if (!allPresent) {
    warning("Some required environment variables are missing. This may cause database initialization to fail.");
  }
  
  return allPresent;
}

// Test database connection
async function testDatabaseConnection(connectionString?: string) {
  printMessage("\n==== Database Connection Test ====", "cyan");
  
  try {
    const connString = connectionString || process.env.DATABASE_URL;
    if (!connString) {
      error("No connection string provided and DATABASE_URL is not set");
      return false;
    }
    
    info(`Testing connection to: ${connString.substring(0, 30)}...`);
    const sql = neon(connString);
    
    // Simple query to test connection
    const result = await sql`SELECT 1 as test`;
    
    if (result && result[0]?.test === 1) {
      success("Database connection successful");
      return true;
    } else {
      error("Database connection failed: unexpected response");
      console.log("Response:", result);
      return false;
    }
  } catch (err) {
    error(`Database connection failed: ${err instanceof Error ? err.message : String(err)}`);
    console.error(err);
    return false;
  }
}

// Check if tables exist
async function checkTables(connectionString?: string) {
  printMessage("\n==== Database Tables Check ====", "cyan");
  
  try {
    const connString = connectionString || process.env.DATABASE_URL;
    if (!connString) {
      error("No connection string provided and DATABASE_URL is not set");
      return false;
    }
    
    const sql = neon(connString);
    
    // Query to list all tables in the database
    const tableQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    const tables = await sql(tableQuery);
    
    if (!tables || tables.length === 0) {
      warning("No tables found in the database");
      return false;
    }
    
    success(`Found ${tables.length} tables in the database:`);
    
    // List all tables with row counts
    for (const table of tables) {
      const tableName = table.table_name;
      try {
        const countQuery = `SELECT COUNT(*) as count FROM "${tableName}"`;
        const countResult = await sql(countQuery);
        const count = countResult[0]?.count || 0;
        
        if (count > 0) {
          success(`- ${tableName}: ${count} rows`);
        } else {
          warning(`- ${tableName}: ${count} rows (empty table)`);
        }
      } catch (err) {
        error(`- ${tableName}: Error counting rows - ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    
    return true;
  } catch (err) {
    error(`Failed to check tables: ${err instanceof Error ? err.message : String(err)}`);
    console.error(err);
    return false;
  }
}

// Check schema corrections history
async function checkSchemaCorrections() {
  printMessage("\n==== Schema Corrections History ====", "cyan");
  
  try {
    const corrections = await getSchemaCorrections(10, 0);
    
    if (!corrections || corrections.length === 0) {
      warning("No schema corrections found");
      return false;
    }
    
    success(`Found ${corrections.length} schema corrections:`);
    
    for (const correction of corrections) {
      info(`- ${correction.executed_at}: ${correction.table_name} - ${correction.description}`);
    }
    
    return true;
  } catch (err) {
    error(`Failed to check schema corrections: ${err instanceof Error ? err.message : String(err)}`);
    console.error(err);
    return false;
  }
}

// Run a simple query to verify vector functionality
async function testVectorFunctionality(connectionString?: string) {
  printMessage("\n==== Vector Functionality Test ====", "cyan");
  
  try {
    const connString = connectionString || process.env.DATABASE_URL;
    if (!connString) {
      error("No connection string provided and DATABASE_URL is not set");
      return false;
    }
    
    const sql = neon(connString);
    
    // Check if vector extension is enabled
    const vectorExtQuery = `
      SELECT * FROM pg_extension WHERE extname = 'vector';
    `;
    
    const vectorExt = await sql(vectorExtQuery);
    
    if (!vectorExt || vectorExt.length === 0) {
      error("Vector extension is not installed");
      return false;
    }
    
    success("Vector extension is installed");
    
    // Test a simple vector operation
    const vectorTestQuery = `
      SELECT '[1,2,3]'::vector <-> '[4,5,6]'::vector as distance;
    `;
    
    const vectorTest = await sql(vectorTestQuery);
    
    if (vectorTest && vectorTest[0]?.distance !== undefined) {
      success(`Vector operations working (test distance: ${vectorTest[0].distance})`);
      return true;
    } else {
      error("Vector operations failed");
      return false;
    }
  } catch (err) {
    error(`Failed to test vector functionality: ${err instanceof Error ? err.message : String(err)}`);
    console.error(err);
    return false;
  }
}

// Main function to run all checks
async function runAllChecks() {
  printMessage("==============================================", "magenta");
  printMessage("           NEON DB VALIDATOR TOOL            ", "magenta");
  printMessage("==============================================", "magenta");
  
  const envVarsOk = await checkEnvironmentVariables();
  
  if (!envVarsOk) {
    warning("Environment variable issues detected. Some tests may fail.");
  }
  
  const connOk = await testDatabaseConnection();
  
  if (!connOk) {
    error("Cannot proceed with further tests due to connection failure.");
    return;
  }
  
  await checkTables();
  await checkSchemaCorrections();
  await testVectorFunctionality();
  
  printMessage("\n==== Summary ====", "cyan");
  info("All tests completed. Check the results above for any issues.");
  info("If tables are missing or empty, try running the schema initialization again.");
  info("If vector extension is not installed, ensure you have the correct Postgres version (15+).");
}

// Run the checks
runAllChecks().catch(err => {
  error(`Unhandled error: ${err instanceof Error ? err.message : String(err)}`);
  console.error(err);
  process.exit(1);
}); 