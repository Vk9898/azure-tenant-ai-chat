#!/usr/bin/env ts-node
/**
 * Admin script to import documents directly to the admin knowledge base
 * 
 * Usage:
 * ts-node scripts/import-admin-kb.ts --dir=./documents --admin-id=YOUR_ADMIN_ID
 */

import fs from 'fs';
import path from 'path';
import { CrackDocument } from '../src/features/chat-page/chat-services/chat-document-service';
import { IndexDocuments } from '../src/features/chat-page/chat-services/ai-search/neondb-ai-search';
import { uniqueId } from '../src/features/common/util';
import * as dotenv from 'dotenv';
import { parseArgs } from 'node:util';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const DEFAULT_ADMIN_THREAD_ID = 'admin-kb-global';

async function main() {
  // Parse command-line arguments
  const options = {
    dir: { type: 'string' as const },
    'admin-id': { type: 'string' as const },
    help: { type: 'boolean' as const },
  };

  const { values, positionals } = parseArgs({
    options,
    allowPositionals: true,
  });

  if (values.help) {
    console.log(`
Import documents to the admin knowledge base

Usage:
  ts-node scripts/import-admin-kb.ts --dir=./documents --admin-id=YOUR_ADMIN_ID

Options:
  --dir=PATH          Directory containing the documents to import
  --admin-id=ID       Admin user ID for authorization
  --help              Show this help message

Examples:
  ts-node scripts/import-admin-kb.ts --dir=./company-docs --admin-id=admin123
    `);
    process.exit(0);
  }

  // Validate arguments
  if (!values.dir) {
    console.error('Error: --dir parameter is required');
    process.exit(1);
  }

  if (!values['admin-id']) {
    console.error('Error: --admin-id parameter is required');
    process.exit(1);
  }

  const documentsDir = values.dir as string;
  const adminId = values['admin-id'] as string;

  // Check if directory exists
  if (!fs.existsSync(documentsDir)) {
    console.error(`Error: Directory not found: ${documentsDir}`);
    process.exit(1);
  }

  // Override userHashedId for the script
  process.env.OVERRIDE_USER_HASHED_ID = adminId;
  process.env.OVERRIDE_USER_IS_ADMIN = 'true';

  // Get all files in the directory
  const files = fs.readdirSync(documentsDir);
  console.log(`Found ${files.length} files in ${documentsDir}`);

  let successCount = 0;
  let errorCount = 0;
  
  // Process each file
  for (const file of files) {
    const filePath = path.join(documentsDir, file);
    
    // Skip directories
    if (fs.statSync(filePath).isDirectory()) {
      console.log(`Skipping directory: ${filePath}`);
      continue;
    }
    
    console.log(`Processing file: ${filePath}`);
    
    try {
      // Read the file
      const fileBuffer = fs.readFileSync(filePath);
      
      // Create FormData-like object for the document processor
      const formData = new FormData();
      const fileBlob = new Blob([fileBuffer], { type: getMimeType(filePath) });
      const fileObj = new File([fileBlob], file, { type: getMimeType(filePath) });
      formData.append('file', fileObj);
      
      // Extract content from the file using CrackDocument
      const fileResponse = await CrackDocument(formData);
      
      if (fileResponse.status !== 'OK' || !fileResponse.response || fileResponse.response.length === 0) {
        console.error(`  Error: Failed to extract content from ${filePath}: ${fileResponse.errors?.[0]?.message || 'Unknown error'}`);
        errorCount++;
        continue;
      }
      
      const docContent = fileResponse.response;
      console.log(`  Extracted ${docContent.length} content chunks`);
      
      // Index the document with the admin KB flag
      const indexResponse = await IndexDocuments(
        file,
        docContent,
        DEFAULT_ADMIN_THREAD_ID,
        true // Set as admin knowledge base document
      );
      
      // Check for errors
      const errors = indexResponse.filter(r => r.status !== 'OK');
      if (errors.length > 0) {
        console.error(`  Error indexing ${filePath}: ${JSON.stringify(errors)}`);
        errorCount++;
      } else {
        console.log(`  Successfully indexed ${filePath}`);
        successCount++;
      }
      
    } catch (error) {
      console.error(`  Error processing ${filePath}:`, error);
      errorCount++;
    }
  }
  
  console.log('\nImport Summary:');
  console.log(`  Total files: ${files.length}`);
  console.log(`  Successfully imported: ${successCount}`);
  console.log(`  Failed: ${errorCount}`);
}

// Helper function to determine MIME type based on file extension
function getMimeType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();
  
  switch (extension) {
    case '.pdf':
      return 'application/pdf';
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.txt':
      return 'text/plain';
    case '.md':
      return 'text/markdown';
    default:
      return 'application/octet-stream';
  }
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 