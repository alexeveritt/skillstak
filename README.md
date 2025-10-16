# 🧠 Spaced — Lightweight Spaced Repetition App

A minimalist, mobile-friendly **spaced repetition** app built with  
**React Router 7 Framework**, **Cloudflare D1**, and **Cloudflare KV**.

Users can:
- Create an account (email/password, optional Google OAuth)
- Create **projects** (study topics)
- Add **flashcards** with two sides (front/back + optional color)
- Practice cards using spaced repetition (SM-2-lite scheduling)
- Self-mark answers or type them for auto-checking
- Track simple usage stats (cards due, total, etc.)

Runs entirely on **Cloudflare Pages + Functions** — globally distributed, fast, and nearly free to host.

---

## 🌍 Tech Stack Overview

| Layer | Technology | Notes |
|-------|-------------|-------|
| Frontend | React Router 7 Framework | SSR via Cloudflare Pages Functions |
| Styling | Tailwind CSS | Small CSS flip animation for cards |
| Auth | Lightweight email/password (scrypt hash) + optional Google OAuth | Sessions in Cloudflare KV |
| Database | Cloudflare D1 (SQLite) | Stores users, projects, cards, scheduling |
| Cache / Sessions | Cloudflare KV | Fast key-value access for session tokens, reset links |
| Hosting | Cloudflare Pages | Free tier suitable for personal/student use |
| Email (reset) | SMTP or logging | Configurable via env vars |

---

## 🧩 Features

- Create, edit, and delete cards
- Custom card color & animated flip
- Two practice modes:
  - *Self-mark*: “Again” / “Good”
  - *Type-answer*: fuzzy match using Levenshtein distance
- SM-2-lite scheduling algorithm
- Works on mobile and desktop
- Optional AdSense footer for minimal monetization
- Password reset via email token (stored in KV)

---

## 🧱 Project Structure

```
spaced-rep/
├─ app/
│  ├─ routes/                # React Router 7 pages
│  ├─ server/                # Cloudflare environment helpers
│  ├─ components/            # UI components
│  ├─ lib/                   # shared utilities
│  ├─ entry.client.tsx       # client entrypoint
│  ├─ entry.server.tsx       # server entrypoint
│  └─ root.tsx               # main layout
├─ db/schema.sql             # D1 schema
├─ functions/[[path]].ts     # Cloudflare Pages Functions adapter
├─ public/                   # favicon, robots.txt
├─ wrangler.toml             # Cloudflare config (bindings)
├─ tailwind.config.cjs
├─ postcss.config.cjs
├─ vite.config.ts
├─ tsconfig.json
└─ package.json
```

---

## ⚙️ Local Development Setup

### 1. Prerequisites

- **Node.js 18+**
- **npm** or **pnpm**
- **Cloudflare Wrangler CLI**
  ```bash
  npm install -g wrangler
  ```

### 2. Clone & install

```bash
git clone https://github.com/youruser/spaced-rep.git
cd spaced-rep
npm install
```

### 3. Environment file

Copy `.env.example` to `.env` (optional for local dev):

```bash
cp .env.example .env
```

Example contents:
```env
ADSENSE_CLIENT=
APP_BASE_URL=http://localhost:5173
```

### 4. Create Cloudflare resources locally (optional for local dev)

You can test with the local D1 database and KV emulation.

```bash
wrangler d1 create spaced-rep-db
wrangler kv namespace create SESSIONS
```

Paste the generated IDs into `wrangler.toml`.

### 5. Apply schema

```bash
npm run d1:apply
```

This runs the SQL in `db/schema.sql` against your D1 database.

### 6. Start development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

You can sign up, log in, create projects, add cards, and test review flows — all stored in the D1 local emulator.

---

## 🧰 Scripts

| Script | Description |
|--------|--------------|
| `npm run dev` | Start local SSR dev server |
| `npm run build` | Build production bundle |
| `npm run start` | Serve built app locally |
| `npm run cf:pages` | Run via `wrangler pages dev` for Pages emulation |
| `npm run d1:apply` | Apply schema to Cloudflare D1 DB |

---

## ☁️ Cloudflare Configuration

### 1. Create Cloudflare project

