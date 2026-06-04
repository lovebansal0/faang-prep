# FAANG+ Prep — Postgres Sync API

A tiny Express + PostgreSQL backend that syncs **everything** in the tracker across
devices: topic & per-problem status, notes, custom questions, custom topics, code +
design-image annotations, streak activity, done-timestamps, and theme.

The frontend (GitHub Pages) calls this API; this API stores one JSONB document per
**sync key**. Last-write-wins.

```
GitHub Pages (frontend)  →  this API (Express)  →  PostgreSQL
```

---

## 1. Get a PostgreSQL database
Any of these works — you just need a connection string:
- **Local:** `createdb faang_prep` → `postgres://postgres:PASS@localhost:5432/faang_prep`
- **Neon** (free): https://neon.tech → copy the `postgres://…?sslmode=require` string
- **Supabase / Render Postgres** (free tiers): same idea

## 2. Configure
```bash
cd server
cp .env.example .env
# edit .env:
#   DATABASE_URL=postgres://...          (required)
#   PGSSL=disable                        (ONLY for local Postgres without SSL)
#   PORT=4000
```

## 3. Run
```bash
npm install
npm start
```
On boot it auto-creates the `user_data` table (see `schema.sql`). Health check:
```bash
curl http://localhost:4000/api/health      # {"ok":true,"db":"up"}
```

## 4. Deploy the API (so your phone/other devices can reach it)
GitHub Pages can't host a server, so deploy this folder anywhere that runs Node:
- **Render / Railway / Fly.io** (free tiers): set `DATABASE_URL` as an env var, start command `npm start`.
- Note the public URL it gives you, e.g. `https://faang-sync.onrender.com`.

## 5. Connect the tracker
In the tracker: **Tools ▾ → Cloud sync (Postgres)** →
- **API URL:** your deployed URL (or `http://localhost:4000` for local testing)
- **Sync key:** any private string you choose, e.g. `love-faang-2026` — use the **same**
  key on every device.
- Click **Connect & sync**. From then on every change auto-syncs; opening the tracker on
  another device with the same key pulls your latest data.

A status dot in the menu shows: 🟢 synced · 🟡 syncing · 🔴 error.

---

## API
| Method | Route | Body | Purpose |
|--------|-------|------|---------|
| GET  | `/api/health` | — | DB health |
| GET  | `/api/data/:key` | — | Pull the full document for a sync key |
| PUT  | `/api/data/:key` | `{ "data": { ... } }` | Upsert the full document |

## Security notes
- The sync key is your only access control — **choose a long, private string** (it's not a
  password, just a namespace; anyone who knows it can read/write that data).
- For stronger protection put the API behind auth (e.g. an API token header) or a private
  network. CORS is open by default so the public Pages site can call it.
- `.env` and `node_modules/` are gitignored — never commit your real `DATABASE_URL`.
