#!/bin/bash
# Script to generate complete SQL file for all 486 works
# This script runs the Node.js generator

echo "Generating complete SQL for all 486 works from Yandex Disk..."
echo "Source: https://disk.yandex.ru/d/usjmeUqnkY9IfQ"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js to run this script"
    echo ""
    echo "Alternative: Open generate_complete_sql.html in your browser"
    exit 1
fi

# Run the Node.js generator
node generate_all_sql.js

echo ""
echo "SQL generation complete!"
echo "Output file: db_migrations_draft/insert_all_486_works.sql"
echo ""
echo "To use the SQL file:"
echo "  1. Review the generated SQL"
echo "  2. Execute: mysql -u user -p database < db_migrations_draft/insert_all_486_works.sql"
echo "  3. Or source it from MySQL: source db_migrations_draft/insert_all_486_works.sql;"
