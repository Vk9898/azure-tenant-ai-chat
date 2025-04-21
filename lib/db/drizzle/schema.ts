import { pgTable, text, timestamp, boolean, serial, jsonb, index } from 'drizzle-orm/pg-core';
import { vector } from '@/lib/db/drizzle/vector-column';

// Schema Corrections table for tracking schema changes
export const schemaCorrections = pgTable('schema_corrections', {
  id: serial('id').primaryKey(),
  correctionType: text('correction_type').notNull(),
  tableName: text('table_name').notNull(),
  description: text('description').notNull(),
  sqlExecuted: text('sql_executed'),
  userId: text('user_id'),
  executedAt: timestamp('executed_at').defaultNow().notNull()
});

// Chat Threads table
export const chatThreads = pgTable('chat_threads', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  useName: text('use_name'),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastMessageAt: timestamp('last_message_at').defaultNow().notNull(),
  bookmarked: boolean('bookmarked').default(false).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  type: text('type').notNull(),
  personaMessage: text('persona_message'),
  personaMessageTitle: text('persona_message_title'),
  extension: text('extension').array().default([])
}, (table) => {
  return {
    userIdIdx: index('idx_chat_threads_user_id').on(table.userId),
    typeIdx: index('idx_chat_threads_type').on(table.type)
  };
});

// Chat Citations table
export const chatCitations = pgTable('chat_citations', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  type: text('type').notNull(),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Personas table
export const personas = pgTable('personas', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  personaMessage: text('persona_message').notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  type: text('type').notNull()
});

// Extensions table
export const extensions = pgTable('extensions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  executionSteps: text('execution_steps').notNull(),
  description: text('description').notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  type: text('type').notNull(),
  functions: jsonb('functions').default('[]'),
  headers: jsonb('headers').default('[]')
});

// Documents table
export const documents = pgTable('documents', {
  id: text('id').primaryKey(),
  metadata: text('metadata'),
  pageContent: text('page_content').notNull(),
  chatThreadId: text('chat_thread_id').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  isAdminKb: boolean('is_admin_kb').default(false)
}, (table) => {
  return {
    chatThreadIdIdx: index('idx_documents_chat_thread_id').on(table.chatThreadId),
    userIdIdx: index('idx_documents_user_id').on(table.userId),
    isAdminKbIdx: index('idx_documents_is_admin_kb').on(table.isAdminKb)
  };
});

// Chat Messages table
export const chatMessages = pgTable('chat_messages', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  type: text('type').notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  content: text('content').notNull(),
  name: text('name'),
  role: text('role'),
  threadId: text('thread_id').notNull(),
  userId: text('user_id'),
  multiModalImage: text('multi_modal_image')
}, (table) => {
  return {
    threadIdIdx: index('idx_chat_messages_thread_id').on(table.threadId),
    userIdIdx: index('idx_chat_messages_user_id').on(table.userId)
  };
});

// Chat Documents table
export const chatDocuments = pgTable('chat_documents', {
  id: text('id').primaryKey(),
  chatThreadId: text('chat_thread_id').notNull(),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  type: text('type').notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  name: text('name').notNull()
});

// Prompts table
export const prompts = pgTable('prompts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  type: text('type').notNull(),
  embedding: vector('embedding', { dimensions: 1536 })
});

// Prompt Logs table
export const promptLogs = pgTable('prompt_logs', {
  id: serial('id').primaryKey(),
  userId: text('user_id'),
  threadId: text('thread_id'),
  modelName: text('model_name').notNull(),
  prompt: text('prompt').notNull(),
  expectedResponse: text('expected_response'),
  actualResponse: text('actual_response').notNull(),
  temperature: text('temperature'),
  maxTokens: text('max_tokens'),
  tokensUsed: text('tokens_used'),
  responseTimeMs: text('response_time_ms'),
  success: boolean('success').default(true).notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  metadata: jsonb('metadata')
}); 