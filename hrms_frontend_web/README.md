# SmartHR AI — Frontend (Next.js)

Retro-themed, mobile-responsive HRMS UI with:
- Auth screens (login/register demo)
- Role-based navigation (Admin / HR / Manager / Employee)
- Dashboards per role
- Core modules: Employees, Attendance, Leaves, Approvals, Holidays, Payroll, Audit Logs

## Configure backend URL

Create `.env.local` (or set environment variables) based on `.env.example`:

- `NEXT_PUBLIC_API_BASE_URL` — FastAPI backend base URL (e.g. `http://localhost:3001`)

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Note about API integration

The downloaded backend OpenAPI spec currently only exposes `/` health check.
The UI is implemented end-to-end with local demo state and is ready to be wired to real endpoints as soon as they are available.
