# OKC Observership (USCE) Portal

Full-stack scaffold for a clinical rotation portal in Oklahoma City.

## Stack
- Frontend: React (Vite), Tailwind CSS, Lucide icons
- UI: Shadcn-style reusable components (Tabs, Dialog, Card, Table, Badge)
- Backend: Node.js + Express with a Supabase/PostgreSQL-ready service layer

## Routes
- `/` Landing page
- `/apply` Visa/travel-gated multi-step application
- `/student` Student dashboard (status timeline + document vault)
- `/admin/login` Admin login (`okcadmin`)
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
