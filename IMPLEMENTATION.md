# Centralized RAG Knowledge Base Implementation

## Overview

We have successfully implemented a centralized RAG (Retrieval Augmented Generation) system that prioritizes organization-wide knowledge from an admin knowledge base while still allowing users to access their personal documents. This enhancement significantly improves the consistency and quality of AI-generated responses across all users.

## Implemented Changes

### 1. Database Schema Updates

- Added an `is_admin_kb` column to the `documents` table to identify admin knowledge base entries
- Created specialized indexes for efficient querying:
  - A partial index for admin knowledge base documents
  - Vector similarity indexes optimized for both admin and user documents

```sql
-- Schema changes made to documents table
ALTER TABLE documents ADD COLUMN is_admin_kb BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX idx_admin_kb ON documents (is_admin_kb) WHERE is_admin_kb = TRUE;
CREATE INDEX idx_admin_embedding ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100) WHERE is_admin_kb = TRUE;
CREATE INDEX idx_user_embedding ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100) WHERE is_admin_kb = FALSE;
```

### 2. Core Search Functionality

The similarity search function has been enhanced to:
- Prioritize admin documents in search results (70% admin, 30% user by default)
- Allow adjustable ratios between admin and user document retrieval
- Combine and sort results based on relevance

```typescript
// Updated SimilaritySearch function now supports prioritizing admin documents
export const SimilaritySearch = async (
  searchText: string,
  k: number,
  userId: string,
  chatThreadId: string,
  adminRatio: number = 0.7 // 70% admin documents by default
): Promise<ServerActionResponse<Array<DocumentSearchResponse>>> => {
  // ... implementation details ...
}
```

### 3. Document Indexing with Admin Flag

The document indexing process now supports:
- Admin access verification before allowing admin KB updates
- Setting appropriate flags on documents to identify them as admin or user
- Properly structuring database entries to work with the updated schema

```typescript
// IndexDocuments now accepts an isAdminKb parameter
export const IndexDocuments = async (
  fileName: string,
  docs: string[],
  chatThreadId: string,
  isAdminKb: boolean = false
): Promise<Array<ServerActionResponse<boolean>>> => {
  // ... implementation details ...
}
```

### 4. Chat API Integration

The RAG-powered chat API has been updated to:
- Accept and use the admin knowledge ratio parameter
- Clearly mark sources in prompts ([ADMIN] vs [USER])
- Instruct the language model to prioritize admin knowledge sources

```typescript
// Updated chat API with admin ratio support
export const ChatApiRAG = async (props: {
  chatThread: ChatThreadModel;
  userMessage: string;
  history: ChatCompletionMessageParam[];
  signal: AbortSignal;
  adminKbRatio?: number;
}): Promise<ChatCompletionStreamingRunner> => {
  // ... implementation details ...
}
```

### 5. Admin User Interface

Created a dedicated interface for administrators to:
- Upload documents to the central knowledge base
- View upload status and errors
- Manage the knowledge base (placeholder for future enhancement)

```tsx
// New component for admin knowledge base management
export function AdminKnowledgeBaseUploader() {
  // ... implementation details ...
}
```

### 6. Admin Utilities

Developed command-line utility for bulk importing documents:
- Supports directory-based batch importing
- Handles document parsing and chunking
- Validates administrative access
- Reports on success and failures

## Testing

You can test the implementation by:

1. Updating all database schemas using the migration script:
   ```
   psql -f data/migrations/centralize-rag-migration.sql
   ```

2. Uploading documents through the admin dashboard interface

3. Using the bulk import script for large document sets:
   ```
   ts-node scripts/import-admin-kb.ts --dir=./documents --admin-id=YOUR_ADMIN_ID
   ```

4. Testing chat with both admin and user documents present

## Next Steps

1. **User Interface Enhancements**:
   - Add visual indicators for admin vs. user knowledge sources
   - Create controls for users to adjust admin/user knowledge ratio

2. **Document Management**:
   - Implement tagging and categorization for admin documents
   - Add analytics to track document usage and relevance

3. **Performance Optimization**:
   - Monitor and optimize query performance
   - Implement caching for frequently accessed admin documents

4. **Security Enhancements**:
   - Add audit logging for admin knowledge base changes
   - Implement content filtering for sensitive information

## Conclusion

The centralized RAG implementation provides a significant upgrade to our AI chat system by ensuring consistent, organization-wide knowledge is available to all users while still maintaining personalized document context when needed. This creates a balance between centralized knowledge management and individual user experiences. 