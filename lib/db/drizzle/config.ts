import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from './schema';

// Configure Neon for Drizzle compatibility
neonConfig.fetchConnectionCache = true;

/**
 * Create a Drizzle instance for the given connection string
 * @param connectionString Postgres connection string
 * @returns Drizzle ORM instance
 */
export function createDrizzleClient(connectionString: string) {
  const client = neon(connectionString);
  return drizzle(client as any, { schema });
}

/**
 * Initialize the database schema for a connection
 * @param connectionString Postgres connection string
 * @returns Result of the migration check
 */
export async function checkAndCreateTables(connectionString: string): Promise<{
  success: boolean;
  message: string;
  missingTables: string[];
}> {
  try {
    const client = neon(connectionString);
    const db = drizzle(client as any, { schema });
    
    // Check which tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    const existingTables = await client(tablesQuery);
    const existingTableNames = existingTables.map(t => t.table_name);
    
    // Check which of our schema tables are missing
    const allTableNames = Object.keys(schema).map(key => {
      // Extract table name from the schema object
      const obj = (schema as any)[key];
      return obj.name;
    }).filter(Boolean);
    
    const missingTables = allTableNames.filter(t => !existingTableNames.includes(t));
    
    if (missingTables.length === 0) {
      return {
        success: true,
        message: 'All tables exist',
        missingTables: []
      };
    }
    
    console.log(`Missing tables detected: ${missingTables.join(', ')}`);
    
    // Create missing tables using raw SQL
    // First ensure vector extension exists
    await client(`CREATE EXTENSION IF NOT EXISTS vector;`);
    
    // Generate schema statements for missing tables
    for (const missingTable of missingTables) {
      // Find the corresponding schema definition
      const schemaKey = Object.keys(schema).find(key => {
        const obj = (schema as any)[key];
        return obj.name === missingTable;
      });
      
      if (schemaKey) {
        const createStatement = getCreateTableStatement(missingTable);
        if (createStatement) {
          console.log(`Creating missing table: ${missingTable}`);
          await client(createStatement);
          
          // Log the correction
          await logSchemaCorrection(
            client,
            'schema_autocreate', 
            missingTable, 
            `Created missing table during runtime check`,
            createStatement
          );
        }
      }
    }
    
    // Verify all tables now exist
    const verifyTablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    const verifyTables = await client(verifyTablesQuery);
    const verifyTableNames = verifyTables.map(t => t.table_name);
    
    const stillMissingTables = allTableNames.filter(t => !verifyTableNames.includes(t));
    
    if (stillMissingTables.length === 0) {
      return {
        success: true,
        message: `Created ${missingTables.length} missing tables successfully`,
        missingTables: []
      };
    } else {
      return {
        success: false,
        message: `Failed to create some tables: ${stillMissingTables.join(', ')}`,
        missingTables: stillMissingTables
      };
    }
  } catch (error) {
    console.error('Error checking/creating tables:', error);
    return {
      success: false,
      message: `Error checking/creating tables: ${error instanceof Error ? error.message : String(error)}`,
      missingTables: []
    };
  }
}

/**
 * Log a schema correction to the database
 */
async function logSchemaCorrection(
  client: any,
  correctionType: string,
  tableName: string,
  description: string,
  sqlExecuted: string,
  userId?: string
): Promise<void> {
  try {
    // Ensure schema_corrections table exists first
    const createSchemaCorrectionsTable = `
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
    await client(createSchemaCorrectionsTable);
    
    // Insert the correction log
    const insertQuery = `
      INSERT INTO schema_corrections (
        correction_type, table_name, description, sql_executed, user_id
      ) VALUES ($1, $2, $3, $4, $5)
    `;
    await client(insertQuery, [
      correctionType,
      tableName,
      description,
      sqlExecuted,
      userId || null
    ]);
  } catch (error) {
    console.error('Error logging schema correction:', error);
    // Don't throw to avoid interrupting the process
  }
}

/**
 * Get SQL CREATE TABLE statement for a table based on the Schema Definition
 * @param tableName Table name 
 * @returns SQL CREATE TABLE statement
 */
function getCreateTableStatement(tableName: string): string | null {
  // Import the original schema definitions
  // This is a fallback to ensure we have proper SQL statements
  const { SchemaDefinition } = require('../schema');
  
  // Map table names to schema definition keys
  const tableToSchemaKey: Record<string, keyof typeof SchemaDefinition> = {
    'schema_corrections': 'schemaCorrections',
    'chat_threads': 'chatThreads',
    'chat_citations': 'chatCitations',
    'personas': 'personas',
    'extensions': 'extensions',
    'documents': 'documents',
    'chat_messages': 'chatMessages',
    'chat_documents': 'chatDocuments',
    'prompts': 'prompts',
    'prompt_logs': 'promptLogs'
  };
  
  const schemaKey = tableToSchemaKey[tableName];
  if (schemaKey && SchemaDefinition[schemaKey]) {
    return SchemaDefinition[schemaKey];
  }
  
  return null;
} 