#!/bin/bash

echo "===================================="
echo "Starting Next.js Frontend Server"
echo "===================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

echo "Starting Next.js on http://localhost:3000"
echo "Press Ctrl+C to stop"
echo ""

# Start the development server
npm run dev



