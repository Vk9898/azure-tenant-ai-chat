#!/bin/bash
cd /Users/victork/Downloads/azure-tenant-ai-chat
# Run npm install from the root to ensure all dependencies are installed correctly
echo "Running npm install from root..."
npm install

# Now run the build command for the 'src' workspace (assuming 'src' is the package name in root package.json if using workspaces)
# Or, if 'src' isn't a workspace, just run build for the whole project
echo "Running build command..."
npm run build --workspace=src # Use this if src is defined as a workspace in root package.json
# If not using workspaces, you might need to adjust the build script in the root package.json
# or simply run 'npm run build' if the root build script handles the Next.js build inside src.
# As a fallback, just run build from root:
# npm run build