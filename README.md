# OKC Observership (USCE) Portal

Full-stack scaffold for a clinical rotation portal in Oklahoma City.

## Stack
- Frontend: React (Vite), Tailwind CSS, Lucide icons
- UI: Shadcn-style reusable components (Tabs, Dialog, Card, Table, Badge)
- Backend: Node.js + Express with a Supabase/PostgreSQL-ready service layer

## Routes
- `/` Landing page
- `/apply` Visa/travel-gated multi-step application
- `/student/login` Student login
- `/student` Student dashboard (status timeline + document vault, protected)
- `/admin/login` Admin login (env-configured bootstrap admin)
- `/admin` Protected admin dashboard (filters, detail side-panel, status controls)

## Run
1. Install dependencies:
   - `npm install`
2. Start frontend + backend together:
   - `npm run dev:full`

Frontend runs at `http://localhost:5173` and backend at `http://localhost:4000`.

## Replit Design Mode
- `data-design-mode="true"` is added on page containers and app shell.
- Open preview, then switch to the **Design** tab to tweak sections visually.
- The OKC pitch and hero sections are structured for easy image/text replacement.

## Supabase/PostgreSQL Integration Point
- Start wiring DB client in:
  - `server/db/client.js`
- Service layer is in:
  - `server/services/applicantService.js`

## PostgreSQL Setup (Local)

1. Add `.env` with:
   - `DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<db>`
   - `JWT_SECRET=<long-random-secret-from-jwt.io>`
   - `ADMIN_BOOTSTRAP_EMAIL=<admin-login-id>`
   - `ADMIN_BOOTSTRAP_PASSWORD=<strong-password>`
2. Apply one-shot schema SQL:
   - `npm run db:init`
3. Seed/update admin user from env and remove old admin accounts:
   - `npm run admin:seed`
4. Start app:
   - `npm run dev:full`

### Notes

- `db_init.sql` is a convenience initializer for local setup.
- New student accounts are created during `/apply` submission:
   - Passwords are hashed with `bcrypt` (includes per-password salt).
   - A `users` row is created with `role='student'` and linked to `applicants.user_id`.
   - A JWT is issued for the student session.
- On backend startup, the configured bootstrap admin is upserted from `.env`.
