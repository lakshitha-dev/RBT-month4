# AdminFlow Dashboard — Architecture Decisions

**Author:** Lakshitha · **Month 4 deliverable** · React 18 + TypeScript + Vite

## 1. Overview

AdminFlow is a single-page admin dashboard covering five features:

1. Authentication: login, logout and protected routes
2. Dashboard: metrics, a trend chart, recent activity and quick actions
3. User management: full CRUD with soft delete
4. Debounced search
5. Notifications: toasts plus a persistent inbox

| Concern | Choice | Why |
|---|---|---|
| Build | **Vite 8** | Fast dev server; route chunks split automatically |
| UI | **React 18.3 + TypeScript (strict)** | Required by the brief |
| Client/global state | **Zustand 5** | Minimal boilerplate, selector subscriptions, `persist` middleware |
| Server state | **TanStack Query 5** | Caching, background refetch, optimistic updates and retries |
| Routing | **React Router 6.30** (data router) | Nested layout routes and `lazy()` pages |
| Forms | **React Hook Form + Zod 4** | Uncontrolled inputs keep re-renders low; the schema is the single source of validation truth |
| Styling | **Tailwind CSS 4** | No runtime CSS-in-JS cost; class-based dark mode |
| Virtualisation | **@tanstack/react-virtual** | Long activity log |
| Component docs | **Storybook 10** + addon-a11y | 8+ documented components with automated a11y checks |
| Tests | **Vitest + Testing Library** | Stores, hooks, schema, mock API and modal focus behaviour |

## 2. Folder structure

```
src/
├── api/                 Mock backend: latency, localStorage persistence, ApiError
│   ├── auth.ts users.ts dashboard.ts db.ts seed.ts client.ts
├── components/
│   ├── common/          Design-system primitives (+ *.stories.tsx)
│   ├── layout/          AppLayout, Sidebar, Topbar, ProtectedRoute, ErrorBoundary, PageHeader…
│   └── features/        auth/, dashboard/, users/, notifications/
├── hooks/               useDebounce, useFocusTrap, useUsers, useDashboard, useUsersQueryParams…
├── lib/queryClient.ts   React Query client configuration
├── pages/               One lazily loaded component per route
├── schemas/             Zod schemas (user, wizard steps, login)
├── stores/              Zustand: authStore, uiStore, notificationStore
├── types/               Shared domain types
├── utils/               Formatting, CSV export, ids
├── routes.tsx           Router definition (code-split)
└── App.tsx              Providers: ErrorBoundary → QueryClient → Router + Toaster
```

## 3. State management strategy

State is split by **ownership and lifetime**, not put into one global store:

| Kind of state | Where it lives | Examples |
|---|---|---|
| **Server state** (owned by the backend; cached copy on the client) | TanStack Query | users list pages, user detail, metrics, trend, activity |
| **Global client state** (needed by distant components) | Zustand | session (`authStore`), theme and mobile drawer (`uiStore`), toasts and inbox (`notificationStore`) |
| **URL state** (shareable, survives reload, works with Back) | `useSearchParams` via `useUsersQueryParams` | search term, role/status filters, sort, page, page size, show-deleted |
| **Local UI state** | `useState` | open modals, wizard step, live search text, chart range |
| **Form state** | React Hook Form | field values, touched/dirty flags, validation errors |

### Why Zustand over Redux Toolkit

- The global client state is small and has no complex cross-slice workflows. Three focused stores read more clearly than one reducer tree.
- Selector subscriptions such as `useAuthStore((s) => s.user)` re-render only the components that use the selected slice. No Provider is needed, so stores also work outside React: the `notify()` helper is called from mutation callbacks.
- `persist` + `partialize` persist only what should survive a reload. That is the session, the theme and the notification inbox, but never `isLoading`, `error` or toasts.

### Why server data is *not* in Zustand

Copying API responses into a global store means hand-writing caching, invalidation, loading/error flags and race handling. React Query provides all of that. Its query-key factory (`usersKeys`) gives targeted invalidation: `invalidateQueries({ queryKey: usersKeys.all })` after any user mutation.

### Store designs

```ts
// stores/authStore.ts (matches the brief's AuthState interface, plus error handling)
interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}
```

- `notificationStore` keeps two collections: `toasts` (transient, never persisted) and `notifications` (persistent inbox, capped at 50). A single `notify()` can feed either or both through the `toast` / `inbox` flags.
- `uiStore.setTheme` updates the `<html>` class. An inline script in `index.html` applies the stored theme **before first paint**, which avoids a flash of the wrong theme. `watchSystemTheme()` follows OS changes when the theme is set to "system".

