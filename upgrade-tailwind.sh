#!/bin/bash

# Remove Tailwind CSS v3 dependencies
npm uninstall tailwindcss postcss autoprefixer

# Install Tailwind CSS v4 and related packages
npm install tailwindcss@4 @tailwindcss/postcss

# Update packages dependencies
cd src
npm install tailwindcss@4 @tailwindcss/postcss

# Back to root
cd ..

# Run build to test the changes
npm run build 