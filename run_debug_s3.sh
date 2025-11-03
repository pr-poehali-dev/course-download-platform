#!/bin/bash

# This script runs the S3 debug Python script
# Make sure you have set the environment variables:
# - DATABASE_URL
# - YANDEX_S3_KEY_ID
# - YANDEX_S3_SECRET_KEY

echo "Checking for required environment variables..."

if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL is not set"
    exit 1
fi

if [ -z "$YANDEX_S3_KEY_ID" ]; then
    echo "ERROR: YANDEX_S3_KEY_ID is not set"
    exit 1
fi

if [ -z "$YANDEX_S3_SECRET_KEY" ]; then
    echo "ERROR: YANDEX_S3_SECRET_KEY is not set"
    exit 1
fi

echo "All environment variables are set."
echo ""
echo "Installing Python dependencies..."
pip3 install -q boto3 psycopg2-binary

echo ""
echo "Running S3 debug script..."
echo ""

# Run with output to both console and file
python3 debug_s3.py | tee debug_output.txt

echo ""
echo "Output saved to debug_output.txt"
echo ""
echo "You can analyze the results with:"
echo "  python3 analyze_results.py"