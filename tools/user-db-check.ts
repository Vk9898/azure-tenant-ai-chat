#!/usr/bin/env node
/**
 * User Database Connection Checker
 * 
 * This script helps diagnose issues with user-specific database connections by:
 * 1. Getting a user's token and session data
 * 2. Extracting their database connection string
 * 3. Testing connection to their personal database
 * 4. Checking if tables exist and have data
 */

import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import readline from "readline";
import { hashValueSync } from "../lib/auth/auth-utils";

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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

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

// Mock the auth flow to get user information
async function getUserInfo() {
  const userEmail = await question("Enter user email (for hashing ID): ");
  
  if (!userEmail) {
    error("Email is required");
    return null;
  }
  
  const hashedUserId = hashValueSync(userEmail.toLowerCase());
  info(`Hashed user ID: ${hashedUserId}`);
  
  return {
    email: userEmail,
    hashedUserId,
  };
}

// Check if a user's project exists in Neon
async function checkUserProject(userId: string) {
  printMessage("\n==== User Neon Project Check ====", "cyan");
  
  const apiKey = process.env.NEON_API_KEY;
  if (!apiKey) {
    error("NEON_API_KEY environment variable is not set");
    return null;
  }
  
  const projectName = `user-${userId}`;
  info(`Looking for project: ${projectName}`);
  
  try {
    const response = await fetch("https://console.neon.tech/api/v2/projects", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });
    
    if (!response.ok) {
      error(`Failed to fetch projects: ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    const project = data.projects.find((p: any) => p.name === projectName);
    
    if (!project) {
      error(`No project found with name: ${projectName}`);
      return null;
    }
    
    success(`Found project: ${project.name} (ID: ${project.id})`);
    return project;
  } catch (err) {
    error(`Error checking user project: ${err instanceof Error ? err.message : String(err)}`);
    console.error(err);
    return null;
  }
}

// Get connection string for a user's project
async function getUserConnectionString(projectId: string) {
  printMessage("\n==== Getting Connection String ====", "cyan");
  
  const apiKey = process.env.NEON_API_KEY;
  if (!apiKey) {
    error("NEON_API_KEY environment variable is not set");
    return null;
  }
  
  try {
    // Get branches
    const branchesResponse = await fetch(`https://console.neon.tech/api/v2/projects/${projectId}/branches`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });
    
    if (!branchesResponse.ok) {
      error(`Failed to fetch branches: ${branchesResponse.statusText}`);
      return null;
    }
    
    const branchesData = await branchesResponse.json();
    const defaultBranch = branchesData.branches.find((b: any) => b.primary);
    
    if (!defaultBranch) {
      error("Default branch not found");
      return null;
    }
    
    success(`Found default branch: ${defaultBranch.name} (ID: ${defaultBranch.id})`);
    
    // Get endpoints
    const endpointsResponse = await fetch(`https://console.neon.tech/api/v2/projects/${projectId}/branches/${defaultBranch.id}/endpoints`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });
    
    if (!endpointsResponse.ok) {
      error(`Failed to fetch endpoints: ${endpointsResponse.statusText}`);
      return null;
    }
    
    const endpointsData = await endpointsResponse.json();
    const rwEndpoint = endpointsData.endpoints.find((ep: any) => ep.type === 'read_write');
    
    if (!rwEndpoint) {
      error("Read-write endpoint not found");
      return null;
    }
    
    success(`Found read-write endpoint: ${rwEndpoint.id}`);
    
    // Get connection URI
    const dbName = process.env.NEON_DEFAULT_DB_NAME || "neondb";
    const roleName = process.env.NEON_DEFAULT_DB_ROLE || "neondb_owner";
    
    const connectionUriResponse = await fetch(
      `https://console.neon.tech/api/v2/projects/${projectId}/connection_uri?` +
      `endpoint_id=${rwEndpoint.id}&role_name=${encodeURIComponent(roleName)}&database_name=${encodeURIComponent(dbName)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
        },
      }
    );
    
    if (!connectionUriResponse.ok) {
      error(`Failed to fetch connection URI: ${connectionUriResponse.statusText}`);
      return null;
    }
    
    const connectionUriData = await connectionUriResponse.json();
    const connectionString = connectionUriData.connection_uri;
    
    if (!connectionString) {
      error("No connection string returned");
      return null;
    }
    
    success("Successfully retrieved connection string");
    return connectionString;
  } catch (err) {
    error(`Error getting connection string: ${err instanceof Error ? err.message : String(err)}`);
    console.error(err);
    return null;
  }
}

// Test database connection
async function testConnection(connectionString: string) {
  printMessage("\n==== Testing Database Connection ====", "cyan");
  
  try {
    info(`Testing connection to: ${connectionString.substring(0, 30)}...`);
    const sql = neon(connectionString);
    
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
async function checkTables(connectionString: string) {
  printMessage("\n==== Database Tables Check ====", "cyan");
  
  try {
    const sql = neon(connectionString);
    
    // Query to list all tables in the database
    const tableQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    const tables = await sql(tableQuery);
    
    if (!tables || tables.length === 0) {
      warning("No tables found in the database - schema initialization may have failed");
      return false;
    }
    
    success(`Found ${tables.length} tables in the database:`);
    
    const expectedTables = [
      'chat_threads',
      'chat_messages',
      'documents',
      'schema_corrections',
      'personas',
      'extensions',
      'chat_documents',
      'chat_citations',
      'prompts',
      'prompt_logs'
    ];
    
    const foundTables = tables.map((t: any) => t.table_name);
    const missingTables = expectedTables.filter(t => !foundTables.includes(t));
    
    if (missingTables.length > 0) {
      warning(`Missing expected tables: ${missingTables.join(', ')}`);
    }
    
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

// Check the vector extension
async function checkVectorExtension(connectionString: string) {
  printMessage("\n==== Vector Extension Check ====", "cyan");
  
  try {
    const sql = neon(connectionString);
    
    const query = `
      SELECT * FROM pg_extension WHERE extname = 'vector';
    `;
    
    const result = await sql(query);
    
    if (result && result.length > 0) {
      success("Vector extension is installed and active");
      return true;
    } else {
      error("Vector extension is not installed - this will cause embedding operations to fail");
      return false;
    }
  } catch (err) {
    error(`Failed to check vector extension: ${err instanceof Error ? err.message : String(err)}`);
    console.error(err);
    return false;
  }
}

// Main function to run all checks
async function checkUserDatabase() {
  printMessage("==============================================", "magenta");
  printMessage("         USER DATABASE CONNECTION CHECK       ", "magenta");
  printMessage("==============================================", "magenta");
  
  try {
    // Get user info
    const userInfo = await getUserInfo();
    if (!userInfo) {
      error("Failed to get user info");
      return;
    }
    
    // Check if user project exists
    const project = await checkUserProject(userInfo.hashedUserId);
    if (!project) {
      warning("User project not found. This could indicate:");
      warning("1. The user has never logged in");
      warning("2. Project creation failed during authentication");
      warning("3. The user ID hash is different from what's used in auth");
      
      // Offer to create the project
      const shouldCreate = await question("Would you like to create a project for this user? (y/n): ");
      if (shouldCreate.toLowerCase() === 'y') {
        info("To create a project, the user should log in to the application.");
        info("This will trigger the automatic project creation in the auth flow.");
        // You could implement manual project creation here if needed
      }
      
      return;
    }
    
    // Get connection string
    const connectionString = await getUserConnectionString(project.id);
    if (!connectionString) {
      error("Failed to get connection string");
      return;
    }
    
    // Test connection
    const connOk = await testConnection(connectionString);
    if (!connOk) {
      error("Connection test failed");
      return;
    }
    
    // Check tables and schema
    await checkTables(connectionString);
    await checkVectorExtension(connectionString);
    
    printMessage("\n==== Summary ====", "cyan");
    info(`User Email: ${userInfo.email}`);
    info(`Hashed User ID: ${userInfo.hashedUserId}`);
    info(`Project ID: ${project.id}`);
    info(`Project Name: ${project.name}`);
    
    info("\nRecommendations:");
    info("1. If tables are missing, the schema initialization might have failed");
    info("2. Empty tables could indicate the user hasn't created any content");
    info("3. Make sure the vector extension is properly installed for embeddings to work");
    
  } catch (err) {
    error(`Unhandled error: ${err instanceof Error ? err.message : String(err)}`);
    console.error(err);
  } finally {
    rl.close();
  }
}

// Run the checks
checkUserDatabase().catch(err => {
  error(`Fatal error: ${err instanceof Error ? err.message : String(err)}`);
  console.error(err);
  process.exit(1);
}); 