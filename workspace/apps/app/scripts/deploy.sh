export CLOUDFLARE_API_TOKEN=X5l5kbzDYqiBfDGQhLgDci_bts4FNpi244qukWSk
export CLOUDFLARE_ACCOUNT_ID=42e72c1dffd0d3a8c15bf94b1366d1a3

# Should succeed:
npx wrangler pages project list

# Should succeed (dry run)
npx wrangler pages deploy ../build/client --project-name=skillstak --branch=master
