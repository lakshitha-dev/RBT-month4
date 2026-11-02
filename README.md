# AdminFlow Dashboard

An admin dashboard SPA for a SaaS platform: the Month 4 Engineer-track challenge (React, state management, accessibility, performance).

**Stack:** React 18 · TypeScript · Vite · Zustand · TanStack Query · React Router 6 · React Hook Form + Zod · Tailwind CSS 4 · Storybook 10 · Vitest

## Submission (Month 4)

**Participant:** Lakshitha · **Session:** Month 4, Frontend Architecture & State Management

| # | Deliverable | File |
|---|---|---|
| 1 | Working SPA (React project) | [`submission/lakshitha-month4-app.zip`](submission/lakshitha-month4-app.zip), or this repository itself |
| 2 | Storybook build (14 components) | [`submission/lakshitha-month4-storybook.zip`](submission/lakshitha-month4-storybook.zip) (unzip, open `index.html`) |
| 3 | Lighthouse report | [`submission/lakshitha-month4-lighthouse.pdf`](submission/lakshitha-month4-lighthouse.pdf) |
| 4 | Accessibility audit | [`submission/lakshitha-month4-accessibility.md`](submission/lakshitha-month4-accessibility.md) |
| 5 | Architecture decisions | [`submission/lakshitha-month4-architecture.md`](submission/lakshitha-month4-architecture.md) (§11 maps every rubric criterion to its evidence) |

**Results at a glance**

- **Lighthouse (final build, median of 3 runs):** Performance 99–100 on every page, mobile and desktop. Accessibility, Best Practices and SEO are 100. CLS is 0 on mobile.
- **Accessibility:** axe-core found 0 WCAG 2.1 AA violations in 26 runs (light and dark themes, plus a 320px reflow check); 10/10 keyboard-only journeys pass; a real **NVDA** screen-reader test passes, with every issue it found (F1–F9) fixed and re-verified by ear ([report](docs/accessibility/screen-reader-test.md)).
- **Component library:** 14 documented components in Storybook (8 required), each with a props table, example stories, interaction tests and axe checks.
- **Code quality:** TypeScript strict with no `any`; ESLint clean; 17 unit tests.

## Features

- **Authentication:** login with validation, logout, protected routes that redirect back after sign-in, persisted session
- **Overview:** the screen's finding first ("27 of 124 accounts are inactive" with Review inactive); a page-level 7/30/90-day range driving one divided KPI strip (members, revenue, orders, conversion) and an accessible SVG trend chart with a data-table alternative; recent activity; quick actions; and a **workspace roster** that shows everyone by department, active or inactive
- **User management (CRUD):** status tabs with counts (All / Active / Inactive / Deleted), server-style pagination, sortable columns, a role filter, a 3-step create wizard, an edit modal with **optimistic updates**, **soft delete** with confirmation, Undo and Restore
- **Debounced search:** 300 ms `useDebounce`, synced to the URL, with result counts announced to screen readers; plus a global **Search people** field in the top bar (Ctrl+K / ⌘K)
- **Notifications:** accessible toasts (pause on hover/focus) plus a persistent inbox (bell menu and Notifications page)
- **Extras:** dark mode (light/dark/system, no flash on load), a virtualised activity log with a breakdown by kind and person, error boundaries, size-matched loading placeholders (no layout shift), responsive mobile-first layout

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
| `npm run package` | Rebuild the five submission files in `submission/` |

## Documentation

See [`docs/`](docs/README.md):

- [Session overview](docs/01-session-overview.md) and [challenge brief](docs/02-challenge-brief.md)
- [Implementation checklist](docs/03-implementation-checklist.md)
- [Architecture decisions](docs/lakshitha-month4-architecture.md)
- [Accessibility audit](docs/lakshitha-month4-accessibility.md)
- [Lighthouse results](docs/lighthouse/summary.md)