## 4. Data flow and the mock API

There is no real backend. `src/api/*` simulates one, with these properties:

- **Random latency** (250–650 ms), so loading states are real and visible.
- **localStorage persistence**, so CRUD changes survive a reload. *Settings → Reset demo data* restores the seed data.
- **Deterministic seed data** (seeded PRNG), the same on every machine: 124 users, 500 activity events and 90 days of trend data.
- **Typed `ApiError` with status codes.** For example, a duplicate email returns 409. The React Query `retry` setting skips retries for 4xx errors.
- **Responses are cloned** (`structuredClone`), so components can never mutate the "database".

To replace the mock with a real API, rewrite the function bodies in `src/api/`. Hooks, stores and components do not change.

### Optimistic updates (Update / Delete / Restore)

`useUpdateUser` and `useDeleteUser` handle the cache in four steps:

1. `onMutate`: cancel in-flight user queries, snapshot every cached list page and the detail entry, then patch the user in place.
2. The UI reflects the change immediately. The edit modal closes at once, and the row shows its new values.
3. `onError`: restore the snapshot and show an error toast.
4. `onSettled`: invalidate the cache, so the server's version is authoritative.

### Soft delete

`deleteUser` sets `deletedAt` and does not remove the record. Deleted users are hidden by default. *Show deleted users* reveals them with a **Restore** action. The success toast also offers **Undo**. That undo path is deliberately not tied to a component lifecycle, because the toast outlives the page that triggered it.

### Debounced search

```
input (local state, instant) ──useDebounce(300ms)──▶ URL ?q= ──▶ query key ──▶ listUsers()
```

The text box stays responsive. A request is issued only after 300 ms of inactivity. `placeholderData: keepPreviousData` keeps the previous results visible, so the table does not flash. A `role="status"` region announces "N users found". The Activity page reuses the same `useDebounce` hook for client-side filtering.

## 5. Component architecture

| Pattern | Where |
|---|---|
| **Atomic design**: atoms → molecules → organisms → pages | `common/` atoms (Button, Input, Badge, Spinner) → molecules (Select with label/error, Pagination, Alert) → organisms in `features/` (UsersTable, UserWizard, TrendCard) → `pages/` |
| **Container / presentational** | `UsersPage` (container: query params, queries, mutations, modal state) feeds the presentational `UsersTable`, `UserFilters` and `DeleteUserDialog`. Presentational components receive data and callbacks and never fetch. |
| **Compound components** | `Card` + `Card.Header/Body/Footer`; `Tabs` + `Tabs.List/Tab/Panel`, with internal context for shared state and ARIA id wiring |
| **Custom hooks** (the modern alternative to render props) | `useDebounce`, `useFocusTrap`, `useUsersQueryParams`, `useUsers*`, `useDashboard*`, `useDocumentTitle` |
| **Render functions** | `Table` takes a `Column<T>.render(row)` per column, a render-prop-style API that keeps the table generic (`Table<T>`) |
| **Error boundaries** | Global boundary in `App` + per-route boundary in `AppLayout`, reset on navigation (`resetKeys=[pathname]`) |

## 6. Routing and authentication

```
/login                 LoginPage (public; redirects to `from` once signed in)
/                      ProtectedRoute → AppLayout (sidebar, topbar, <Outlet/>)
  index                DashboardPage
  users                UsersPage
  users/new            UserCreatePage (3-step wizard)
  activity             ActivityPage (virtualised)
  notifications        NotificationsPage
  settings             SettingsPage
  *                    NotFoundPage
```

- `ProtectedRoute` redirects unauthenticated users to `/login` with `state.from`. After login, the user returns to the page they originally requested, including its query string.
- **Logout** clears the session and calls `queryClient.clear()`, so cached data never leaks to the next user.

## 7. Forms and validation

- The Zod schemas in `schemas/` are the single source of validation rules. `userSchema` matches the brief: name ≥ 2 characters, valid email, role enum, `isActive` boolean.
- `zodResolver` plus `mode: 'onTouched'` means errors appear after the user leaves a field, not while they type.
- The `Input`, `Select` and `Checkbox` components set `aria-invalid` and link the error text with `aria-describedby`. RHF's `shouldFocusError` moves focus to the first invalid field when a submit fails.
- **Multi-step wizard** (`UserWizard`): one form instance with a combined schema. Each step calls `trigger(stepFields)` before advancing. Enter on an intermediate step advances to the next step instead of submitting. On each step change, focus moves to the step heading. A 409 duplicate-email error from the server returns the user to step 1 and attaches the error to the email field.

