# CSE3CWA / CSE5006 – Assignment 2

## Project Overview
This project is a **full-stack web application** built with **Next.js (App Router + TypeScript)**.
It extends the work from Assignment 1 and implements an **interactive courtroom-style simulation game**.

The application demonstrates:
- Timed gameplay with dynamic alerts and coding tasks
- CRUD operations via API routes and a database
- Optional AWS Lambda integration for generating gameplay scenarios
- A Dockerised production deployment

The project meets the Assignment 2 “Courtroom” option requirements and provides both server- and client-side components that interact through a local SQLite database.

## Tech Stack
- **Next.js 15** (React + TypeScript App Router)
- **Sequelize ORM**
- **SQLite** (local) / **PostgreSQL** (optional for cloud)
- **AWS Lambda (optional)** for scenario generation
- **Node 20 Alpine** (for Docker image)
- **Docker Desktop** (for container build + run)

## How to Run the Project

### Local Development (no Docker)
1. Navigate to the project folder:
   cd cse3cwa-a2

2. Install dependencies:
   npm ci

3. (Optional) Create a .env.local file:
   LAMBDA_URL=https://gsofeno4d5t25ff24tt2ujecji0hpmja.lambda-url.us-east-1.on.aws/

4. Start the development server:
   npm run dev

5. Open in your browser:
   http://localhost:3000

## Docker Deployment
### Build the container
docker build -t cse3cwa-a2:local .

### To Run Docker Local Variable command
Run locally (no Lambda, default SQLite):
docker run --rm -p 3000:3000 cse3cwa-a2:local

### Persist the database between runs
docker run --rm -p 3000:3000 -v "$PWD/data.sqlite:/app/data.sqlite" cse3cwa-a2:local

### Use the demo Lambda Function command
docker run -p 3000:3000 -e LAMBDA_URL="https://gsofeno4d5t25ff24tt2ujecji0hpmja.lambda-url.us-east-1.on.aws/" cse3cwa-a2:local

To disable Lambda, simply omit the -e LAMBDA_URL environment variable.

## Features and Assignment Requirements
| Requirement | Implementation |
|--------------|----------------|
| **Game Interface / Courtroom Scenario** | Implemented in CourtroomGame.tsx – 40 min timer, alerts, critical and non-critical events. |
| **Coding Tasks (3 Stages)** | CodingTaskPanel.tsx includes HTML accessibility, login validation, and CSV sequence tasks with individual 60 s timers. |
| **Verdict System** | When time or a critical alert expires, a verdict sound and message are shown (verdict/page.tsx). |
| **Win Condition** | Completing all three tasks triggers a win message and offers Play Again / Quit options. |
| **Scenario Options / AWS Lambda Integration** | OptionsButton.tsx and /api/options fetch alert bias options locally or from Lambda. |
| **Database / API CRUD** | Implemented with Sequelize model Progress.ts and API routes (/api/progress, /api/output). |
| **Dockerised Deployment** | Multi-stage Dockerfile uses Node 20 Alpine for build and runtime stages. |
| **Testing / Health** | Health endpoint (/api/health) and optional Playwright tests supported. |

## Database
- **Local:** SQLite (data.sqlite) created automatically in the container or working directory.
- **Cloud optional:** Set DATABASE_URL (PostgreSQL) to use cloud database.

**Tables:**
- Progress – Tracks game runs (startedAt, finishedAt, verdictCategory, notes)
- Output – Stores “Save Output” HTML snapshots and JSON summaries

SQLite meets the minimum database requirement for Assignment 2.

## Game Flow
1. Player selects a scenario (optionally from Lambda).
2. Clicking Start begins the 40 minute game and periodic alerts.
3. Three coding tasks must be completed before time runs out.
4. Ignoring a critical alert or failing a task triggers a verdict.
5. Completing all tasks before time expires results in a win state with Play Again / Quit options.
6. Verdicts and snapshots are saved through API calls to /api/progress and /api/output.

## Key Files
| File | Purpose |
|------|----------|
| components/CourtroomGame.tsx | Manages timer, alerts, and scenario selection logic. |
| components/CodingTaskPanel.tsx | Implements three coding stages with validation and progress. |
| components/OptionsButton.tsx | Displays Generate Options modal (local or Lambda bias). |
| lib/db.ts | Sets up Sequelize for SQLite or Postgres. |
| app/api/* | CRUD endpoints for progress and output. |
| app/courtroom/verdict/page.tsx | Verdict screen with sound and Play Again link. |

## APIs
- GET /api/options → Returns local or Lambda scenarios.
- POST /api/progress → Records completed or failed runs.
- GET / PUT / DELETE /api/progress/[id] → Full CRUD for run records.
- POST /api/output → Saves game snapshot.

Optional: /api/options?diag=1 to view diagnostics (lambda fetch status and source).

## Testing & Health
- Health check endpoint:
  GET /api/health → { "ok": true }
- Add Playwright tests to simulate game scenarios.
- Run Lighthouse audit on /courtroom for accessibility and performance evidence.

## Troubleshooting
| Issue | Fix |
|--------|-----|
| **ESLint warnings on build** | Non-blocking; adjust .eslintrc if needed. |
| **sqlite3 module missing** | Run npm ci to rebuild native bindings. |
| **source: fallback in options** | Lambda not reachable → check LAMBDA_URL. |
| **Persist database in Docker** | Add -v "$PWD/data.sqlite:/app/data.sqlite". |
| **Play Again button not working** | Fixed in verdict/page.tsx – uses window.location.assign("/courtroom"). |

## AI Acknowledgement
Artificial Intelligence (AI) tools were used as a learning assistant throughout the development of this assignment.

AI was used to:
- Support code correction and editing
- Plan and schedule project tasks
- Maintain formatting and commenting consistency
- Clarify Next.js concepts and TypeScript use
- Track deliverables and feature branch management

AI was not used to generate the entire solution. All final design decisions, implementation, testing, and submission are my own work. AI acted as a tutor-style assistant to aid learning and understanding.

## License
This project is for educational purposes only as part of CSE3CWA / CSE5006 coursework.
