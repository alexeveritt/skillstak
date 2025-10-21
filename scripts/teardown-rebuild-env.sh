#!/bin/zsh
# Usage: ./scripts/teardown-rebuild-env.sh [production|preview]
# Requires: wrangler CLI, jq

set -e

ENV="$1"
if [[ "$ENV" != "production" && "$ENV" != "preview" ]]; then
  echo "Usage: $0 [production|preview]"
  exit 1
fi

# Set resource names and IDs based on environment
declare DB_NAME DB_ID KV_ID
if [[ "$ENV" == "production" ]]; then
  DB_NAME="skillstak-db"
  DB_ID="PROD_DB_ID"      # <-- Replace with your actual production D1 DB ID
  KV_ID="PROD_KV_ID"      # <-- Replace with your actual production KV ID
else
  DB_NAME="skillstak-db-preview"
  DB_ID="PREVIEW_DB_ID"   # <-- Replace with your actual preview D1 DB ID
  KV_ID="PREVIEW_KV_ID"   # <-- Replace with your actual preview KV ID
fi

# Delete and recreate D1 database
echo "Deleting D1 database $DB_NAME ($DB_ID)..."
wrangler d1 delete $DB_ID --yes || true
sleep 2
echo "Creating D1 database $DB_NAME..."
NEW_DB_JSON=$(wrangler d1 create $DB_NAME)
NEW_DB_ID=$(echo $NEW_DB_JSON | jq -r '.id')
echo "New D1 database ID: $NEW_DB_ID"

# Delete and recreate KV namespace
echo "Deleting KV namespace $KV_ID..."
wrangler kv:namespace delete --namespace-id $KV_ID --force || true
sleep 2
echo "Creating KV namespace $DB_NAME-$ENV-sessions..."
NEW_KV_JSON=$(wrangler kv:namespace create "$DB_NAME-$ENV-sessions")
NEW_KV_ID=$(echo $NEW_KV_JSON | jq -r '.id')
echo "New KV namespace ID: $NEW_KV_ID"

echo "Update wrangler.toml with these new IDs for $ENV:"
echo "  D1 DB ID: $NEW_DB_ID"
echo "  KV ID:   $NEW_KV_ID"