## 8. Performance decisions

| Technique | Implementation |
|---|---|
| Route-level code splitting | Every page is `lazy()` and wrapped in `<Suspense>` inside the layout. RHF and Zod (~35 kB gzip) load only with the login page and user forms. |
| No heavy chart or icon libraries | Hand-written SVG `LineChart` and inline SVG icons (no recharts/d3/icon-pack weight) |
| Memoisation where it is measurable | Table rows are `memo` with memoised column definitions; `MetricCard`, `ActivityItem`, `NotificationItem` and `LineChart` are `memo`; chart geometry uses `useMemo` |
| Virtual list | The 500-event activity log renders only the visible rows (+ overscan) |
| No layout shift | Skeletons match the final layout; `keepPreviousData` avoids empty-table flashes (CLS ≈ 0) |
| Deferred DOM | The chart's data table renders only when its `<details>` is opened |
| Off-screen rendering skipped | `content-visibility: auto` (`defer-offscreen` utility) on below-the-fold sections, so phones skip their layout and paint until scrolled near. Content stays in the accessibility tree. |
| State colocation | Each dashboard widget owns its query (`MetricsSection`, `TrendCard`, `RecentActivity`), so one widget's data arriving re-renders only that widget |
| Cheap sorting | One shared `Intl.Collator` instead of `String#localeCompare`, which builds a collator per comparison |
| Cheap paint | System font stack (no web-font request); no `backdrop-filter` on the sticky header |
| Server-state caching | `staleTime: 30s`; no refetch on window focus |

### How the performance work was driven

Lighthouse showed mobile Total Blocking Time as the only weak metric; FCP, LCP, CLS and Speed Index were all green. CPU profiles and DevTools traces of a throttled load showed no JavaScript hotspot. App code was ~250 ms of 4×-throttled CPU; the rest was **layout passes** triggered as each widget swapped from skeleton to content. The fixes above target exactly that. Speculative micro-optimisation was avoided ("profile before optimising").

Results: see [lighthouse/summary.md](lighthouse/summary.md).

## 9. Quality and tooling

- TypeScript `strict`, `noUnusedLocals`/`Parameters`, path alias `@/`.
- ESLint with `typescript-eslint`, `react-hooks` and `jsx-a11y` rules.
- Vitest unit tests (`npm test`, 17 tests): auth store, notification store, `useDebounce`, `userSchema`, mock users API (pagination/sort/filter, duplicate email, soft delete and restore), the Modal (labelling, focus trap, Esc, focus restore) and the user wizard (step validation, Enter to advance, focus on the step heading, final payload).
- Storybook (`npm run storybook`): **14 components**, each with its own auto-generated docs page (props table from TypeScript types plus JSDoc) and example stories: Button, Input, Select, Checkbox, Modal, Card, Table, Pagination, Alert, Tabs, Badge, Spinner, Skeleton, Avatar. Interaction tests (`play` functions) cover Button, Checkbox, Modal, Table, Pagination and Tabs. The a11y addon runs axe on every story.
- `npm run a11y` runs axe-core on every route and interactive state in both themes. `npm run lighthouse` produces the Lighthouse reports and PDF.

## 10. Trade-offs and next steps

- **Mock backend.** Swapping in a real REST API means changing only `src/api/`. A real backend would also need token refresh, route guards based on server-side roles, and MSW for tests.
- **Native `<select multiple>`** was chosen for the multi-select because it is fully accessible out of the box. A custom combobox (ARIA 1.2 pattern) would look nicer but needs considerably more a11y work.
- **State normalisation.** Server data is cached per query (list pages keyed by their full query, plus one detail entry per user id) rather than in a normalised entity store. The optimistic helpers keep these consistent by patching the user in every cached page and the detail entry, then invalidating. A normalised store (an `ids` + `entities` map) would only pay off with many cross-referencing entity types.
- **Offline milestones** (before Month 5): i18n (`react-i18next`; UI strings are currently inline in components and would be extracted to message catalogues), WebSocket notifications (`notificationStore.notify` is already callable from outside React), Playwright E2E, further bundle analysis.

## 11. Evidence map against the Month 4 rubric

Where to find the evidence for each rubric criterion (paths are relative to the app zip).

### Feature completeness (25)

