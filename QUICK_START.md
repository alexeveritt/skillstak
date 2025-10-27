# Quick Start Guide - Dual Development Environment

## 🚀 Getting Started

### First Time Setup

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Initialize local database**:
   ```bash
   npm run d1:apply:local
   ```

3. **Start developing**:
   ```bash
   npm run dev
   ```

   Your app is now running at http://localhost:5173 🎉

## 💡 What Just Happened?

You're now running in **Node.js dev mode** which means:
- ✅ Fast hot reload
- ✅ Full debugging support
- ✅ Local SQLite database (no network calls)
- ✅ In-memory session storage

## 🔄 Switching Modes

### Want to test Cloudflare compatibility?

**Stop the dev server** (Ctrl+C) and run:
```bash
npm run dev:wrangler
```

Now visit http://localhost:8788

This runs your code exactly as it will in production!

## 🧪 Running Tests

### Test against Node.js dev server:
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run test:e2e:node
```

### Test against Cloudflare/Wrangler:
```bash
# Terminal 1
npm run dev:wrangler

# Terminal 2
npm run test:e2e:cf
```

## 🎯 Daily Workflow

**Recommended: Use Node.js mode for 90% of your work**

```bash
# Start your day
npm run dev

# Make changes, see them instantly
# Debug with breakpoints in your IDE
# Iterate quickly

# Before committing/deploying, test Cloudflare mode:
npm run dev:wrangler
npm run test:e2e:cf
```

## 📊 Understanding the Adapter

The magic happens in `app/server/adapter.ts`:

```typescript
// You write this ONCE in your routes:
const env = getEnvFromContext(context);

// The adapter automatically provides:
// - In Node.js: Local SQLite + in-memory KV
// - In Cloudflare: Real D1 + real KV
```

**You don't need to change your code when switching modes!**

## 🐛 Troubleshooting

### Database not found?
```bash
npm run d1:reset-local
```

### Ports already in use?
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Kill process on port 8788
lsof -ti:8788 | xargs kill -9
```

### Want to see what's in the database?
```bash
sqlite3 .wrangler/state/v3/d1/miniflare-D1DatabaseObject/local.sqlite
sqlite> .tables
sqlite> SELECT * FROM project;
```

## 📝 Common Tasks

### Add a new route that needs database access:
```typescript
// app/routes/my-new-route.tsx
import { getEnvFromContext } from "~/server/db";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const env = getEnvFromContext(context);
  // Use env.SKILLSTAK_DB, env.SKILLSTAK_SESSIONS, etc.
}
```

### Reset everything and start fresh:
```bash
npm run d1:delete-local
npm run d1:apply:local
```

## 🚢 Deploying to Production

Nothing changes! Your existing deployment process works as-is:

```bash
npm run build:cf
wrangler pages deploy
```

The adapter detects production automatically and uses real Cloudflare bindings.

## ✨ Key Benefits

| Feature | Node.js Mode | Wrangler Mode |
|---------|-------------|---------------|
| Hot Reload | ⚡ Instant | 🐌 Slow (rebuild) |
| Debugging | ✅ Full support | ❌ Limited |
| Speed | 🚀 Very fast | 🐢 Slower |
| Accuracy | ~95% | 💯 100% |
| Use Case | Daily dev | Pre-deploy testing |

## 🎓 Learn More

See `DUAL_DEV_SETUP.md` for comprehensive documentation.

## ❓ FAQ

**Q: Do I need to run migrations twice (once for each mode)?**
A: No! Both modes use the same database file.

**Q: Will my sessions persist between restarts?**
A: In Wrangler mode, yes (uses Cloudflare KV). In Node mode, no (in-memory).

**Q: Can I use both modes in different terminals?**
A: Not simultaneously (port conflicts). Stop one before starting the other.

**Q: Is this safe for production?**
A: Yes! In production, the adapter detects Cloudflare and uses real bindings. The local mocks are only for development.

**Q: What if I find a bug that only happens in one mode?**
A: That's exactly what this setup is for! Test in both modes to catch compatibility issues early.

