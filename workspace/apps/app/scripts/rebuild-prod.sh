#!/bin/bash
# Script to rebuild production environment from scratch

echo "🚀 Rebuilding Skillstak Production Environment"
echo "================================================"
echo ""

# Step 1: Create new D1 database
echo "Step 1: Creating new D1 database..."
wrangler d1 create skillstak-db
wrangler d1 create skillstak-db-preview
wrangler kv namespace create "skillstak-db-production-sessions"
wrangler kv namespace create "skillstak-db-preview-sessions"

echo ""
echo "⚠️  IMPORTANT: Copy the database_id from above and update wrangler.toml"
echo ""
echo "The output above shows something like:"
echo '[[d1_databases]]'
echo 'binding = "DB"'
echo 'database_name = "skillstak-db"'
echo 'database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"'
echo ""
echo "Copy the database_id and update it in wrangler.toml"
echo ""
read -p "Press Enter after you've updated wrangler.toml..."

# Step 2: Apply schema to production database
echo ""
echo "Step 2: Applying schema to production database..."
wrangler d1 execute SKILLSTAK_DB --file=./db/schema.sql --remote

# Step 3: Verify tables were created
echo ""
echo "Step 3: Verifying tables..."
wrangler d1 execute SKILLSTAK_DB --command="SELECT name FROM sqlite_master WHERE type='table';" --remote

# Step 4: Rebuild and deploy
echo ""
echo "Step 4: Building and deploying..."
npm run build
wrangler pages deploy build/client --project-name=skillstak --commit-dirty=true

echo ""
echo "✅ Production environment rebuilt!"
echo ""
echo "Next steps:"
echo "1. Test signup at your deployment URL"
echo "2. Check logs with: wrangler pages deployment tail --project-name=skillstak"

