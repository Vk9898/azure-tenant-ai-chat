# Azure Tenant AI Chat - Architecture Documentation

## Overview

This document outlines the architecture of the Azure Tenant AI Chat application, with a focus on the admin functionality that allows authorized users to access system-wide metrics, view user activities, and monitor chat histories. This admin functionality is designed to provide comprehensive oversight while maintaining appropriate access controls.

## System Architecture

![Azure Tenant AI Chat Solution Architecture](/assets/Multiuser%20AI%20Chat%20Solution%20Accelerator%20App%20View%202.png)

The solution uses a multi-tenant architecture with:

- **Neon Serverless Postgres**: Creates isolated database instances per user for chat data
- **Azure OpenAI**: Provides AI models for generating responses and embeddings
- **Azure App Service**: Hosts the Next.js application
- **Azure Key Vault**: Secures sensitive information
- **Microsoft Entra ID (Azure AD)**: Handles authentication

## Recent Updates and Improvements

### Form Typing Improvements (Chat Playground)

The Chat Playground component has been updated to address TypeScript typing issues:

1. **Form Schema Refinement**:
   - Modified the Zod schema to explicitly define required fields without defaults
   - Simplified type definitions to ensure consistency between schema and form implementation
   - Changed `model`, `temperature`, and `maxTokens` fields to use basic type definitions without constraints to match defaultValues

2. **Submit Handler Type Safety**:
   - Updated the onSubmit handler to use proper type annotations
   - Changed function signature to correctly type the form data parameter
   - Ensured type consistency throughout the form handling pipeline

3. **Component Structure**:
   - Maintained existing UI layout and functionality while fixing type issues
   - Preserved all existing form field validations and behaviors
   - Ensured backward compatibility with existing service calls

These improvements enhance the maintainability of the codebase by ensuring strong typing throughout the form implementation, reducing the potential for runtime errors, and providing better IDE support during development.

## Database Schema

The database schema includes the following key tables:

1. **chat_threads**: Stores chat conversation metadata
   - id, name, user_id, created_at, last_message_at, etc.

2. **chat_messages**: Contains individual messages within threads
   - id, thread_id, content, role, created_at, etc.

3. **documents**: Stores document content for RAG (Retrieval Augmented Generation)
   - id, page_content, chat_thread_id, embedding, etc.

4. **extensions**: Contains custom extension definitions
   - id, name, description, execution_steps, functions, headers, etc.

5. **personas**: Stores chat personas configuration
   - id, name, description, persona_message, etc.

Additional tables support citations, prompts, and other functionality.

## Admin Functionality

### Admin Dashboard

The admin dashboard provides a high-level overview of system usage and activity:

1. **Metrics Section**:
   - Total Users
   - Total Chats
   - Total Messages
   - Active Users (Last 7 Days)

2. **Top Users**: Displays most active users ranked by activity metrics
   - User info, chat count, message count, last active timestamp

3. **Recent Activity**: Shows latest system activities
   - User actions, timestamps, and related entities

### User Management

The User Management page allows admins to:

1. **View All Users**:
   - List all system users with their activity metrics
   - Sort and filter capabilities
   - Search functionality

2. **User Details**:
   - View detailed information about specific users
   - See their conversation history
   - Monitor resource usage

3. **Access Control**:
   - Manage admin privileges (future enhancement)
   - Define access policies (future enhancement)

### Reporting

The Reporting page provides admins access to:

1. **Chat Histories**:
   - View all conversations across the system
   - Filter by user, date range, or other criteria
   - Navigate through paginated results

2. **Message Details**:
   - Examine specific conversations with full message history
   - Understand context and flow of conversations

### Chat Observability and Monitoring

The Chat Observability system provides administrators with advanced tools to monitor, analyze, and improve chat interactions:

1. **Chat Playground**:
   - Test prompts with different models and parameters
   - Compare expected outputs against actual responses
   - Fine-tune system prompts and model configurations
   - Logs all playground activity for further analysis

2. **Prompt Logging System**:
   - Automatically captures all user prompts and AI responses
   - Records performance metrics (tokens, response time, success rate)
   - Stores model parameters (temperature, max tokens) for each interaction
   - Enables detailed analysis of model behavior and effectiveness

