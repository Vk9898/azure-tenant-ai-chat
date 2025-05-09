CREATE EXTENSION IF NOT EXISTS vector;

-- Track user prompts and AI responses for monitoring, analytics, and improvement
CREATE TABLE prompt_logs (
    id SERIAL PRIMARY KEY,
    user_id TEXT,                           -- User who sent the prompt
    thread_id TEXT,                         -- Associated chat thread
    model_name TEXT NOT NULL,               -- Model used (gpt-4o, gpt-35-turbo, etc)
    prompt TEXT NOT NULL,                   -- User's prompt/question
    expected_response TEXT,                 -- Expected response if provided (for testing)
    actual_response TEXT NOT NULL,          -- AI's actual response
    temperature FLOAT,                      -- Temperature setting used
    max_tokens INTEGER,                     -- Max tokens setting
    tokens_used INTEGER,                    -- Total tokens used
    response_time_ms INTEGER,               -- Response time in milliseconds
    success BOOLEAN NOT NULL DEFAULT TRUE,  -- Whether the request was successful
    error_message TEXT,                     -- Error message if any
    created_at TIMESTAMP NOT NULL DEFAULT NOW(), -- When the prompt was logged
    metadata JSONB                          -- Additional metadata as needed
);

CREATE TABLE chat_threads (
    id TEXT PRIMARY KEY, -- String-based ID
    name TEXT NOT NULL, -- Name of the chat thread
    use_name TEXT NULL, -- Optional display name
    user_id TEXT NOT NULL, -- String-based user ID
    created_at TIMESTAMP NOT NULL DEFAULT NOW(), -- Timestamp for creation
    last_message_at TIMESTAMP NOT NULL DEFAULT NOW(), -- Timestamp for last message
    bookmarked BOOLEAN NOT NULL DEFAULT FALSE, -- Bookmark status
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE, -- Deletion status
    type TEXT NOT NULL, -- Type of the chat thread
    persona_message TEXT, -- Associated persona message
    persona_message_title TEXT, -- Title of the persona message
    extension TEXT[] DEFAULT '{}' -- Array of extension names
);

CREATE TABLE chat_citations (
    id TEXT PRIMARY KEY,               -- String-based unique identifier for the citation
    content TEXT NOT NULL,             -- Citation content
    type TEXT NOT NULL,                -- Type of the citation
    user_id TEXT NOT NULL,             -- User ID associated with the citation
    created_at TIMESTAMP NOT NULL DEFAULT NOW() -- Timestamp for when the citation was created
);

CREATE TABLE personas (
    id CHAR(64) PRIMARY KEY,           -- String-based ID (64-character hexadecimal)
    name TEXT NOT NULL,                -- Name of the persona
    description TEXT NOT NULL,         -- Description of the persona
    persona_message TEXT NOT NULL,     -- The message associated with the persona
    is_published BOOLEAN NOT NULL DEFAULT FALSE, -- Whether the persona is published
    user_id CHAR(64) NOT NULL,         -- String-based user ID
    created_at TIMESTAMP NOT NULL DEFAULT NOW(), -- Timestamp of creation
    type TEXT NOT NULL                 -- Type of the persona
);

CREATE TABLE extensions (
    id TEXT PRIMARY KEY, -- String-based ID
    name TEXT NOT NULL,
    execution_steps TEXT NOT NULL,
    description TEXT NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    user_id TEXT NOT NULL, -- String-based user ID
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    type TEXT NOT NULL,
    functions JSONB DEFAULT '[]'::JSONB,
    headers JSONB DEFAULT '[]'::JSONB
);

CREATE TABLE documents (
    id TEXT PRIMARY KEY, -- String-based ID
    metadata TEXT,
    page_content TEXT NOT NULL,
    chat_thread_id TEXT NOT NULL, -- String-based chat thread ID
    embedding VECTOR(1536), -- Embeddings column
    user_id TEXT NOT NULL, -- String-based user ID
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_admin_kb BOOLEAN NOT NULL DEFAULT FALSE -- Flag for admin knowledge base documents
);

-- Create an index to optimize queries for admin knowledge base documents
CREATE INDEX idx_admin_kb ON documents (is_admin_kb) WHERE is_admin_kb = TRUE;
-- Create an index to optimize embedding similarity search for admin KB documents
CREATE INDEX idx_admin_embedding ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100) WHERE is_admin_kb = TRUE;
-- Create an index to optimize embedding similarity search for user documents
CREATE INDEX idx_user_embedding ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100) WHERE is_admin_kb = FALSE;

CREATE TABLE chat_messages (
    id CHAR(64) PRIMARY KEY,           -- String-based ID (64-character hexadecimal)
    created_at TIMESTAMP NOT NULL DEFAULT NOW(), -- Timestamp of message creation
    type TEXT NOT NULL,                -- Type of the message
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE, -- Soft delete flag
    content TEXT NOT NULL,             -- Message content
    name TEXT,                         -- Name associated with the message
    role TEXT,                         -- Role of the sender (e.g., "user", "assistant")
    thread_id CHAR(64) NOT NULL,       -- Associated chat thread ID
    user_id CHAR(64),                  -- User ID of the message sender
    multi_modal_image TEXT             -- Path or URL to any associated image (optional)
);

CREATE TABLE chat_documents (
    id CHAR(64) PRIMARY KEY,          -- String-based ID (64-character hexadecimal)
    chat_thread_id CHAR(64) NOT NULL, -- String-based chat thread ID
    user_id CHAR(64) NOT NULL,        -- String-based user ID
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    type TEXT NOT NULL,               -- Type of the document
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE, -- Soft delete flag
    name TEXT NOT NULL                -- Name of the document
);

CREATE TABLE prompts (
    id TEXT PRIMARY KEY, -- String-based ID
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    user_id TEXT NOT NULL, -- String-based user ID
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    type TEXT NOT NULL,
    embedding VECTOR(1536) -- Optional, for prompt embeddings
);
