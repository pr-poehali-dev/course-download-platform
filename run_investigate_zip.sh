#!/bin/bash
# Script to run the ZIP investigation with proper environment setup

echo "ZIP File Investigation Script"
echo "=============================="
echo ""

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL is not set"
    echo "Please set it with: export DATABASE_URL='your_database_url'"
    exit 1
fi

if [ -z "$YANDEX_S3_KEY_ID" ]; then
    echo "ERROR: YANDEX_S3_KEY_ID is not set"
    echo "Please set it with: export YANDEX_S3_KEY_ID='your_key_id'"
    exit 1
fi

if [ -z "$YANDEX_S3_SECRET_KEY" ]; then
    echo "ERROR: YANDEX_S3_SECRET_KEY is not set"
    echo "Please set it with: export YANDEX_S3_SECRET_KEY='your_secret_key'"
    exit 1
fi

echo "Environment variables verified."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "Installing requirements..."
pip install -q -r investigate_zip_requirements.txt

# Run the script
echo ""
echo "Running investigation..."
echo ""
python investigate_zip.py

# Deactivate virtual environment
deactivate