In the [Cloudflare Dashboard](https://dash.cloudflare.com):
- Go to **Workers & Pages → Pages → Create a project**
- Choose **Connect to Git** (GitHub or GitLab)
- Select your repo

### 2. Configure build

**Build command:**
```bash
npm run build
```

**Build output directory:**
```
.react-router/build/client
```

### 3. Add environment bindings

In Pages → *Settings → Environment Variables*:

#### D1 binding
```
Binding name: SPACED_DB
Database: spaced-rep-db
```

#### KV binding
```
Binding name: SESSIONS
Namespace: spaced-rep-sessions
```

#### Optional vars
| Variable | Example | Description |
|-----------|----------|-------------|
| ADSENSE_CLIENT | ca-pub-xxxxxxxxxxxxxx | Enables AdSense footer |
| APP_BASE_URL | https://spaced.yourdomain.com | Used for reset email links |
| SMTP_HOST | smtp.yourhost.com | Optional mail relay |
| SMTP_PORT | 587 | — |
| SMTP_USER | user@domain.com | — |
| SMTP_PASS | secret | — |
| SMTP_FROM | no-reply@domain.com | — |
| GOOGLE_CLIENT_ID | — | Optional Google OAuth |
| GOOGLE_CLIENT_SECRET | — | — |
| GOOGLE_REDIRECT_URI | — | — |

---

## 🔐 Authentication

- **Email/password** stored securely using scrypt hashing (via `oslo/password`).
- Sessions are stored in Cloudflare KV (`SESSIONS`).
- Session cookie: `sr.sid`
- Password reset:
  - A token is generated and saved in KV for 30 minutes.
  - Link is emailed (or logged if SMTP not configured).

You can later add Google OAuth via Lucia or custom Workers integration.

---

## 🧮 Spaced Repetition Algorithm (SM-2-Lite)

Each card has:
- `interval_days`
- `ease`
- `streak`
- `lapses`
- `due_at`

When you mark a card:
| Action | Effect |
|---------|---------|
| **Again** | Resets streak, lowers ease, due in ~10 min |
| **Good** | Increases streak, increases ease, schedules days ahead |
| **Type** | Auto-checks typed answer (fuzzy match) then applies same logic |

---

## 💻 Deploy to Cloudflare Pages

Once your repo is connected and bindings are set:

1. Push to `main`
2. Cloudflare Pages automatically builds and deploys
3. You’ll get a live URL like `https://spaced-rep.pages.dev`

---

## 🌐 Custom Domain

In Cloudflare Pages → **Settings → Custom domains**:
- Click “Add custom domain”
- Enter your domain (e.g. `study.yourdomain.com`)
- Cloudflare will create the required DNS record automatically
- Enable **Enforce HTTPS**

---

## 🧪 Testing locally with Wrangler

To test your app in Cloudflare’s Pages runtime:

```bash
npm run cf:pages
```

This launches a local worker emulating Cloudflare Pages with D1 + KV bindings.

You can also manually trigger Pages builds via:
```bash
wrangler pages deploy .react-router/build/client
```

---

## 🪣 Optional — Export / Backup

- The D1 DB is SQLite under the hood.  
  To backup:
  ```bash
  wrangler d1 export spaced-rep-db --local --output backup.sql
  ```
- You can later upload to R2 or download locally.

---

## 💸 Cost

- Cloudflare Pages — **Free**
- Cloudflare D1 — Free tier includes 5M reads/month
- Cloudflare KV — Free tier generous for small projects
- Email (if used) — Free SMTP via your domain host or Resend free tier
- AdSense — Optional revenue for cost offset

Expected total: **$0/month for small personal use**.

---

## 🧑‍🎓 Tips for Students / Teens

- Keep each “project” small (e.g. one subject per project)
- Use colors to group by difficulty or topic
- You can flip between self-mark and type-answer practice
- Review daily — the app always shows what’s due first

---

## 📈 Roadmap

- [ ] Add Google OAuth via Lucia
- [ ] Optional image/audio attachments (R2)
- [ ] CSV import/export
- [ ] Streak tracking and stats dashboard
- [ ] Dark mode

---

## 🪪 License

MIT — free to use, modify, and deploy.  
Copyright © 2025.

---

## 🧠 Summary

| Command | Purpose |
|----------|----------|
| `npm run dev` | Local dev server |
| `npm run d1:apply` | Initialize database schema |
| `npm run build` | Production build |
| `npm run cf:pages` | Cloudflare Pages local test |
| `wrangler d1 create spaced-rep-db` | Create database |
| `wrangler kv namespace create SESSIONS` | Create KV |
| `wrangler pages deploy` | Deploy manually |

---

### 💬 Need a Quick Check?

To verify your Cloudflare Pages deployment:
- Visit your project dashboard → “Preview Deployment”
- Open the link → you should see the login screen
- Create an account, add a project, add a card
- If that works, **your app is live and functional** ✅
