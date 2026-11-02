# AdminFlow Dashboard

An admin dashboard SPA for a SaaS platform: the Month 4 Engineer-track challenge (React, state management, accessibility, performance).

**Stack:** React 18 · TypeScript · Vite · Zustand · TanStack Query · React Router 6 · React Hook Form + Zod · Tailwind CSS 4 · Storybook 10 · Vitest

## Features

- **Authentication:** login with validation, logout, protected routes that redirect back after sign-in, persisted session
- **Dashboard:** metric cards (users, revenue, orders, conversion), an accessible SVG trend chart with 7/30/90-day tabs and a data-table alternative, recent activity, quick actions (add user, CSV export…)
- **User management (CRUD):** server-style pagination, sortable columns, role/status filters, a 3-step create wizard, an edit modal with **optimistic updates**, **soft delete** with confirmation, Undo and Restore
- **Debounced search:** 300 ms `useDebounce`, synced to the URL, with result counts announced to screen readers
- **Notifications:** accessible toasts (pause on hover/focus) plus a persistent inbox (bell menu and Notifications page)
- **Extras:** dark mode (light/dark/system, no flash on load), a virtualised activity log (500 events), error boundaries, skeleton loading states, responsive mobile-first layout with a drawer menu

## Getting started

```bash
npm install
npm run dev          # http://localhost:5173
```

**Demo login:** `admin@adminflow.dev` / `Password123!` (or click *Fill in demo credentials*).

Data comes from an in-browser mock API with simulated latency, persisted to `localStorage`. *Settings → Reset demo data* restores the seed data.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production (`dist/`) |
| `npm run preview` | Serve the production build (http://localhost:4173) |
| `npm run lint` | ESLint (TypeScript, React Hooks, jsx-a11y) |
| `npm test` | Vitest unit tests |
| `npm run storybook` | Component library at http://localhost:6006 |
| `npm run build-storybook` | Static Storybook build (`storybook-static/`) |
| `npm run lighthouse` | Lighthouse (mobile + desktop, median of 3) → `docs/lighthouse/` and the PDF *(needs `npm run build` and a local Chrome)* |
| `npm run a11y` | axe-core WCAG 2.1 AA sweep of every route/state in both themes → `docs/accessibility/` *(needs `npm run build`)* |
| `npm run package` | Create the submission zips in `submission/` |

## Documentation

See [`docs/`](docs/README.md):

- [Session overview](docs/01-session-overview.md) and [challenge brief](docs/02-challenge-brief.md)
- [Implementation checklist](docs/03-implementation-checklist.md)
- [Architecture decisions](docs/lakshitha-month4-architecture.md)
- [Accessibility audit](docs/lakshitha-month4-accessibility.md)
- [Lighthouse results](docs/lighthouse/summary.md)
