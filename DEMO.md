# RRCMS — Quick Demo Guide

This guide is designed for a short classroom walkthrough. Start both servers and verify the database before the teacher arrives.

## 1. Start-up checklist

### Backend terminal

```powershell
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run dev
```

### Frontend terminal

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

### Health check

Open these URLs:

- `http://localhost:5000/api/health` — API status.
- `http://localhost:5000/api/health/db` — database connection.

Do not continue the demo until the database health endpoint reports a successful connection.

## 2. Demo login accounts

All seeded demo users use the local demo password:

```text
Password@123
```

| Persona | Email |
|---|---|
| Admin | `admin@rrcms.local` |
| Customer | `customer1@rrcms.local` |
| Vendor | `vendor1@rrcms.local` |
| Technician | `tech1@rrcms.local` |
| Delivery partner | `delivery1@rrcms.local` |

Additional seeded users are `customer2@rrcms.local`, `vendor2@rrcms.local`, `tech2@rrcms.local`, and `delivery2@rrcms.local`.

**Local-demo warning:** These are predictable demo credentials. Use them only in a local, non-public demonstration environment. Never deploy the shared demo password or quick-login persona switcher to a public production environment without safeguards.

## 3. Suggested 5–7 minute walkthrough

### Step 1 — Introduce the system (30 seconds)

Explain:

> RRCMS stands for Remote Repair Centre Management System. It coordinates a repair request from customer submission through service-centre review, estimate approval, technician repair, pickup/delivery, and customer receipt confirmation.

### Step 2 — Customer submits or tracks a repair (1 minute)

1. Sign in as `customer1@rrcms.local`.
2. Open the customer dashboard and locate the seeded sample request if it appears.
3. Show the request number, device details, current status, and status history.
4. If time permits, open the new-repair page and demonstrate the required device/issue fields. Avoid creating duplicate sample requests unless you intend to use them for the rest of the demo.

The seed script creates a sample request with request number `RRCMS-NGP-001` when it does not already exist.

### Step 3 — Vendor reviews the request and estimate (1 minute)

1. Log out and sign in as `vendor1@rrcms.local`, or use the demo persona switcher if it is available in the current local UI.
2. Show the vendor dashboard.
3. Explain the request review and estimate workflow.
4. If the sample request is assigned to another vendor, use the matching seeded vendor account or select a separate eligible request. Do not promise that every seeded account will see every request.

### Step 4 — Technician handles repair work (1 minute)

1. Sign in as `tech1@rrcms.local`.
2. Show the technician dashboard and any assigned work.
3. Explain how a technician records diagnosis/progress and marks repair work complete.
4. If no task is assigned, explain the workflow from the code or prepare a test request in advance rather than changing records during the presentation.

### Step 5 — Delivery partner updates delivery (1 minute)

1. Sign in as `delivery1@rrcms.local`.
2. Show assigned pickup/delivery work.
3. Explain scheduling, assignment, status updates, failure handling, and scheduling-conflict checks.
4. Use an existing eligible delivery for live status changes. Avoid marking a real or needed record complete just for demonstration.

### Step 6 — Receipt confirmation and closure (1 minute)

Explain that customer receipt confirmation is the final step that records confirmation and closes the repair workflow. Show the relevant delivery and repair status if a suitable completed demo record is available.

### Step 7 — Admin, notifications, and validation (1 minute)

1. Sign in as `admin@rrcms.local`.
2. Show the administrator view and notifications if present.
3. Briefly explain role-based authorization and how the backend validates incoming requests.
4. Mention that automated API and middleware tests are located in `backend/tests/`.

## 4. If the teacher asks about implementation

- **Frontend:** React + TypeScript + Vite.
- **Backend:** Express + TypeScript.
- **Database:** MySQL.
- **Data access/migrations:** Prisma.
- **Authentication:** bcrypt password hashing, JWT-based authentication, and protected routes.
- **Validation:** Zod request schemas and centralized error handling.
- **Authorization:** role middleware and protected frontend routes; backend authorization is the security boundary.
- **Testing:** Vitest and Supertest tests under `backend/tests/`.
- **Health checks:** `/api/health` and `/api/health/db`.

## 5. Evidence to keep ready

Before the demo, have these ready in separate tabs or terminals:

- Project repository and README.
- Jira SCRUM-129 parent and completed subtasks.
- Git commit history showing relevant implementation commits.
- Successful output from `npm test` and `npm run build` in the backend.
- Successful output from frontend `npm run build` and `npm run lint`, if they pass.
- A screenshot or captured output of the health endpoints.
- A screenshot of a working role workflow, if your PBL rubric asks for visual evidence.

Only report a command as passing after you have actually run it successfully.

## 6. Quick recovery plan

- If the frontend fails to load, check the Vite terminal and browser console.
- If API calls fail, check that the backend is running at `http://localhost:5000`.
- If the database health check fails, verify MySQL and the backend `.env` file.
- If login fails, verify the database and rerun `npm run seed` against the intended demo database.
- If a role has no assigned task, switch to a seeded account that owns an eligible record or explain the workflow without altering data unexpectedly.

## 7. Closing statement

> RRCMS brings the repair lifecycle into one role-based workflow. It combines repair tracking, estimate approval, technician assignment, delivery coordination, status history, notifications, and validation so that each stakeholder works with the same repair record.
