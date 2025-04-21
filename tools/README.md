# Database Debugging Tools

This directory contains tools to help diagnose and fix issues with Neon database setup and connection in the application.

## Prerequisites

Before running these tools, ensure you have:

1. Node.js installed (v16+)
2. Proper environment variables set in `.env` at the project root:
   ```
   DATABASE_URL=postgres://...
   NEON_API_KEY=your_neon_api_key
   NEON_DEFAULT_DB_NAME=neondb
   NEON_DEFAULT_DB_ROLE=neondb_owner
   ```

## Available Tools

### 1. Database Validator (`db-validator.ts`)

Checks the default database connection and validates schema setup.

**Usage:**
```bash
# Using npm script
npm run db:validate

# Or directly with ts-node
npx ts-node tools/db-validator.ts
```

**What it checks:**
- Environment variables
- Database connection
- Table existence and row counts
- Vector extension status
- Schema correction history

### 2. User Database Check (`user-db-check.ts`)

Checks a specific user's database connection by retrieving their Neon project and testing connectivity.

**Usage:**
```bash
# Using npm script
npm run db:check-user

# Or directly with ts-node
npx ts-node tools/user-db-check.ts
```

**What it checks:**
- User project existence in Neon
- Database connection string retrieval
- Connection testing
- Table existence and data validation
- Vector extension status

You'll be prompted to enter a user's email address, which will be hashed to find their project.

## Related Database Utilities

The application also includes a database initialization utility in `lib/db/init-db.ts` that can be used to initialize or reset database schemas:

```bash
# Using npm script
npm run db:init

# Or directly with ts-node
npx ts-node lib/db/init-db.ts "postgres://your-connection-string"
```

The database code is now centralized in `lib/db/`:

- `lib/db/schema.ts`: Central schema definitions
- `lib/db/neondb.ts`: Database connection and initialization functions
- `lib/db/init-db.ts`: Standalone initialization utility

## Common Issues and Solutions

### Missing Tables

If tables are missing in a user's database:

1. The schema initialization may have failed during project creation
2. Check logs for errors during the user's first login
3. Try having the user log out and log back in to trigger project creation again
4. Use the `db:init` command to manually initialize their database

### Connection Issues

If connections to the user's database fail:

1. Check if the Neon project exists and is properly configured
2. Verify the Neon API key has proper permissions
3. Ensure the database role and name match what's in your environment variables

### Vector Extension Not Installed

If the vector extension is missing:

1. Check if you're using Postgres version 15+ (required for vector support)
2. The extension may need to be manually enabled on the Neon dashboard
3. Ensure proper permissions for the database role

## Advanced Diagnostics

For more advanced issues:

1. Check the browser's localStorage for token information
2. Examine server logs during user authentication
3. Use Neon's web dashboard to directly inspect databases and tables

## Adding New Tools

To create additional diagnostic tools:

1. Add TypeScript files to this directory
2. Make them executable with `#!/usr/bin/env node` at the top
3. Import necessary database services from the application
4. Document usage in this README 