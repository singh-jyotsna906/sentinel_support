# Sentinel Support Assignment

A modular, full-stack support and fraud detection platform with customer insights, alert triage, and evaluation capabilities.


## Key Components

- **Web Frontend (`api/web/`)**
  - Built with React and TypeScript
  - Pages: Dashboard, Alerts, Customer Timeline, Evals
  - Fetches data from backend APIs and renders insights, tables, and triage drawers

- **API Backend (`api/src/`)**
  - Express.js server with modular route handlers
  - Uses Prisma ORM for database access
  - Implements business logic, orchestrator, and agent flows
  - Handles authentication, rate limiting, and audit logging

- **Database**
  - PostgreSQL (schema managed via Prisma)
  - Stores customers, transactions, alerts, cases, etc.

- **Fixtures (`fixtures/`)**
  - Large test data files (customers, transactions, alerts, etc.)
  - Used for seeding and evaluation

---

## Data Flow

1. **User interacts with the React UI** (e.g., views alerts, customer timeline, or runs evals)
2. **Frontend makes REST API calls** to the Express backend
3. **Backend processes requests**:
   - Reads/writes to the database via Prisma
   - Loads fixture data for test/eval scenarios
   - Runs orchestrator/agents for triage and insights
4. **Results are returned as JSON** and rendered in the UI

---

## Directory Structure

```
Sentinel_support_assignment/
├── api/
│   ├── src/           # Express backend source code
│   ├── web/           # React frontend source code
│   ├── prisma/        # Prisma schema and migrations
│   └── .env           # Environment variables (not in git)
├── fixtures/          # Large test data files (ignored in git)
├── README.md          # This file
├── .gitignore         # Ignores large files, build artifacts, etc.
└── ...
```

---

## Notes

- Large fixture files are ignored in git via `.gitignore`
- For local development, run the backend and frontend servers separately
- See `api/README.md` for API and setup details

---

## Example: Customer Timeline Page

- Fetches paginated transactions and insights for a customer
- Renders transaction table, category spend, merchant mix, and anomalies

---

## Example: Alerts & Triage

- Alerts page lists open alerts
- Triage drawer allows actions (freeze card, open dispute, etc.)
- Actions are logged and processed via backend APIs

---

## Example: Evals

- Evals page shows pass/fail results for test cases
- Confusion matrix and top policy denials are displayed

---

## Contact

For questions or contributions, please open an issue or pull request on the repository.
