#!/bin/bash

# Remove Tailwind CSS v3 dependencies
npm uninstall tailwindcss postcss autoprefixer

# Install Tailwind CSS v4 and related packages
npm install tailwindcss@latest @tailwindcss/postcss @tailwindcss/vite --save-dev

# Run build to test the changes
npm run build 