3. **Response Analysis Dashboard**:
   - Comprehensive metrics on response quality, time, and token usage
   - Breakdown of model usage across the platform
   - Success rate tracking and error monitoring
   - Daily usage trends and patterns

4. **Conversation Debugging**:
   - Detailed logs of problematic interactions
   - Access to full prompt and response history
   - Ability to replay conversations with modified parameters
   - Comparison of expected vs. actual responses

## Database Schema for Monitoring

The system uses a dedicated `prompt_logs` table in Postgres to track all AI interactions:

```sql
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
```

This table structure enables comprehensive logging of all model interactions, supporting detailed analysis and continuous improvement of the AI system.

## Authentication and Authorization

### Role-Based Access Control

Admin functionality is secured through a role-based permission system:

1. **Admin Check**:
   ```typescript
   const user = await getCurrentUser();
   if (!user.isAdmin) {
     return {
       status: "UNAUTHORIZED",
       errors: [{ message: "Admin access required" }],
     };
   }
   ```

2. **Route Protection**:
   - Admin routes are protected at the page level
   - Unauthorized users are redirected from admin pages

### Data Security

1. **Database Isolation**:
   - Each user has a dedicated database instance on Neon
   - Admin queries are restricted to appropriate scopes

2. **Secure API Endpoints**:
   - Server actions validate admin status before execution
   - Proper error handling for unauthorized requests

## Implementation Status

### Completed Components

- ✅ Admin Dashboard with system metrics
- ✅ Top users and recent activity views
- ✅ User management page with detailed metrics
- ✅ Reporting functionality for chat histories
- ✅ Authentication and authorization controls
- ✅ Chat playground with proper type safety

### In Progress

- 🔄 Enhanced user search capabilities
- 🔄 Advanced filtering options for chat histories
- 🔄 Performance optimizations for large datasets
- 🔄 Chat observability improvements

### Planned Enhancements

- 📋 Admin audit logging
- 📋 User action history tracking
- 📋 System health monitoring
- 📋 Export functionality for reports and metrics
- 📋 Admin notification system

## Technical Implementation Details

### Server-Side Components

Admin functionality is implemented using Next.js server components and server actions:

1. **Admin Service Layer**:
   - Located in `src/features/admin-dashboard/admin-services/admin-service.ts`
   - Provides data access methods for admin functionality
   - Implements proper permission checks and error handling

2. **Reporting Service Layer**:
   - Located in `src/features/reporting-page/reporting-services/reporting-service.ts`
   - Provides access to user chat histories
   - Implements pagination for efficient data delivery

### Client Components

1. **Dashboard UI**:
   - Located in `src/features/admin-dashboard/admin-dashboard.tsx`
   - Displays key metrics, top users, and recent activities
   - Uses React server components for efficient rendering

2. **Users Table**:
   - Located in `src/features/admin-dashboard/users-table.tsx`
   - Provides interactive table for viewing and sorting user data
   - Implements client-side sorting and filtering

3. **Reporting UI**:
   - Located in `src/features/reporting-page/reporting-page.tsx`
   - Allows browsing and viewing chat threads
   - Implements pagination controls

4. **Chat Observability UI**:
   - Located in `src/features/admin-dashboard/chat-observability/chat-playground.tsx`
   - Provides interactive interface for testing and comparing responses
   - Implements parameter controls for model configuration
   - Uses properly typed form implementation with Zod validation

## Deployment and Configuration

Admin functionality is automatically deployed with the main application. No additional configuration is required beyond ensuring that admin users are properly flagged in the authentication system.

## Best Practices and Recommendations

1. **Limit Admin Access**: Restrict admin privileges to essential personnel only
2. **Regular Audits**: Periodically review admin actions and access patterns
3. **Performance Monitoring**: Watch for slow queries or excessive database usage
4. **Privacy Considerations**: Ensure compliance with privacy regulations when accessing user data
5. **Type Safety**: Maintain strong typing across the codebase to prevent runtime errors

## Conclusion

The admin functionality provides powerful tools for monitoring and managing the Azure Tenant AI Chat system while maintaining appropriate security controls. The architecture ensures that authorized administrators can gain valuable insights while protecting user privacy and data integrity.

Recent improvements to form typing and validation enhance the maintainability and reliability of the admin components, particularly in the Chat Playground feature.

Future enhancements will focus on expanding reporting capabilities, improving performance for large datasets, and adding more granular access controls. 