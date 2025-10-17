# CSE3CWA – Assignment 2  
**Courtroom Game – Interactive Web Application**

---

## 📘 Project Overview
This project is a **full-stack web application** built with **Next.js (App Router + TypeScript)**.  
It extends the work from Assignment 1 and implements an **interactive courtroom-style simulation game**.

The application demonstrates:
- Timed gameplay with dynamic alerts and coding tasks
- CRUD operations via API routes and a database
- Optional AWS Lambda integration for scenario generation
- A **Dockerised production deployment** and verified **cloud deployment on AWS EC2**
- Automated API tests using **Jest + Supertest** for health and CRUD validation

The project meets the Assignment 2 “Courtroom” option requirements and provides both server- and client-side components that interact through a local SQLite database.

---

## 🧩 Tech Stack
- **Next.js 15** (React + TypeScript, App Router)
- **Sequelize ORM**
- **SQLite** (local) / **PostgreSQL** (optional for cloud via `DATABASE_URL`)
- **AWS Lambda (optional)** for scenario generation
- **Node 20 Alpine** (Docker image)
- **Docker Desktop** or **AWS EC2**
- **Jest + Supertest** for automated testing

---

## ⚙️ Local Development Setup

### 1️⃣ Install and Run
```bash
cd cse3cwa-a2
npm ci
npm run dev
```

The app will be available at:  
👉 [http://localhost:3000](http://localhost:3000)

### 2️⃣ Optional: Use Lambda for Scenario Generation
Create a `.env.local` file in the project root:
```bash
LAMBDA_URL=https://gsofeno4d5t25ff24tt2ujecji0hpmja.lambda-url.us-east-1.on.aws/
```

### 3️⃣ Health Check
```bash
curl -s http://localhost:3000/api/health | jq
```
Expected response:
```json
{ "ok": true, "db": "up", "elapsedMs": <number> }
```

---

## 🐳 Docker Deployment

### Build the Image
```bash
docker build -t cse3cwa-a2:local .
```

### Run Locally (Ephemeral Database)
```bash
docker run --rm -p 3000:3000 cse3cwa-a2:local
```

### Persist the Database Between Runs
The app writes to `/app/data/app.sqlite` in production mode.  
Mount a host volume to persist:
```bash
mkdir -p data
docker run --rm -p 3000:3000 -v "$PWD/data:/app/data" cse3cwa-a2:local
```

### Enable Lambda Integration
```bash
docker run --rm -p 3000:3000   -e LAMBDA_URL="https://gsofeno4d5t25ff24tt2ujecji0hpmja.lambda-url.us-east-1.on.aws/"   -v "$PWD/data:/app/data"   cse3cwa-a2:local
```

### Environment Variables
| Variable | Description |
|-----------|-------------|
| `LAMBDA_URL` | Optional AWS Lambda endpoint |
| `SQLITE_PATH` | Path to database file |
| `DATABASE_URL` | Optional PostgreSQL URL for cloud DB |
| `NODE_ENV` | Set to `production` in Docker runtime |

---

## 🧪 Automated Testing (Jest + Supertest)

Two automated API tests ensure reliability of core endpoints.

### Test Files
- `__tests__/health.test.ts` → Validates `/api/health` returns `{ ok: true, db: "up" }`
- `__tests__/output.test.ts` → Confirms Output record can be created and retrieved via CRUD

### Run Tests
```bash
npm test
```

Example output:
```
PASS  __tests__/health.test.ts
✓ returns 200 and indicates DB is up

PASS  __tests__/output.test.ts
✓ POST creates a record, then GET retrieves it
```

---

## ⚡ Performance & Quality Testing

### Lighthouse Audit
| Page | Performance | Accessibility | Best Practices | SEO |
|-------|-------------|---------------|----------------|-----|
| Homepage | 100 | 100 | 96 | 100 |
| Courtroom | 91 | 100 | 96 | 100 |

✅ High accessibility and overall performance.

### JMeter API Test Summary
| Endpoint | Avg Response (ms) | Success Rate |
|-----------|-------------------|---------------|
| /api/health | 9 | 100% |
| /api/output | 12 | 100% |
| /api/progress | 15 | 100% |

✅ Consistent performance with 0% error rate.

---

## 🎮 Game Flow Overview

1. Player selects a scenario (optionally from AWS Lambda).  
2. Clicking **Start** begins the 40-minute timer and periodic alerts.  
3. Three coding tasks must be completed within their respective timers.  
4. Ignoring a critical alert or failing a task triggers a **verdict**.  
5. Completing all tasks triggers a **win** state.  
6. Game results and outputs are saved via `/api/progress` and `/api/output`.

---

## 🗃️ Database Schema

### Local / Docker
- **SQLite:** Automatically created in `data.sqlite` or `/app/data/app.sqlite`.

### Cloud
- **Persistent Volume:** `/home/ec2-user/appdata` (mounted in AWS EC2)

| Table | Description |
|--------|-------------|
| `Progress` | Tracks game runs (`startedAt`, `finishedAt`, `verdictCategory`, `notes`) |
| `Output` | Stores runtime HTML snapshots and JSON summaries |

---

## 🧾 Presentation & Reflection

A recorded presentation is available via the **About** page in the app.  
It covers:
- Application overview and architecture  
- Docker build and cloud deployment  
- Testing and performance results  
- Reflection on learning and feedback

---

## 🤖 AI Acknowledgement
AI tools were used **only as a learning assistant** to:
- Refine TypeScript and React structure  
- Improve comments and code readability  
- Validate Docker and Jest configurations  
- Maintain formatting consistency  

All final design, testing, and deployment decisions are my own.

---

## 🧠 License & Academic Use
This project is for **educational use** as part of **La Trobe University CSE3CWA** coursework.  
Not for commercial release or redistribution.

---

© 2025 – Student Submission  
*La Trobe University – CSE3CWA / CSE5006 – Assignment 2*
