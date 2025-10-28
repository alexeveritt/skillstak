# SkillsTak Monorepo

This is a Turborepo monorepo containing the SkillsTak application and marketing website.

## Structure

```
skillstak/
├── turbo.json              # Turborepo configuration
├── package.json            # Root workspace configuration
└── workspace/
    ├── apps/
    │   ├── app/            # Main SkillsTak app (app.skillstak.com)
    │   └── marketing/      # Marketing website (www.skillstak.com)
    └── packages/           # Shared packages (future)
```

## Applications

### App (`workspace/apps/app`)
- **Production URL**: https://app.skillstak.com
- **Local URL**: http://localhost:3001
- Main flashcard learning application
- Deploys to Cloudflare Pages as `skillstak-app`

### Marketing (`workspace/apps/marketing`)
- **Production URL**: https://www.skillstak.com
- **Local URL**: http://localhost:3000
- Marketing and landing page
- Deploys to Cloudflare Pages as `skillstak-marketing`

## Getting Started

### Install Dependencies
```bash
npm install
```

### Development

Run all apps in development mode:
```bash
npm run dev
```

Run specific app:
```bash
cd workspace/apps/app && npm run dev
# or
cd workspace/apps/marketing && npm run dev
```

### Building

Build all apps:
```bash
npm run build
```

Build specific app:
```bash
turbo run build --filter=@skillstak/app
turbo run build --filter=@skillstak/marketing
```

## Deployment

Each app has its own `wrangler.toml` and deploys independently to Cloudflare Pages.

### Deploy App
```bash
cd workspace/apps/app
wrangler pages deploy
```

### Deploy Marketing
```bash
cd workspace/apps/marketing
wrangler pages deploy
```

## Environment Variables

Both apps know about each other through environment variables:

### App Environment
- `APP_BASE_URL`: URL of the app (localhost:3001 or app.skillstak.com)
- `MARKETING_URL`: URL of marketing site (localhost:3000 or www.skillstak.com)

### Marketing Environment
- `APP_URL`: URL of the app (localhost:3001 or app.skillstak.com)
- `MARKETING_URL`: URL of marketing site (localhost:3000 or www.skillstak.com)

These are configured in each app's `wrangler.toml` file.