| Criterion | Evidence |
|---|---|
| Authentication: login, logout | `stores/authStore.ts` (`login`/`logout`, persisted session), `pages/LoginPage.tsx`, `components/features/auth/LoginForm.tsx` (RHF + Zod), logout in `components/layout/Topbar.tsx` (also clears the query cache) |
| Protected routes | `components/layout/ProtectedRoute.tsx`: redirects to `/login` with `state.from` and returns there after sign-in |
| Dashboard with data viz | `pages/DashboardPage.tsx`: 4 metric cards, an accessible SVG `LineChart` (7/30/90-day `Tabs`, revenue/orders switch, data-table alternative), recent activity, quick actions (add user, manage users, CSV export, mark all read) |
| CRUD | List: pagination, sorting, role/status filters, page size (`pages/UsersPage.tsx`, `UsersTable`, `UserFilters`). Create: 3-step validated wizard with a success toast (`UserWizard`). Update: pre-filled modal form with an optimistic update and rollback (`UserForm`, `useUpdateUser`). Delete: confirmation `alertdialog`, soft delete, Undo, Restore (`DeleteUserDialog`, `useDeleteUser`, `useRestoreUser`) |
| Search with debouncing | `hooks/useDebounce.ts` (300 ms; unit-tested) → URL `?q=` → React Query key; a live region announces the result count. Also used for the activity-log search |
| Notification system | `stores/notificationStore.ts` (toasts + persistent inbox, unread count), `Toaster` (polite/assertive live regions, pause on hover/focus, Undo actions), `NotificationBell` popover, `pages/NotificationsPage.tsx` (All/Unread tabs) |
| UX | Optimistic edits, `keepPreviousData` (no table flash), skeletons sized like real content (CLS ≈ 0), toasts for every mutation, focus moved to where the user expects it, light/dark/system theme |
| Error states | Global + per-route `ErrorBoundary` with retry; every query widget renders an error `Alert` with **Retry**; mutation failures roll back and toast; server validation (409 duplicate email) is mapped onto the email field; 404 page |

### State management (20)

| Criterion | Evidence |
|---|---|
| Store design | Three focused Zustand stores with typed state and actions (`authStore`, `uiStore`, `notificationStore`). `persist` + `partialize` persist only durable data. Transient flags (`isLoading`, `error`, toasts) are never persisted |
| Local vs global vs server | §3 table: server data in React Query; cross-cutting client state in Zustand; filters and pagination in the URL; open modals and wizard step in local state; form state in RHF |
| Derived values | Computed rather than stored: `selectUnreadCount`, `selectIsAuthenticated`, `hasFilters`, chart summary and geometry (`useMemo`), dashboard metrics (computed by the API layer from the data) |
| Selectors and renders | Components subscribe to single slices (`useAuthStore((s) => s.user)`), never the whole store. Stable `mutate` references. `memo` rows/cards with `useMemo` column definitions. Queries colocated per widget so one response re-renders only its widget |

### Accessibility (20)

Full audit: `lakshitha-month4-accessibility.md`. Results: axe-core found 0 violations in 26 scenario/theme runs, a 320 px reflow check passed, 10/10 scripted keyboard journeys passed, and Lighthouse accessibility scored 100 on every page.

### Performance (20)

| Criterion | Evidence |
|---|---|
| Lighthouse 90+ | **Performance 99–100 on every page** (mobile: Login 100, Dashboard 99, Users 99; desktop: 100 on all three). Accessibility, Best Practices and SEO are 100 on every run. Mobile: FCP 0.8 s, LCP ≤ 1.6 s, TBT 80–120 ms, CLS ≤ 0.009. Median of 3 runs per page and profile; see `lakshitha-month4-lighthouse.pdf` and `docs/lighthouse/summary.md` |
| Bundle / code splitting | Every route `lazy()` + `Suspense`; RHF/Zod and the virtualiser load only on the routes that use them; no chart or icon libraries (hand-written SVG); system fonts |
| Load time and rendering | `memo`/`useMemo` where profiling showed benefit, virtualised 500-row activity log, `content-visibility` for off-screen sections, no raster images (SVG only) |

### Component library (10)

14 components in Storybook (§9). Each has an auto-generated **Docs** page with a props table and several example stories, plus `play` interaction tests and axe checks.

### Code quality (5)

TypeScript `strict` with no `any` in app code; ESLint (TS, React Hooks, jsx-a11y) clean; 17 unit tests; the folder structure follows the brief (`components/common|layout|features`, `hooks`, `stores`, `pages`, `utils`, `types`) plus `api/`, `schemas/` and `lib/`.
