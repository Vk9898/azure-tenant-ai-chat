#!/usr/bin/env node
/**
 * Drizzle Migration Runner
 * 
 * This script applies database migrations using Drizzle ORM.
 * It can be used to apply migrations to the default database or a specific one.
 */

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Configure Neon for Drizzle compatibility
neonConfig.fetchConnectionCache = true;

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Main migration function
async function runMigrations(connectionString?: string) {
  // Use provided connection string or the default from environment
  const dbUrl = connectionString || process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('No database connection string provided and DATABASE_URL is not set');
    process.exit(1);
  }
  
  try {
    console.log('Starting database migration...');
    console.log(`Using connection string: ${dbUrl.substring(0, 15)}...`);
    
    // Create Drizzle client with neon-http
    const client = neon(dbUrl);
    const db = drizzle(client as any);
    
    // Run migrations from the migrations folder
    const migrationsFolder = join(__dirname, 'migrations');
    console.log(`Using migrations from: ${migrationsFolder}`);
    
    // First create vector extension if it doesn't exist
    try {
      await client(`CREATE EXTENSION IF NOT EXISTS vector;`);
      console.log('Vector extension enabled');
    } catch (err) {
      console.warn('Failed to enable vector extension:', err);
    }
    
    // Run migrations
    await migrate(db, { migrationsFolder });
    
    console.log('Migrations completed successfully!');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}

// Execute migrations if this file is run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // Get connection string from command line argument if provided
  const connectionString = process.argv[2];
  
  runMigrations(connectionString)
    .then(success => {
      if (success) {
        console.log('Migration process completed successfully.');
      } else {
        console.error('Migration process failed.');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Unhandled error during migration:', err);
      process.exit(1);
    });
}

export { runMigrations }; 