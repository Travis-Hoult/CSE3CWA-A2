# CSE3CWA / CSE5006 – Assignment 2

## Project Overview
This project is a **full-stack web application** built with **Next.js (App Router + TypeScript)**.  
It extends the work from Assignment 1 and implements an **interactive courtroom-style simulation game**.

The application demonstrates:
- Timed gameplay with dynamic alerts and coding tasks
- CRUD operations via API routes and a database
- Optional AWS Lambda integration for generating gameplay scenarios
- A Dockerised production deployment
- **Automated API tests (Jest + Supertest) that validate health and database CRUD**

The project meets the Assignment 2 “Courtroom” option requirements and provides both server- and client-side components that interact through a local SQLite database.

---

## Tech Stack
- **Next.js 15** (React + TypeScript, App Router)
- **Sequelize ORM**
- **SQLite** (local) / **PostgreSQL** (optional for cloud, via `DATABASE_URL`)
- **AWS Lambda (optional)** for scenario generation
- **Node 20 Alpine** (Docker image)
- **Docker Desktop** (container build + run)
- **Jest + Supertest** (automated API tests)

---

## How to Run the Project (Local Dev, no Docker)

1) Navigate to the project folder  
```bash
cd cse3cwa-a2
```

2) Install dependencies  
```bash
npm ci
```

3) (Optional) Create `.env.local` to enable the demo Lambda:  
```bash
LAMBDA_URL=https://gsofeno4d5t25ff24tt2ujecji0hpmja.lambda-url.us-east-1.on.aws/
```

4) Start the development server  
```bash
npm run dev
```

5) Open in your browser  
```
http://localhost:3000
```

---

## Docker Deployment

### Build the container
```bash
docker build -t cse3cwa-a2:local .
```

### Run (ephemeral DB, no Lambda)
```bash
docker run --rm -p 3000:3000 cse3cwa-a2:local
```

### Persist the database between runs
This project writes in **production mode** to `/app/data/app.sqlite` (see `lib/db.ts`).  
Create a local `./data` folder and mount it:

```bash
mkdir -p data
docker run --rm -p 3000:3000   -v "$PWD/data:/app/data"   cse3cwa-a2:local
```

> After first run, you should see `./data/app.sqlite` created on your host.

### Use the demo Lambda Function
```bash
docker run --rm -p 3000:3000   -e LAMBDA_URL="https://gsofeno4d5t25ff24tt2ujecji0hpmja.lambda-url.us-east-1.on.aws/"   -v "$PWD/data:/app/data"   cse3cwa-a2:local
```

> To disable Lambda, simply omit `-e LAMBDA_URL=…`.

---

## Features and Assignment Requirements

| Requirement | Implementation |
|---|---|
| **Game Interface / Courtroom** | `components/CourtroomGame.tsx` – 40:00 global timer, alert queue, critical & non-critical events. |
| **Coding Tasks (3 Stages)** | `components/CodingTaskPanel.tsx` – HTML accessibility, login validation, CSV 0..20 with per-task timer. |
| **Verdict System** | Verdict sound + message, saved details; `app/courtroom/verdict/page.tsx`. |
| **Win Condition** | Completing all three tasks stops the timer and shows **Play Again / Quit**. |
| **Scenario Options / Lambda** | `components/OptionsButton.tsx` + `/api/options` (local fallback or Lambda). |
| **Database / API CRUD** | Sequelize models; `/api/progress`, `/api/progress/[id]`, `/api/output`, `/api/output/[id]`. |
| **Dockerised Deployment** | Multi-stage `dockerfile` on Node 20 Alpine. |
| **Testing / Health** | `/api/health` endpoint and **Jest + Supertest** tests that assert API availability and DB CRUD. |

---

## Database

- **Local development:** SQLite file `data.sqlite` (created in the project root).
- **Docker / production:** SQLite file at `/app/data/app.sqlite` (mount `./data:/app/data` to persist).
- **Cloud optional:** Set `DATABASE_URL` (e.g., for PostgreSQL) to use a cloud DB with Sequelize.

**Tables:**
- **Progress** – Tracks game runs (`startedAt`, `finishedAt`, `verdictCategory`, `notes`, timestamps)
- **Output** – Stores “Save Output” HTML snapshots and JSON summaries

SQLite meets the minimum database requirement for Assignment 2.

---

## Game Flow

1. Player optionally selects a scenario (local or Lambda-generated).
2. Clicking **Start** begins the 40-minute timer and periodic alerts.
3. Three coding tasks must be completed (each 60s window) while dealing with alerts.
4. Ignoring a **critical** alert or failing a task triggers a **verdict**.
5. Completing all tasks before time expires results in a **win**; choose **Play Again** or **Quit**.
6. Progress and snapshots are saved via `/api/progress` and `/api/output`.

---

## Key Files

| File | Purpose |
|---|---|
| `components/CourtroomGame.tsx` | Manages timer, alerts, scenario selection, verdict flow, “Save Output”. |
| `components/CodingTaskPanel.tsx` | Three coding stages with validation and per-task timing; notifies parent on win/verdict. |
| `components/OptionsButton.tsx` | “Generate Options” modal; stores chosen scenario in `localStorage`. |
| `lib/db.ts` | Configures Sequelize for SQLite (local/dev, docker/prod) or Postgres via `DATABASE_URL`. |
| `app/api/options/route.ts` | Local/Lambda scenarios with diagnostics via `?diag=1`. |
| `app/api/progress/*` | CRUD for game runs. |
| `app/api/output/*` | CRUD for saved HTML snapshots + JSON summaries. |
| `app/api/health/route.ts` | Health check – authenticates DB connection and reports timings. |

