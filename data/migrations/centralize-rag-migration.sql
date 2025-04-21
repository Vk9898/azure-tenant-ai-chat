-- Migration script for centralizing RAG functionality
-- This script adds the is_admin_kb column to the documents table and creates necessary indexes

-- Add is_admin_kb column to documents table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='documents' AND column_name='is_admin_kb') THEN
        ALTER TABLE documents ADD COLUMN is_admin_kb BOOLEAN NOT NULL DEFAULT FALSE;
        RAISE NOTICE 'Added is_admin_kb column to documents table';
    ELSE
        RAISE NOTICE 'is_admin_kb column already exists in documents table';
    END IF;
END $$;

-- Create index for admin knowledge base documents
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_admin_kb') THEN
        CREATE INDEX idx_admin_kb ON documents (is_admin_kb) WHERE is_admin_kb = TRUE;
        RAISE NOTICE 'Created idx_admin_kb index';
    ELSE
        RAISE NOTICE 'idx_admin_kb index already exists';
    END IF;
END $$;

-- Create optimized vector search indexes for admin KB and user documents
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_admin_embedding') THEN
        CREATE INDEX idx_admin_embedding ON documents USING ivfflat (embedding vector_cosine_ops) 
        WITH (lists = 100) WHERE is_admin_kb = TRUE;
        RAISE NOTICE 'Created idx_admin_embedding index';
    ELSE
        RAISE NOTICE 'idx_admin_embedding index already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_embedding') THEN
        CREATE INDEX idx_user_embedding ON documents USING ivfflat (embedding vector_cosine_ops) 
        WITH (lists = 100) WHERE is_admin_kb = FALSE;
        RAISE NOTICE 'Created idx_user_embedding index';
    ELSE
        RAISE NOTICE 'idx_user_embedding index already exists';
    END IF;
END $$;

-- Add entry to schema_corrections table to log this migration
INSERT INTO schema_corrections 
    (correction_type, table_name, description, sql_executed)
VALUES 
    ('schema_update', 'documents', 'Added is_admin_kb column and indexes for centralized RAG', 
    'ALTER TABLE documents ADD COLUMN is_admin_kb BOOLEAN NOT NULL DEFAULT FALSE; 
     CREATE INDEX idx_admin_kb ON documents (is_admin_kb) WHERE is_admin_kb = TRUE;
     CREATE INDEX idx_admin_embedding ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100) WHERE is_admin_kb = TRUE;
     CREATE INDEX idx_user_embedding ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100) WHERE is_admin_kb = FALSE;');

-- Log the migration in a more readable format
RAISE NOTICE 'Centralized RAG migration completed successfully at %', NOW(); 