# Implementation Checklist

Progress against the challenge brief. Each item links to where it is implemented.

## Part 1 — Application setup

- [x] Vite + React 18 + TypeScript (strict): `vite.config.ts`, `tsconfig.app.json`
- [x] Zustand: `src/stores/` (auth, ui, notifications)
- [x] React Router v6: `src/routes.tsx`
- [x] React Query for server state: `src/lib/queryClient.ts`, `src/hooks/useUsers.ts`, `src/hooks/useDashboard.ts`
- [x] React Hook Form + Zod: `src/schemas/`, `UserForm`, `UserWizard`, `LoginForm`
- [x] Tailwind CSS 4 with class-based dark mode: `src/index.css`
- [x] Folder structure per the brief (`components/common|layout|features`, `hooks`, `stores`, `pages`, `utils`, `types`)

## Part 2 — Core features

- [x] **Auth:** login, logout, `ProtectedRoute` with redirect back to the requested page, persisted session
- [x] **Dashboard:** metric cards (users, revenue, orders, conversion), line chart (7/30/90-day tabs, metric switch), recent activity, quick actions
- [x] **Users — List:** pagination, sorting (`aria-sort`), filtering (role, status, show deleted), page size
- [x] **Users — Create:** 3-step wizard with validation and a success toast
- [x] **Users — Update:** pre-filled modal form with an **optimistic update** and rollback on error
- [x] **Users — Delete:** confirmation `alertdialog`, **soft delete** (`deletedAt`), Undo toast, Restore
- [x] **Search with debouncing:** `useDebounce(300ms)` → URL `?q=` → query key; live result count
- [x] **Notifications:** toasts (polite/assertive live regions, pause on hover/focus) and a persistent inbox (bell popover + page)

## Part 3 — Forms & validation

- [x] React Hook Form setup with `zodResolver`
- [x] Zod schemas: `userSchema` (per the brief), `loginSchema`, wizard step schemas
- [x] Error display: `aria-invalid`, `aria-describedby`, focus on the first invalid field; server errors (409 duplicate email) mapped to fields
- [x] Multi-step form wizard: per-step `trigger()`, step indicator with `aria-current="step"`, focus moves to the step heading

## Part 4 — Accessibility & performance

- [x] ARIA labels and roles: icon buttons labelled, icons `aria-hidden`, landmarks, `role="status"`/`alert`
- [x] Keyboard navigation: skip link, Tabs with arrow keys, Esc closes dialogs/menus, scrollable regions focusable
- [x] Focus management: modal focus trap + restore, route-change focus to `<h1>`, focus after delete
- [x] Loading states (skeletons, spinners, `aria-busy`) and error boundaries (global + per route)
- [x] Code splitting and lazy loading: every route `lazy()`
- [x] Memoisation (`memo` rows/cards, `useMemo` columns/chart) and a virtual list (activity log)
- [x] Dark mode toggle (bonus) with no flash on load

## Deliverables

- [x] Working SPA
- [x] State management setup (Zustand + React Query)
- [x] Storybook library (14 components, each with a docs page + props table): Button, Input, Select, Modal, Card, Table, Alert, Tabs + Pagination, Checkbox, Badge, Spinner, Skeleton, Avatar
- [x] Lighthouse report: `docs/lighthouse/` (`npm run lighthouse`)
- [x] Accessibility audit: `docs/lakshitha-month4-accessibility.md`
- [x] Architecture decisions: `docs/lakshitha-month4-architecture.md`

## Offline milestones (before Month 5)

- [ ] Internationalisation (i18n)
- [ ] Real-time notifications over WebSockets
- [ ] Further bundle-size optimisation (bundle analysis)
- [ ] End-to-end tests with Playwright
- [ ] Open-source React contribution (1 merged PR)
- [x] Dark mode toggle (done in-session)
