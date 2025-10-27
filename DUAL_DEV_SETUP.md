# Dual Development Environment Setup

This project now supports **two development modes** to solve the Cloudflare/Wrangler compatibility issues:

## 🎯 Overview

Previously, you had to compile Wrangler code for every test, which was slow and difficult for debugging. Now you can:

1. **Node.js Dev Mode** - Fast development with hot reload and debugging capabilities
2. **Cloudflare/Wrangler Mode** - Production-like testing with actual Cloudflare bindings

## 🏗️ Architecture

### Adapter Layer (`app/server/adapter.ts`)

The adapter automatically detects the runtime environment and provides the correct bindings:

- **Node.js Mode**: Uses `better-sqlite3` for D1 database and in-memory KV store
- **Cloudflare Mode**: Uses actual Cloudflare D1 and KV bindings

All your route code calls `getEnvFromContext(context)` which returns the appropriate environment bindings regardless of which mode you're running.

### How It Works

```typescript
// In your routes/loaders/actions:
import { getEnvFromContext } from "~/server/db";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const env = getEnvFromContext(context); // Works in both modes!
  const projects = await projectService.listProjects(env, userId);
  return { projects };
}
```

## 🚀 Available Scripts

### Development

```bash
# Node.js dev mode (recommended for daily development)
npm run dev
# - Fast hot reload
# - Full debugging support
# - Uses local SQLite database at .wrangler/state/v3/d1/
# - Runs on http://localhost:5173

# Cloudflare mode (for testing production-like behavior)
npm run dev:wrangler
# - Tests actual Wrangler behavior
# - Uses Cloudflare D1 local mode
# - Runs on http://localhost:8788
```

### Building

```bash
# Build for Node.js (development)
npm run build

# Build for Cloudflare (production)
npm run build:cf
```

### Testing with Playwright

```bash
# Test against Node.js dev server
npm run test:e2e:node
# or just:
npm run test:e2e

# Test against Cloudflare/Wrangler dev server
npm run test:e2e:cf

# Other test commands
npm run test:e2e:ui        # Interactive UI mode
npm run test:e2e:headed    # See the browser
npm run test:e2e:debug     # Debug mode
```

## 📁 Database Location

Both modes use the same local database location for consistency:

```
.wrangler/state/v3/d1/miniflare-D1DatabaseObject/local.sqlite
```

### Database Management

```bash
# Apply schema to local database
npm run d1:apply:local

# Reset local database (delete and recreate)
npm run d1:reset-local

# Export local database
npm run d1:export-local

# Production database commands
npm run d1:apply-prod      # Apply schema to production
npm run d1:export-prod     # Export production database
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file (optional) for local development:

```bash
APP_BASE_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
# ... other vars
```

### Vite Configuration

The `vite.config.ts` automatically switches SSR target based on `CLOUDFLARE_MODE` env var:

- **Node mode**: `ssr.target = "node"`
- **Cloudflare mode**: `ssr.target = "webworker"`

### Playwright Configuration

The `playwright.config.ts` automatically configures the correct base URL and dev server based on `TEST_ENV`:

- `TEST_ENV=node` → http://localhost:5173
- `TEST_ENV=cloudflare` → http://localhost:8788

## 🎨 Typical Development Workflow

### Daily Development (Fast Iteration)

```bash
# Terminal 1: Start Node.js dev server
npm run dev

# Terminal 2 (optional): Run tests
npm run test:e2e:node

# Your browser: http://localhost:5173
```

**Advantages:**
- ⚡ Instant hot reload
- 🐛 Full debugger support
- 🏃 Fast iteration cycles
- 📝 Better error messages

### Testing Cloudflare Compatibility

```bash
# Terminal 1: Build and start Wrangler dev server
npm run dev:wrangler

# Terminal 2: Run tests against Wrangler
npm run test:e2e:cf

# Your browser: http://localhost:8788
```

**Use this when:**
- 🚀 Preparing for deployment
- 🔍 Testing Cloudflare-specific features
- ✅ Final verification before production

## 🔥 What Changed?

### New Files
- `app/server/adapter.ts` - Runtime adapter for Node.js ↔ Cloudflare
- `DUAL_DEV_SETUP.md` - This documentation

### Modified Files
All route files now use `getEnvFromContext(context)` instead of `context.cloudflare.env`:
- `app/routes/_index.tsx`
- `app/routes/login.tsx`
- `app/routes/signup.tsx`
- `app/routes/p.$projectId.*.tsx`
- `app/routes/reset.*.tsx`
- ... and all other routes

### Updated Configs
- `vite.config.ts` - Dual SSR target support
- `playwright.config.ts` - Multi-environment testing
- `package.json` - New scripts for both modes

### Session & Database
- `app/server/session.ts` - Uses adapter
- `app/server/db.ts` - Exports `getEnvFromContext` helper

## ⚠️ Important Notes

### Cloudflare Code is NOT Broken

The adapter ensures **100% compatibility** with Cloudflare Workers:

- In production (Cloudflare Workers), `context.cloudflare.env` exists → uses real bindings
- In development (Node.js), `context.cloudflare.env` is undefined → uses local mocks
- Same code works in both environments!

### Local Database Consistency

Both modes use the same SQLite database file, so you can switch between them seamlessly without losing data.

### Session Storage

Sessions in Node.js mode use an in-memory KV store, so they'll reset when you restart the server. This is fine for development. In production, Cloudflare KV persists sessions.

## 🐛 Debugging Tips

### Node.js Mode Debugging

You can use your IDE's debugger or Chrome DevTools:

```bash
# Add breakpoints in your IDE
npm run dev
# Then attach debugger to the process
```

### View Database Contents

```bash
# Open the local database with SQLite
sqlite3 .wrangler/state/v3/d1/miniflare-D1DatabaseObject/local.sqlite

# Run queries
sqlite> SELECT * FROM user;
sqlite> SELECT * FROM project;
```

### Check Which Mode You're Running

Look at the terminal output:
- Node.js mode: `VITE` messages, port 5173
- Wrangler mode: `wrangler pages dev` messages, port 8788

## 📦 Dependencies

### New Dependencies
- `better-sqlite3` - Node.js SQLite driver for local D1 emulation
- `@types/better-sqlite3` - TypeScript types

All existing Cloudflare dependencies remain unchanged.

## 🚢 Deployment

Deployment to Cloudflare Pages is **unchanged**:

```bash
# Build for production (automatically uses Cloudflare mode)
npm run build:cf

# Deploy (your existing process)
wrangler pages deploy
```

The production build uses `CLOUDFLARE_MODE=true` which ensures the correct SSR target.

## ✅ Benefits

1. **Faster Development** - No more waiting for Wrangler builds
2. **Better Debugging** - Full Node.js debugging capabilities
3. **Flexible Testing** - Test against both environments
4. **No Breaking Changes** - Cloudflare code works exactly as before
5. **Same Database** - Switch modes without data loss

## 🤝 Contributing

When adding new routes:

```typescript
// ✅ DO THIS:
import { getEnvFromContext } from "~/server/db";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const env = getEnvFromContext(context);
  // Use env...
}

// ❌ DON'T DO THIS:
export async function loader({ context, request }: LoaderFunctionArgs) {
  const env = context.cloudflare.env; // Only works in Cloudflare!
  // Use env...
}
```

## 📚 Additional Resources

- [React Router Docs](https://reactrouter.com/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Playwright Docs](https://playwright.dev/)
- [Better SQLite3 Docs](https://github.com/WiseLibs/better-sqlite3)

