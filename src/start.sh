#!/bin/bash

echo "===================================="
echo "Starting FastAPI Backend Server"
echo "===================================="
echo ""

# Activate virtual environment
source venv/bin/activate

# Check if .env exists
if [ ! -f .env ]; then
    echo "[ERROR] .env file not found!"
    echo "Please create src/backend/.env with your Supabase credentials."
    echo ""
    echo "Example:"
    echo "SUPABASE_URL=https://xxxxx.supabase.co"
    echo "SUPABASE_KEY=your_key_here"
    echo ""
    exit 1
fi

# Install dependencies if needed
echo "Checking dependencies..."
pip install -r requirements.txt --quiet

echo ""
echo "Starting server on http://localhost:8000"
echo "Press Ctrl+C to stop"
echo ""

# Start the server
python main.py




