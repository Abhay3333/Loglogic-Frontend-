# LogLogic — Frontend

The web dashboard for **LogLogic**, a multi-tenant B2B centralized logging platform. It provides authentication, workspace (organization) management, API-key generation, live log querying with charts, and team/invite management.

## Tech stack

| Concern | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | TailwindCSS 4 |
| Routing | React Router 7 |
| HTTP | axios |
| Auth | Supabase (`@supabase/supabase-js`) |
| Charts | recharts |
| Icons | react-icons |

## Requirements

- Node.js 18+
- A running [LogLogic backend](../Loglogic-Backend-) (locally on `http://localhost:5000`, or deployed)
- A Supabase project (same one the backend uses)

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

The app starts on `http://localhost:5173`.

## Environment variables

```bash
# Backend API origin (falls back to http://localhost:5000 if unset)
VITE_API_URL=http://localhost:5000

# Supabase (client-side — use the ANON key, never the service role key)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Routes & pages

| Path | Access | Purpose |
|---|---|---|
| `/login`, `/signup` | Public | Email/password + GitHub/Google OAuth (preserves `?redirect=`) |
| `/invite?token=...` | Public → JWT | Invitation landing; validates token, then accepts on sign-in |
| `/app/onboarding` | Auth | Create your first workspace |
| `/app/dashboard` | Auth | Log volume, level breakdown, charts |
| `/app/logs` | Auth | Query logs (filters, search, pagination) |
| `/app/settings` | Auth | API keys, team members, invites (owner-only send) |
| `/admin/*` | Owner/Admin | Admin-only screens (real Supabase session + role check) |

## Auth & invite flow

- Sessions are Supabase JWTs; axios attaches the token as `Authorization: Bearer <token>`.
- `AdminRoute` checks the live Supabase session **and** that the user is an `owner`/`admin` of some org — unauthenticated users go to `/login`, denied users to `/app/dashboard`.
- Accepting an invite while logged out stashes the token in `localStorage` (`loglogic_pending_invite`); after sign-in the user is routed back to `/invite?token=...` instead of onboarding, so invited users don't get forced into creating their own workspace.
- **Only the workspace owner** can send invites; the "Invite Member" button is disabled for everyone else.

## Deployment (Vercel)

1. Import the repo into Vercel; framework preset **Vite**.
2. Set the environment variables (`VITE_API_URL` → your deployed backend origin, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
3. Add your Vercel domain to the Supabase **Auth → URL Configuration** redirect URLs so OAuth and email links resolve.
4. Ensure the backend's `CLIENT_URL` / CORS origin matches your Vercel domain.
