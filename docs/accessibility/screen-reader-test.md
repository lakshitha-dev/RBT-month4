# Screen-reader test — NVDA + Chrome

Real screen-reader test of the production build. **Result: 30/30 steps pass after fixing 3 issues the test uncovered.**

| | |
|---|---|
| Screen reader | **NVDA 2026.2** (default settings except where noted), OneCore voice |
| Browser | Chrome (stable), real visible window, Windows 11 |
| Build | Production build served by `vite preview` |
| Date | 2026-11-02 |

## Method

NVDA ran for real and spoke aloud. Each step was performed with **real OS-level keystrokes**: Tab, Enter, Esc, arrows, and NVDA's own browse-mode keys `H`, `D`, `T`, `G` and `Ctrl+Alt+arrows`. NVDA processed them exactly as if typed by a user. What NVDA said was captured from its speech log (log level *Input/output*) and matched to each step by timestamp. The quotes below are NVDA's actual output, with `|` separating speech chunks.

Two NVDA behaviours shaped the re-tests:

- **Automatic "say all" on page load.** It is on by default. NVDA keeps reading, and moving its cursor, after a page loads. Steps that depend on cursor position (skip link, heading navigation) were re-run with *Browse mode → Automatic Say All on page load* turned off, which many screen-reader users do.
- **Focus on load.** NVDA places its cursor on the first element, the skip link, and announces it. Pressing Enter at that point activates it. Pressing Tab moves to the *next* element.

## Results

