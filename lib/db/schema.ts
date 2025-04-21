/**
 * Centralized Database Schema Definition
 * 
 * This file contains the schema definitions for all database tables used in the application.
 * All database initialization and migration should reference these definitions to ensure consistency.
 */

export const SchemaDefinition = {
  // Vector extension for embedding support
  vectorExtension: `CREATE EXTENSION IF NOT EXISTS vector;`,
  
  // Schema correction tracking table
  schemaCorrections: `
    CREATE TABLE IF NOT EXISTS schema_corrections (
      id SERIAL PRIMARY KEY,
      correction_type TEXT NOT NULL,
      table_name TEXT NOT NULL,
      description TEXT NOT NULL,
      sql_executed TEXT,
      user_id TEXT,
      executed_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `,
  
  // Core application tables
  chatThreads: `
    CREATE TABLE IF NOT EXISTS chat_threads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      use_name TEXT NULL,
      user_id TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      last_message_at TIMESTAMP NOT NULL DEFAULT NOW(),
      bookmarked BOOLEAN NOT NULL DEFAULT FALSE,
      is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
      type TEXT NOT NULL,
      persona_message TEXT,
      persona_message_title TEXT,
      extension TEXT[] DEFAULT '{}'::text[]
    );
  `,
  
  chatCitations: `
    CREATE TABLE IF NOT EXISTS chat_citations (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      type TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `,
  
  personas: `
    CREATE TABLE IF NOT EXISTS personas (
      id CHAR(64) PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      persona_message TEXT NOT NULL,
      is_published BOOLEAN NOT NULL DEFAULT FALSE,
      user_id CHAR(64) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      type TEXT NOT NULL
    );
  `,
  
  extensions: `
    CREATE TABLE IF NOT EXISTS extensions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      execution_steps TEXT NOT NULL,
      description TEXT NOT NULL,
      is_published BOOLEAN NOT NULL DEFAULT FALSE,
      user_id TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      type TEXT NOT NULL,
      functions JSONB DEFAULT '[]'::JSONB,
      headers JSONB DEFAULT '[]'::JSONB
    );
  `,
  
  documents: `
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      metadata TEXT,
      page_content TEXT NOT NULL,
      chat_thread_id TEXT NOT NULL,
      embedding VECTOR(1536),
      user_id TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      is_admin_kb BOOLEAN DEFAULT FALSE
    );
  `,
  
  chatMessages: `
    CREATE TABLE IF NOT EXISTS chat_messages (
      id CHAR(64) PRIMARY KEY,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      type TEXT NOT NULL,
      is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
      content TEXT NOT NULL,
      name TEXT,
      role TEXT,
      thread_id CHAR(64) NOT NULL,
      user_id CHAR(64),
      multi_modal_image TEXT
    );
  `,
  
  chatDocuments: `
    CREATE TABLE IF NOT EXISTS chat_documents (
      id CHAR(64) PRIMARY KEY,
      chat_thread_id CHAR(64) NOT NULL,
      user_id CHAR(64) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      type TEXT NOT NULL,
      is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
      name TEXT NOT NULL
    );
  `,
  
  prompts: `
    CREATE TABLE IF NOT EXISTS prompts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      is_published BOOLEAN NOT NULL DEFAULT FALSE,
      user_id TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      type TEXT NOT NULL,
      embedding VECTOR(1536)
    );
  `,
  
  promptLogs: `
    CREATE TABLE IF NOT EXISTS prompt_logs (
      id SERIAL PRIMARY KEY,
      user_id TEXT,
      thread_id TEXT,
      model_name TEXT NOT NULL,
      prompt TEXT NOT NULL,
      expected_response TEXT,
      actual_response TEXT NOT NULL,
      temperature FLOAT,
      max_tokens INTEGER,
      tokens_used INTEGER,
      response_time_ms INTEGER,
      success BOOLEAN NOT NULL DEFAULT TRUE,
      error_message TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      metadata JSONB
    );
  `,
  
  // Standard indexes for performance
  standardIndexes: [
    { sql: `CREATE INDEX IF NOT EXISTS idx_chat_threads_user_id ON chat_threads (user_id);`,
      table: "chat_threads", description: "Index on user_id" },
    { sql: `CREATE INDEX IF NOT EXISTS idx_chat_threads_type ON chat_threads (type);`,
      table: "chat_threads", description: "Index on type" },
    { sql: `CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id ON chat_messages (thread_id);`,
      table: "chat_messages", description: "Index on thread_id" },
    { sql: `CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages (user_id);`,
      table: "chat_messages", description: "Index on user_id" },
    { sql: `CREATE INDEX IF NOT EXISTS idx_documents_chat_thread_id ON documents (chat_thread_id);`,
      table: "documents", description: "Index on chat_thread_id" },
    { sql: `CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents (user_id);`,
      table: "documents", description: "Index on user_id" },
    { sql: `CREATE INDEX IF NOT EXISTS idx_documents_is_admin_kb ON documents (is_admin_kb);`,
      table: "documents", description: "Index on is_admin_kb" },
  ],
  
  // Vector indexes for similarity search
  vectorIndexes: [
    { sql: `CREATE INDEX IF NOT EXISTS idx_admin_embedding ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100) WHERE is_admin_kb = TRUE;`,
      table: "documents", description: "IVFFLAT index on admin embeddings" },
    { sql: `CREATE INDEX IF NOT EXISTS idx_user_embedding ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100) WHERE is_admin_kb = FALSE;`,
      table: "documents", description: "IVFFLAT index on user embeddings" },
    // Fallback index using HNSW if IVFFLAT creation fails
    { sql: `CREATE INDEX IF NOT EXISTS idx_documents_embedding ON documents USING hnsw (embedding vector_cosine_ops);`,
      table: "documents", description: "HNSW index on embedding (fallback)" },
  ]
};

/**
 * Get all schema SQL statements in the order they should be executed
 */
export function getAllSchemaStatements(): { sql: string, table: string, description: string }[] {
  return [
    { sql: SchemaDefinition.vectorExtension, table: "postgres_extension", description: "Enable vector extension" },
    { sql: SchemaDefinition.schemaCorrections, table: "schema_corrections", description: "Schema corrections tracking table" },
    { sql: SchemaDefinition.chatThreads, table: "chat_threads", description: "Chat threads table" },
    { sql: SchemaDefinition.chatCitations, table: "chat_citations", description: "Chat citations table" },
    { sql: SchemaDefinition.personas, table: "personas", description: "Personas table" },
    { sql: SchemaDefinition.extensions, table: "extensions", description: "Extensions table" },
    { sql: SchemaDefinition.documents, table: "documents", description: "Documents table" },
    { sql: SchemaDefinition.chatMessages, table: "chat_messages", description: "Chat messages table" },
    { sql: SchemaDefinition.chatDocuments, table: "chat_documents", description: "Chat documents table" },
    { sql: SchemaDefinition.prompts, table: "prompts", description: "Prompts table" },
    { sql: SchemaDefinition.promptLogs, table: "prompt_logs", description: "Prompt logs table" },
    ...SchemaDefinition.standardIndexes,
    ...SchemaDefinition.vectorIndexes,
  ];
} 