---

## APIs (Quick Reference)

- `GET /api/health` → `{"ok": true, "db":"up", "elapsedMs": <number>}`
- `GET /api/options` → `{ source: "local"|"lambda"|"fallback", options: [...] }`  
  Optional diagnostics: `GET /api/options?diag=1`
- `POST /api/progress` → `{ ok:true, id }` (fields: `startedAt`, `finishedAt`, `verdictCategory`, `notes`)
- `GET/PUT/DELETE /api/progress/[id]`
- `GET /api/output` → `{ rows: [...] }`
- `POST /api/output` → `{ ok:true, id }` (body: `{ html: string, summary?: object }`)
- `GET/PUT/DELETE /api/output/[id]`

**Handy cURL checks**
```bash
# health
curl -s http://localhost:3000/api/health | jq

# create output snapshot
curl -s -X POST http://localhost:3000/api/output   -H "Content-Type: application/json"   -d '{"html":"<!doctype html><html><body>Snapshot</body></html>","summary":{"demo":true}}' | jq

# list outputs
curl -s http://localhost:3000/api/output | jq
```

---

## Automated API Tests (Jest + Supertest)

These tests are aligned with the **lecture focus on simple, targeted API checks**:
1) **Health Check Test** – proves the server is up and DB is reachable.  
2) **Output CRUD Test** – proves you can save to the DB and read it back.

### Test Files (already included)
- `__tests__/health.test.ts`  
- `__tests__/output.test.ts`

Each test uses **Supertest** to call the running server. By default the base URL is `http://localhost:3000`, or you can override with `TEST_BASE_URL`.

### How to Run the Tests (Dev server running)

1) Start the server in **one terminal**:
```bash
npm run dev
```

2) In a **second terminal**, run Jest:
```bash
# optional: point tests at a different base URL
# export TEST_BASE_URL=http://127.0.0.1:3000

npm test
```

3) Optional coverage:
```bash
npm test -- --coverage
```

You should see:
- `GET /api/health` → **200** with `{ ok: true, db: "up" }`
- `POST /api/output` creates a record and returns an `id`
- `GET /api/output` contains that new record
- `GET /api/output/:id` returns the same record

### How to Run Tests Against Docker

1) Run the container (map port 3000):
```bash
docker run --rm -p 3000:3000 -v "$PWD/data:/app/data" cse3cwa-a2:local
```

2) From your host, in another terminal:
```bash
# ensure base URL points at the container's published port
export TEST_BASE_URL=http://localhost:3000
npm test
```

### What to Capture for Submission (Testing Evidence)

Include **screenshots** of:
- Terminal showing `npm test` with both tests **passing** (green ticks).
- (Optional) Coverage summary from `npm test -- --coverage`.
- A `curl` run that **creates** an Output and a `curl` **list** that shows the newly created record (proves DB write/read).
- (If using Docker) `docker run ...` command and a brief screenshot of the app in the browser.

These artefacts clearly demonstrate **automated API verification** and **database persistence**, matching the assignment requirement:  
> “Add 2× tests to your autogenerated examples and check the output.”

---

## Lighthouse & JMeter (Optional but Recommended Evidence)

- **Lighthouse**: run against `/courtroom`. Capture the summary scores and any key a11y warnings.  
- **JMeter**: a small plan that hits `/api/health` and `/api/output` (POST + GET). Capture the **Aggregate Report** (Throughput, Avg, Error %) as supporting performance evidence.

*(These are recommended artefacts often requested in the marking guidance: “Lighthouse, JMeter test results”.)*

---

## Troubleshooting

| Issue | Fix |
|---|---|
| **`source: "fallback"` in `/api/options`** | Lambda not reachable or timed out → check `LAMBDA_URL`. |
| **`SQLITE_CANTOPEN: unable to open database file`** | In Docker, mount `./data:/app/data`. Locally, ensure the process can write to the repo folder. |
| **ESLint warnings** | Non-blocking; adjust ESLint config if desired. |
| **Jest cannot find Supertest types** | `npm i -D @types/supertest` (already included in `devDependencies`). |
| **Tests fail with connection refused** | Ensure the app is running (`npm run dev` or container up) and check `TEST_BASE_URL`. |

---

## Academic Integrity & AI Acknowledgement

**Reuse and Provenance**  
- Game loop (timers, intervals, cleanup with `useEffect`) follows lecture material on React state/effects.  
- Server routes and App Router patterns follow the Next.js documentation covered in class.  
- Reused UI patterns (buttons, badges, modals, aria) are consistent with Assignment 1 components.

**AI Usage**  
AI tools were used as a **learning assistant** to:
- Improve comments and structure
- Clarify TypeScript types and Next.js conventions
- Suggest safer timer cleanup and single-point verdict handling
- Draft Jest/Supertest test scaffolding

All **final design decisions, implementation, and submission** are my own work. AI support was limited to tutor-style guidance.

---

## License
This project is for **educational purposes only** as part of CSE3CWA / CSE5006 coursework.