| # | Step | NVDA said (abridged) | Result |
|---|---|---|---|
| **Login** ||||
| 1 | Load `/login` | "Sign in · AdminFlow" | ✅ |
| 2 | Tab into the form | "Email \| edit \| required \| blank" → "Password \| edit \| protected \| required \| blank" | ✅ |
| 3 | Submit the empty form | Focus to Email: "Email \| edit \| required \| invalid entry \| Email is required" | ✅ |
| 4 | Wrong password | "alert \| Error: Sign in failed. Invalid email or password." | ✅ |
| 5 | Correct password | "Welcome back, Alex!" (toast) → "Dashboard · AdminFlow \| document" | ✅ |
| **Dashboard** ||||
| 6 | Skip link (load → Enter) | "Skip to main content \| link" → Enter → "main landmark \| Dashboard \| heading \| level 1 \| Good to see you, Alex…" (focus on `<main>`, 2/2 trials) | ✅ |
| 7 | `D` landmarks | "banner landmark" → "main landmark" → "Key metrics \| region" → "Notifications \| region"; sidebar is "complementary landmark \| Main \| navigation landmark" | ✅ |
| 8 | `H` headings from the top | Dashboard h1 → Key metrics h2 → Total users / Revenue (30d) / Orders (30d) / Conversion rate h3 → Performance trend h2 → Quick actions h2 | ✅ |
| 9 | Metric card content | "Total users \| heading \| level 3" → "124" → "Up 4.2% vs last period" | ✅ *(fixed, F1)* |
| 10 | `G` to the chart | "Revenue trend \| graphic \| Revenue from Oct 4 to Nov 2: up 53.2%. Highest $13,663 on Oct 26, lowest $8,670 on Oct 18, latest $13,422." | ✅ |
| 11 | Range tabs | "Date range \| tab control" → "30 days \| tab \| selected \| 2 of 3" → `→` → "90 days \| tab \| selected \| 3 of 3"; the chart summary updates to the 90-day range | ✅ |
| 12 | Chart data table | "View chart data as a table \| button \| collapsed" → "expanded" → `T` → "Revenue per day, last 90 days \| table \| with 91 rows and 2 columns" | ✅ |
| 13 | Bell button | "banner landmark \| Notifications, 2 unread \| button \| collapsed" | ✅ |
| 14 | Open / Esc | "expanded" → "collapsed" (focus back on the bell) | ✅ |
| 15 | Sidebar → Users | "main landmark \| Users \| heading \| level 1" (focus moved to the new page's h1) → "124 users found" | ✅ |
| **Users** ||||
| 16 | Debounced search "perera" | "Search users \| edit \| Name, email or department" … typing … "Updating results…" → "7 users found" | ✅ |
| 17 | `T`, arrow into the table, `Ctrl+Alt+→/↓` | "Users \| table \| with 11 rows and 6 columns \| caption \| Users" → "row 1 \| column 1 \| button \| Name" → "column 2 \| Email" → … → "Ravi Johnson \| row 2 \| Inactive" (the row header is announced with each cell) | ✅ |
| 18 | Sort by Name | "Name \| button" → "Updating results…" → "sorted ascending" → "7 users found" | ✅ |
| 19 | Open Edit dialog | "Edit user \| dialog \| Update details for Farah Perera." → "Fields marked with an asterisk are required." | ✅ *(fixed, F2)* |
| 20 | Tab inside dialog | Full name → Email → "Role \| combo box \| Editor" → "Active account \| check box" → Cancel → Close dialog → (wraps). Save is disabled until something changes, so it is skipped | ✅ |
| 21 | Edit name, Enter | Dialog closes; focus back on "Edit Farah Perera Jr \| button"; "User updated. Farah Perera Jr was saved." | ✅ |
| 22 | Open Delete dialog | "Delete user? \| dialog \| Farah Perera Jr will be moved to deleted users and lose access. You can restore them later." Focus on "Cancel \| button" | ✅ |
| 23 | Confirm delete | "All users \| heading \| level 2" (focus moved because the row disappears); "User deleted … Undo"; "6 users found" | ✅ |
| **Add-user wizard** ||||
| 24 | Continue with empty fields | "Full name \| edit \| required \| invalid entry \| Name must be at least 2 characters" | ✅ |
| 25 | Fill step 1, Enter in a field | Email hint and error read together; "Department \| combo box \| Select a department \| … \| invalid entry"; Enter → "Step 2 of 3: Role & access \| heading \| level 2" | ✅ |
| 26 | Review step | "Step 3 of 3: Review"; "list with 12 items \| Name \| Screen Reader \| Email \| sr.tester@example.com \| … \| Role \| User" | ✅ *(fixed, F3)* |
| 27 | Confirm and create | "check box \| checked" → "Create user \| button \| unavailable \| busy" → "User created…" → "Users \| heading \| level 1" | ✅ |
| **Other** ||||
| 28 | Activity log | "504 events" (status) → "Activity events \| region \| list \| with 17 items" → items read in full ("Alex Admin created user Screen Reader \| just now") | ✅ *(see note)* |
| 29 | Settings theme radios | "Theme \| grouping" → "Dark, Dark background, easier on the eyes at night. \| radio button \| not checked \| 2 of 3" | ✅ |
| 30 | Theme toggle | "Theme: System. Switch to Light theme \| button" | ✅ |

## Issues found and fixed

| # | What NVDA said | Cause | Fix |
|---|---|---|---|
| F1 | "124 … **Up4.2%vs last period**" (words run together) | The trend text was split into flex items with no real whitespace between them | One sr-only sentence ("Up 4.2% vs last period"); the visual pieces are `aria-hidden` |
| F2 | "**Fields marked as required are required.**" | The sr-only replacement for the `*` was worded badly | Now reads "Fields marked **with an asterisk** are required." |
| F3 | "Email \| **Sr.Tester@Example.Com**" | CSS `capitalize` was applied to every review value, mangling emails (a visible bug too; the Settings profile had the same issue) | Only the role is title-cased; names and emails keep their real casing |

After the fixes, steps 9, 19, 26 and the Settings profile were re-run with NVDA, and all read correctly (rows 9, 19, 26 above). None of these issues were found by axe, Lighthouse or the keyboard tests. Each needed a real screen reader.

## Notes and limitations

- **Virtualised activity log (step 28).** NVDA reports "list with 17 items" because only the visible window of the 500 events is in the DOM. Items are fully readable and the total ("504 events") is announced. The search box is the efficient way to find a specific event. This is the known trade-off of virtualisation.
- **alertdialog wording.** NVDA announces the delete confirmation as "dialog". That is NVDA's normal wording for `role="alertdialog"`; the content and initial focus are correct.
- **Not tested:** JAWS, Narrator, VoiceOver (macOS/iOS) and TalkBack. The app uses only standard ARIA patterns, but those screen readers were not run.
