#!/usr/bin/env node
/**
 * Table Checker and Creator Utility
 * 
 * This script checks if required tables exist in the database and creates missing ones.
 * Can be used as a CLI tool or imported and used programmatically.
 */

import { neon } from '@neondatabase/serverless';
import { checkAndCreateTables } from './config';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Format console output
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

// CLI execution
async function runTableCheck(connectionString?: string) {
  try {
    const dbUrl = connectionString || process.env.DATABASE_URL;
    
    if (!dbUrl) {
      printMessage('No database connection string provided and DATABASE_URL is not set', 'red');
      return false;
    }
    
    printMessage('==== Database Table Checker ====', 'magenta');
    printMessage(`Using connection string: ${dbUrl.substring(0, 15)}...`, 'blue');
    
    // Run the check using imported function
    const result = await checkAndCreateTables(dbUrl);
    
    if (result.success) {
      if (result.missingTables.length === 0) {
        printMessage('✅ All required tables exist', 'green');
      } else {
        printMessage(`✅ Created missing tables: ${result.missingTables.join(', ')}`, 'green');
      }
    } else {
      printMessage(`❌ ${result.message}`, 'red');
      printMessage(`Missing tables: ${result.missingTables.join(', ')}`, 'yellow');
    }
    
    // Check schema_corrections table for recent logs
    try {
      const client = neon(dbUrl);
      const logsQuery = `
        SELECT correction_type, table_name, description, executed_at
        FROM schema_corrections
        ORDER BY executed_at DESC
        LIMIT 5;
      `;
      const logs = await client(logsQuery);
      
      if (logs.length > 0) {
        printMessage('\n==== Recent Schema Corrections ====', 'cyan');
        for (const log of logs) {
          printMessage(`${log.executed_at.toISOString()} - ${log.table_name}: ${log.correction_type} - ${log.description}`, 'blue');
        }
      }
    } catch (error) {
      printMessage('Could not check schema_corrections table', 'yellow');
    }
    
    return result.success;
  } catch (error) {
    printMessage(`Error checking tables: ${error instanceof Error ? error.message : String(error)}`, 'red');
    console.error(error);
    return false;
  }
}

// Execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const connectionString = process.argv[2];
  
  runTableCheck(connectionString)
    .then(success => {
      if (!success) {
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Unhandled error during table check:', err);
      process.exit(1);
    });
}

export { runTableCheck }; 