# RRCMS — Sprint 1 Execution Checklist & Daily Implementation Plan

**Sprint Period:** October 16, 2026 (9:00 PM IST) — October 23, 2026 (10:00 AM IST)  
**Target Completion:** October 22, 2026  
**Budget Policy:** Strict ₹0 expenditure  
**Repository:** `https://github.com/shiwankarprisha/rrcms-pbl-project`  
**Jira Board:** `https://rrcms-pbl-project.atlassian.net`

---

## 1. Verified Completed Work (Foundation)

- [x] **SCRUM-154:** Application Foundation and API Connectivity (Express, CORS, Helmet, `/api/health`)
- [x] **SCRUM-156:** Database Foundation and Prisma Integration (`rrcms_db`, MySQL 8.0, Prisma Client 6.19.3)
- [x] **SCRUM-157:** Dedicated MySQL Application User (`rrcms_app` credentials & permissions configured)
- [x] **SCRUM-158:** Initial Database Migration & Connectivity Verification (`/api/health/db`)

---

## 2. Daily Milestone & Jira Mapping Schedule

### Day 1 (Saturday, Oct 17) — Project Control & Planning
- [x] Repository state check (Clean Git baseline at commit `7f8e582`)
- [x] Database connectivity and port availability verified
- [x] Review active Jira sprint and functional hierarchy (`SCRUM-5` to `SCRUM-9`)
- [x] Establish daily execution checklist
- **Planned Commit:** `docs: add RRCMS execution checklist`

---

### Day 2 (Sunday, Oct 18) — Authentication & Role Management + CI Foundation
- [ ] Align database `UserRole` enum with agreed 5-role model (`ADMIN`, `CUSTOMER`, `VENDOR`, `TECHNICIAN`, `DELIVERY_PARTNER`)
- [ ] User Registration with secure `bcryptjs` password hashing (`SCRUM-20`: `SCRUM-109`–`SCRUM-112`)
- [ ] User Login with signed JWT tokens and HTTP cookies (`SCRUM-21`: `SCRUM-113`–`SCRUM-116`)
- [ ] Role-Based Access Control (RBAC) middleware & unauthorized access tests (`SCRUM-22`: `SCRUM-117`–`SCRUM-121`)
- [ ] Initial GitHub Actions CI workflow (lint, type check, build)
- **Planned Commits:**
  - `feat: implement authentication and user registration`
  - `feat: add role-based access control`
  - `ci: add GitHub Actions validation workflow`

---

### Day 3 (Monday, Oct 19) — Profile Management & Repair Submission
- [ ] User profile retrieval and permitted updates (`SCRUM-23`: `SCRUM-122`–`SCRUM-125`)
- [ ] Repair request submission API with unique tracking number generation (`SCRUM-10`: `SCRUM-31`–`SCRUM-34`)
- [ ] Device details, category, and issue description validation
- [ ] Customer repair tracking view (`SCRUM-11`: `SCRUM-37`–`SCRUM-41`)
- **Planned Commits:**
  - `feat: implement user profile management`
  - `feat: add repair request submission`

---

### Day 4 (Tuesday, Oct 20) — End-to-End Repair Management (Dussehra)
- [ ] Vendor/Admin request verification queue (`SCRUM-13`: `SCRUM-47`–`SCRUM-51`)
- [ ] Repair estimate generation (cost & turnaround time) (`SCRUM-14`: `SCRUM-52`–`SCRUM-56`)
- [ ] Customer estimate review and approve/reject responses (`SCRUM-12`: `SCRUM-42`–`SCRUM-46`)
- [ ] Technician assignment to approved repairs (`SCRUM-15`: `SCRUM-57`–`SCRUM-61`)
- [ ] Technician diagnostic queue and progress logging (`SCRUM-16`, `SCRUM-17`: `SCRUM-62`–`SCRUM-70`)
- [ ] Repair completion certification and status history (`SCRUM-18`, `SCRUM-19`: `SCRUM-71`–`SCRUM-78`)
- **Planned Commits:**
  - `feat: implement repair tracking and estimate workflow`
  - `feat: add technician assignment and repair progress`
  - `test: cover core repair management workflow`

---

### Day 5 (Wednesday, Oct 21) — Pickup, Delivery & Cross-Module Integration
- [ ] Schedule pickup and delivery with address & date validation (`SCRUM-24`: `SCRUM-79`–`SCRUM-83`)
- [ ] Assign Delivery Partner to trips (`SCRUM-25`: `SCRUM-84`–`SCRUM-88`)
- [ ] Delivery partner trip view and status updates (`SCRUM-26`, `SCRUM-27`: `SCRUM-89`–`SCRUM-97`)
- [ ] Module Integration: Handover validation (prevent duplicate dispatch & block unfinished repairs) (`SCRUM-29`: `SCRUM-102`–`SCRUM-105`)
- [ ] Customer doorstep receipt confirmation and automatic repair closure (`SCRUM-28`, `SCRUM-30`: `SCRUM-98`–`SCRUM-108`)
- **Planned Commits:**
  - `feat: implement pickup and delivery management`
  - `feat: integrate repair completion and delivery closure`

---

### Day 6 (Thursday, Oct 22) — Comprehensive Testing, Bug Fixing & Demo Preparation
- [ ] Execute automated integration test suite (`SCRUM-126`–`SCRUM-128`)
- [ ] Regression checks and error handling tests (`SCRUM-129`)
- [ ] Verify GitHub Actions CI status on latest commit
- [ ] Audit `.gitignore`, secrets, and environment configurations
- [ ] Prepare viva defense demonstration script & architecture cheatsheet
- **Planned Commits:**
  - `test: add end-to-end workflow and regression coverage`
  - `fix: resolve verified integration and validation defects`
  - `docs: prepare RRCMS setup and demonstration guide`
