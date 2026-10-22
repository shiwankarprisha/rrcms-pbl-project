# RRCMS — Remote Repair Centre Management System

A web-based repair management system designed to streamline the lifecycle of electronic device repairs, from customer registration and repair requests to inspection, cost estimation, technician assignment, repair completion, pickup, delivery, and customer confirmation.

RRCMS provides a centralized platform for customers, vendors, technicians, delivery partners, and administrators to coordinate repair operations, track progress, and manage the repair workflow.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [Repair Workflow](#repair-workflow)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Database Design](#database-design)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Testing and Build](#testing-and-build)
- [API Overview](#api-overview)
- [Demo Guide](#demo-guide)
- [Security Considerations](#security-considerations)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)

---

## Project Overview

Repair and Refurbishment Centre Management System (RRCMS) is a full-stack web application built to organize and manage electronic device repair operations through a centralized digital platform.

Traditional repair workflows can involve manual record keeping, disconnected communication between customers and repair staff, limited visibility into repair progress, and difficulties coordinating technicians and deliveries.

RRCMS addresses these challenges by maintaining repair requests, customer information, repair statuses, cost estimates, technician assignments, delivery details, and status history in a structured system.

The application follows a role-based approach, allowing different stakeholders to interact with the repair workflow according to their responsibilities.

## Problem Statement

Managing a repair and refurbishment centre involves multiple interconnected activities:

- Recording customer repair requests and device information.
- Tracking the status of devices throughout the repair lifecycle.
- Coordinating vendors, technicians, and delivery partners.
- Communicating repair estimates and approval decisions.
- Scheduling pickups and deliveries.
- Maintaining records of status changes and customer confirmation.
- Controlling access to operations according to user roles.

Without a centralized system, these activities can become difficult to coordinate and monitor.

**RRCMS aims to provide a centralized, maintainable, and role-oriented solution for managing these repair operations.**

## Objectives

1. Digitize repair request creation and tracking.
2. Provide a structured workflow for inspection, estimation, approval, and repair.
3. Support role-based access for different stakeholders.
4. Coordinate technician assignments and pickup/delivery operations.
5. Maintain repair and delivery status histories.
6. Validate incoming data and handle common application errors.
7. Provide a responsive web interface for accessing system functionality.
8. Establish a maintainable full-stack architecture with automated build and test workflows.

## Key Features

### 1. Authentication and Role-Based Access

- User registration and login.
- Password hashing using bcrypt.
- Authentication using protected application routes and backend authorization middleware.
- Role-based access for administrators, customers, vendors, technicians, and delivery partners.
- Validation for registration and login inputs.

### 2. Repair Request Management

- Submit repair requests containing device information and issue descriptions.
- Record device brand, model, serial number, and repair-related details where applicable.
- Generate a unique repair request number.
- Upload a device image with file validation and size restrictions.
- Track repair status throughout the workflow.
- Maintain repair status history.

### 3. Inspection and Cost Estimation

- Support inspection and diagnosis as part of the repair process.
- Record estimated cost, estimated completion time, and notes.
- Track estimate approval or rejection.
- Handle the cancellation workflow when a customer rejects an estimate.

### 4. Technician Assignment and Repair Processing

- Support technician assignment to repair requests.
- Track assignment status and repair progress.
- Record diagnosis and repair notes.
- Track repair completion and subsequent pickup or delivery stages.

### 5. Pickup and Delivery Management

- Support doorstep pickup requests with an address.
- Schedule pickup and delivery operations.
- Assign delivery partners where applicable.
- Track delivery status, including scheduled, assigned, in transit, completed, failed, and cancelled states.
- Record delivery notes and customer receipt confirmation.
- Apply validation to prevent invalid delivery status transitions.

### 6. Notifications

- Provide an in-app notification system for relevant stakeholders.
- Store notification messages, types, read status, and optional navigation links.

### 7. Administration and Demo Support

- Provide dedicated administration and technician dashboard pages.
- Include a demo persona quick-switching capability for demonstration purposes.
- Support legal and informational pages, including privacy and terms pages.

*The availability of individual operations depends on the implemented role permissions and workflow state.*

---

## User Roles

| Role | Primary responsibility |
|---|---|
| Customer | Register, submit repair requests, follow repair progress, respond to estimates, and confirm receipt where supported. |
| Vendor | Participate in repair request processing and vendor-related operations permitted by the system. |
| Technician | Handle assigned repairs, record diagnosis and repair information, and update repair progress. |
| Delivery Partner | Manage assigned pickup/delivery operations and update delivery status. |
| Administrator | Access administrative functionality and oversee supported system operations. |

Role permissions are enforced through the application's authentication and authorization mechanisms.

## Repair Workflow

The repair lifecycle is managed through a sequence of status transitions. The exact path depends on the repair outcome and whether pickup or delivery is requested.

A typical successful repair follows this flow:

1. **Submission:** The customer creates a repair request with device details and an issue description.
2. **Inspection:** The request is inspected and diagnosis information is recorded.
3. **Estimation:** The repair estimate is prepared and presented for customer approval.
4. **Approval:** The customer approves the estimate before the repair proceeds.
5. **Assignment:** The repair is assigned to a technician.
6. **Repair:** The technician works on the device and records progress.
7. **Completion:** The repair is marked as completed.
8. **Pickup or delivery:** The device is prepared for collection or delivery, as applicable.
9. **Confirmation:** The customer confirms receipt when the delivery workflow requires it.
10. **Closure:** The repair request is closed according to the implemented workflow rules.

Rejected estimates, failed deliveries, cancellations, and other exceptions follow separate status paths.

---

## Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React | Component-based user interface development. |
| TypeScript | Static typing for frontend code. |
| Vite | Development server and production build tooling. |
| CSS | Application styling and layout. |
| npm | Frontend dependency management and scripts. |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime for the backend. |
| Express | HTTP server and API routing. |
| TypeScript | Static typing for backend services and application logic. |
| Prisma ORM | Database access, schema modelling, and client generation. |
| MySQL | Relational database for persistent application data. |
| bcrypt | Password hashing. |
| Vitest | Automated testing. |

### Development and Delivery Tools

| Tool | Purpose |
|---|---|
| Git | Version control. |
| GitHub | Source-code hosting and collaboration. |
| GitHub Actions | Automated CI validation on pushes and pull requests. |
| npm | Dependency installation and build/test scripts. |

---

## System Architecture

RRCMS follows a client-server architecture.

```text
+--------------------------------------+
|             User / Browser           |
+-------------------+------------------+
                    |
                    v
+--------------------------------------+
| Frontend: React + TypeScript + Vite  |
| Pages, Components, Forms, Dashboards |
+-------------------+------------------+
                    |
                    | HTTP API requests
                    v
+--------------------------------------+
| Backend: Node.js + Express + TS       |
| Routes, Middleware, Validation, Logic|
+-------------------+------------------+
                    |
                    | Prisma Client
                    v
+--------------------------------------+
|          MySQL Database              |
| Users, Repairs, Assignments,          |
| Deliveries, History, Notifications   |
+--------------------------------------+
```

### How the components work together

1. A user interacts with a frontend page.
2. The frontend sends an HTTP request to a backend API endpoint.
3. The backend processes the request through routing, authentication, authorization, validation, and application logic as applicable.
4. Prisma Client communicates with the MySQL database.
5. The backend returns a response to the frontend.
6. The frontend displays the result or an appropriate error message.

The frontend and backend are separate applications, which makes them easier to develop, test, and maintain independently.

---

## Database Design

The application uses MySQL with Prisma ORM.

The Prisma schema defines the main entities and relationships.

| Model | Purpose |
|---|---|
| `User` | Stores user details, credentials, role, account status, and timestamps. |
| `RepairRequest` | Stores repair request details, device information, status, estimates, and repair notes. |
| `TechnicianAssignment` | Links repair requests with technicians and tracks assignment progress. |
| `PickupDelivery` | Stores pickup/delivery details, scheduling, assignment, status, and confirmation information. |
| `RepairStatusHistory` | Records repair status changes and associated notes. |
| `DeliveryStatusHistory` | Records delivery status changes and associated notes. |
| `Notification` | Stores notifications, read status, type, and optional navigation links. |

### Relationships

- A customer can have multiple repair requests.
- A repair request can be associated with a vendor.
- A repair request can have multiple technician assignments.
- A repair request can have multiple pickup/delivery records.
- Repair and delivery records maintain their respective status histories.
- A user can receive multiple notifications.

The schema uses enums for roles and workflow states to keep status values consistent.

---

## Project Structure

```text
rrcms-pbl-project/
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── middleware/
│   │   └── modules/
│   ├── tests/
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   └── technician/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.ts
├── DEMO.md
├── EXECUTION_CHECKLIST.md
├── README.md
└── .gitignore
```

The tree highlights the principal project areas; individual modules and files may vary as development continues.

---

## Prerequisites

Install the following before running the project:

- Node.js 20 or a compatible supported version.
- npm.
- MySQL Server.
- Git.

You should also have access to the project repository:

```bash
git clone https://github.com/shiwankarprisha/rrcms-pbl-project.git
cd rrcms-pbl-project
```

## Installation and Setup

### 1. Install backend dependencies

```bash
cd backend
npm ci
```

### 2. Configure environment variables

Create a local `.env` file in the backend directory. Configure `DATABASE_URL` with your own MySQL credentials and database name.

Example:

```env
DATABASE_URL="mysql://YOUR_USER:YOUR_PASSWORD@localhost:3306/rrcms"
```

Replace the placeholders with your local configuration. Do not commit credentials or production secrets.

If the Prisma configuration in your checkout requires additional environment variables, configure those as well.

### 3. Set up the database

Create the MySQL database specified in `DATABASE_URL`.

Inspect the available Prisma scripts and migration files before choosing the appropriate setup command. If the project contains migrations, use the migration workflow defined by the repository. If it does not, consult the project schema and development instructions before applying schema changes.

Generate the Prisma Client:

```bash
npx prisma generate
```

### 4. Build and start the backend

From the `backend` directory:

```bash
npm run build
```

Use the backend's configured development script to start the server. Check `backend/package.json` for the exact script name and port.

### 5. Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm ci
```

### 6. Start the frontend

```bash
npm run dev
```

Open the local URL printed by Vite in the terminal.

Ensure the frontend API configuration points to the running backend. The frontend and backend must both be configured correctly for end-to-end functionality.

---

## Environment Configuration

Keep environment-specific settings outside committed source code.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL connection string used by Prisma. |
| `SHADOW_DATABASE_URL` | Shadow database connection string if required by the Prisma configuration or migration workflow. |

Use separate local, test, and production configurations as appropriate. Never publish real database passwords, authentication secrets, or production credentials.

## Running the Application

The project has two separately managed applications:

- **Backend:** provides the API, authentication, business logic, and database access.
- **Frontend:** provides the browser interface and calls the backend API.

Start the backend first, then start the frontend. Use the scripts defined in each application's `package.json` rather than assuming a particular server port or development command.

For a quick classroom walkthrough, follow [`DEMO.md`](DEMO.md).

---

## Testing and Build

### Frontend production build

From the `frontend` directory:

```bash
npm run build
```

This runs the TypeScript project build and generates the production frontend using Vite.

### Backend build

From the `backend` directory:

```bash
npm run build
```

### Backend tests

From the `backend` directory:

```bash
npm test
```

The backend test suite uses Vitest. The repository includes API-level tests for areas such as repair requests, input validation, authentication, and delivery workflows.

Run the tests against a correctly configured test environment. Tests that require database access need the appropriate database configuration and available services.

### Continuous Integration

The GitHub Actions workflow in `.github/workflows/ci.yml` is configured to validate backend and frontend changes on pushes to `main` and pull requests targeting `main`.

The workflow includes backend dependency installation, Prisma Client generation, backend build and tests, plus frontend dependency installation and production build.

A successful frontend build does not by itself establish that backend tests or the complete CI workflow pass. Check the Actions results for the status of each job.

---

## API Overview

The backend exposes HTTP API endpoints for supported application operations.

Examples referenced by the backend tests include:

| Endpoint | Purpose |
|---|---|
| `POST /api/repairs` | Submit a repair request. |
| `GET /api/repairs` | Retrieve repair requests accessible to the authenticated user. |
| `GET /api/repairs/:id` | Retrieve details of a repair request. |
| `POST /api/delivery/schedule` | Schedule a pickup/delivery operation. |
| `PATCH /api/delivery/:id/status` | Update delivery status subject to workflow validation. |
| `PATCH /api/delivery/:id/confirm-receipt` | Confirm receipt through the delivery workflow. |

Protected endpoints require the appropriate authentication and authorization.

These are representative endpoints, not a complete API specification. Consult the backend routes and tests for request bodies, response formats, supported operations, and role restrictions.

---

## Demo Guide

For a concise demonstration, open [`DEMO.md`](DEMO.md).

A useful demonstration sequence is:

1. Start the backend and frontend.
2. Open the application in a browser.
3. Demonstrate registration and login.
4. Show the repair request submission flow.
5. Explain how repair status and estimates are tracked.
6. Demonstrate the relevant role-specific views.
7. Show pickup/delivery status tracking and receipt confirmation, where configured.
8. Briefly explain the database schema and the frontend-to-backend request flow.

Use only locally configured demo accounts. Ensure the database has the necessary sample data before the demonstration.

---

## Security Considerations

- Passwords should be stored as hashes, not plaintext.
- Backend authorization must protect privileged operations independently of frontend navigation.
- Validate incoming request data on the server.
- Restrict uploaded files by type and size.
- Protect environment files and credentials.
- Demo accounts and quick-switching functionality should be restricted to controlled demonstration environments.
- Review production configuration, logging, CORS settings, and secret management before deployment.

## Future Enhancements

Potential improvements include:

- Automated deployment and production environment configuration.
- Expanded automated integration and end-to-end testing.
- More comprehensive API documentation.
- Improved operational reporting and analytics.
- Additional notification channels where required.
- Further accessibility and usability improvements.
- Production hardening, monitoring, and backup procedures.

These are possible future improvements, not claims about features already implemented.

---

## Contributing

1. Clone the repository.
2. Create a separate branch for your changes.
3. Follow the existing frontend and backend conventions.
4. Test the affected functionality.
5. Verify the production build and relevant backend tests.
6. Submit a pull request with a clear description of the change.

## License

No license has been specified in this README. Refer to the repository's licensing requirements before redistributing or using the project outside its intended academic or development context.

---

**Repository:** [shiwankarprisha/rrcms-pbl-project](https://github.com/shiwankarprisha/rrcms-pbl-project)
