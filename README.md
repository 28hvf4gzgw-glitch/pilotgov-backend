# PilotGov — Backend

**Smart India Hackathon 2026 · Problem Statement SIH26136**
Startup-friendly public procurement — turning a government "need" into a real, scaled contract through a transparent Identify → Discover → Pilot → Scale pipeline.

Live API: [`pilotgov-backend-production.up.railway.app`](https://pilotgov-backend-production.up.railway.app)
Frontend: [`pilotgov-frontend.vercel.app`](https://pilotgov-frontend.vercel.app)

---

## What this is

Government departments today post procurement needs into a black box — startups rarely know why they were or weren't matched, and pilots that work often never turn into real contracts. PilotGov's backend is the engine behind a pipeline that makes each of those steps a real, queryable record instead of a spreadsheet:

1. **Identify** — a department posts a need (title, budget, domain, description)
2. **Discover** — startups are matched against that need with an explainable score, not a black box
3. **Pilot** — the pilot is tracked on a kanban board (`Applied → Piloting → Scaling → Completed`)
4. **Scale** — when a pilot completes, it automatically becomes a real `ScaledContract` record — not just a UI state

Everything above is backed by an actual Postgres database via Prisma, not mock data.

## Tech stack

- **Framework:** NestJS 12
- **ORM / DB:** Prisma 6 → PostgreSQL
- **Language:** TypeScript
- **PDF generation:** PDFKit
- **Hosting:** Railway

## Architecture

```
src/
├── identify/     # POST/GET a department's need           → Need table
├── procure/      # startup directory + match scoring       → seed data + Need lookups
├── pilot/        # kanban tracker for an active pilot       → PilotCard table
├── scale/        # scaled contracts + PDF export            → ScaledContract table
├── impact/       # aggregate stats for the public dashboard → reads across all tables
├── report/       # outcomes & metrics for the Full Report   → live pipeline aggregation
└── prisma/       # PrismaService, shared across every module
```

Each pipeline stage is its own Nest module (controller + service), all sharing one `PrismaService`. `scale` is the only module that *writes* a new table from another module's data — a completed `PilotCard` graduates into a real `ScaledContract`.

## Database schema

```prisma
model Need {
  id, dept, title, description, budget, domain, postedAt, status  // Open | Matching | Closed
}

model PilotCard {
  id, startup, dept, title, budget, progress, date, status, accent, createdAt, updatedAt
  // status: Applied -> Piloting -> Scaling -> Completed
}

model ScaledContract {
  id, startup, dept, title, pilotBudget, scaledBudget, pilotStartDate, contractDate
}
```

## API reference

| Method | Route | Description |
|---|---|---|
| `GET` | `/identify/needs` | List all posted needs |
| `GET` | `/identify/needs/:id` | Get one need |
| `POST` | `/identify/needs` | Post a new need |
| `GET` | `/procure/startups` | List/search startups (`?query=`, `?domain=`) |
| `GET` | `/procure/startups?needId=` | Startups ranked & scored against a specific need, with a `matchReason` breakdown |
| `GET` | `/procure/startups/:id` | Get one startup |
| `GET` | `/pilot/cards` | List pilot kanban cards |
| `GET` | `/scale/contracts` | List every scaled contract |
| `GET` | `/scale/summary` | Total scaled count + list, for dashboard widgets |
| `GET` | `/scale/contracts/:id/pdf` | Download a contract as a PDF |
| `GET` | `/impact/summary` | Aggregate stats for the public Impact Dashboard: needs posted, active pilots, contracts scaled, total scaled ₹ value, needs-per-domain, and the full pipeline funnel |
| `GET` | `/report/outcomes` | Live aggregated metrics for the Full Report page: total needs, pilots in progress, scaled contracts, and pilot-to-contract success rate |

### How match scoring works

`GET /procure/startups?needId=<id>` doesn't just return a static seed score — it recomputes a transparent, explainable match out of 100 for every startup against that specific need:

- **+50** exact domain match
- **+10 per matching tag** (capped at +30) found in the need's title/description
- **+10** if a startup has past pilot experience with a department whose name overlaps the need's department
- Plus a `matchReason` string on each result breaking down exactly how the score was built, so the answer to "how did you get this number" is always a straight line back to the code.

## Local setup

```bash
git clone <this-repo>
cd backend
npm install

# Set your local Postgres connection string
cp .env.example .env    # then edit DATABASE_URL

npx prisma migrate dev  # apply schema
npx prisma generate     # generate the Prisma client

npm run start:dev       # http://localhost:3000
```

## Scripts

| Command | What it does |
|---|---|
| `npm run start:dev` | Dev server with hot reload |
| `npm run build` | `prisma generate` + Nest production build |
| `npm run start:prod` | Runs pending migrations, then starts the built server |
| `npm run test` / `test:e2e` | Unit / end-to-end tests |
| `npm run lint` | Lint with oxlint |

## Deployment

Deployed on **Railway**, connected to this GitHub repo — every push to `main` triggers an automatic rebuild and redeploy. `npm run start:prod` runs `prisma migrate deploy` before booting, so schema changes committed to `prisma/migrations/` apply automatically in production.

---

Built for SIH26136 · see the frontend repo for the client app and screenshots.