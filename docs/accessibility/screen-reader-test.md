# Screen-reader test: NVDA + Chrome

A real screen-reader test of the **redesigned** production build ("framed-sheet" design).
**Result: 30/30 steps pass after fixing the 6 issues the test found** (F4–F8 below). Two earlier runs, on the previous design, found and fixed F1–F3.

| | |
|---|---|
| Screen reader | **NVDA 2026.2**, OneCore voice |
| Browser | Chrome (stable) in app mode, real visible window, Windows 11 |
| Build | Production build served by `vite preview` |
| Date | 2026-11-02 |

## Method

NVDA ran for real and spoke aloud. Each step was performed with **real OS-level keystrokes**: Tab, Enter, Esc, arrows, Ctrl+K, and NVDA's own browse-mode commands `H`, `D`, `T`, `G` and `Ctrl+Alt+arrows`. NVDA processed them exactly as if typed by a user. Its speech was captured from its log (level *Input/output*) and matched to each step by timestamp. The quotes below are NVDA's actual output, with `|` separating speech chunks.

Test settings:

- **Automatic "say all" on page load was turned off.** It is on by default, and it keeps moving NVDA's cursor after a page loads, which makes cursor-dependent steps (the skip link, heading navigation) unrepeatable. Many screen-reader users turn it off.
- **Chrome ran in app mode** (no toolbar), so keyboard focus always starts in the page.

## Results

| # | Step | NVDA said (abridged) | Result |
|---|---|---|---|
| **Login** ||||
| 1 | Load `/login` | "Sign in · AdminFlow \| document" … "banner landmark \| AdminFlow" | ✅ |
| 2 | Tab through the form | "Theme: System. Switch to Light theme \| button" → "main landmark" → "form landmark" → "Email \| edit \| required \| blank" → "Password \| edit \| protected \| required \| blank" | ✅ |
| 3 | Submit the empty form | Focus to Email: "Email \| edit \| required \| invalid entry \| Email is required" | ✅ |
| 4 | Wrong password | "alert \| Error: Sign in failed. Invalid email or password." | ✅ |
| 5 | Correct password | "Welcome back, Alex!" (toast) → "Overview · AdminFlow \| document" | ✅ |
| **Overview** ||||
| 6 | Skip link (load → Enter) | "Skip to main content \| link" → Enter → "main landmark \| Overview \| heading \| level 1 \| 27 of 124 accounts are inactive and can't sign in. \| Review inactive \| link \| Add user \| button …" | ✅ |
| 7 | `D` landmarks | "complementary landmark \| AdminFlow" → "Main \| navigation landmark" → "banner landmark \| Search people \| search landmark" → "main landmark" → "Key metrics \| region" → "Recent activity \| region" → "Quick actions \| region" | ✅ |
| 8 | `H` heading outline | Overview h1 → Key metrics h2 → Members / Revenue / Orders / Conversion h3 → Revenue per day h2 → Recent activity h2 → Quick actions h2 → Workspace roster h2 | ✅ |
| 9 | KPI strip (new) | "Members \| heading \| level 3" → "**Members: 124. +5 joined in 30 days.**" → "**Revenue: $570,546. Up 10.9% vs prior 30 days.**" → "Orders: 7,554. Up 7.9% vs prior 30 days." | ✅ |
| 10 | `G` to the chart | "figure \| Revenue trend \| graphic \| Revenue from Oct 4 to Nov 2: up 50.3%. Highest $21,851 on Nov 2, lowest $14,292 on Oct 11, latest $21,851." | ✅ |
| 11 | Date range tabs (now page-level) | "Date range \| tab control" → "30 days \| tab \| selected \| 2 of 3" → `→` → "90 days \| tab \| selected \| 3 of 3" | ✅ |
| 12 | Workspace roster (new) | "Workspace roster \| heading \| level 2" → "124 people in 6 departments · 27 inactive" → "Legend \| list \| Active, Inactive" → "**Engineering: 22 of 25 active.**" → "Sales: 11 of 17 active." … | ✅ *(fixed, F4)* |
| 13 | Rail: recent activity | "Recent activity \| region \| heading \| level 2" → "list \| with 5 items \| Alex Admin signed in \| just now" | ✅ |
| 14 | Notification bell | "banner landmark \| Notifications, 2 unread \| button \| collapsed" → "expanded" → Esc → "collapsed" (focus back on the bell) | ✅ |
| 15 | People search shortcut (new) | `Ctrl+K` → "Search people \| search landmark \| Search people \| edit \| Control+K Meta+K \| Search people by name, email or department" → type, Enter → "Users \| heading \| level 1" → "7 users found" | ✅ *(fixed, F5)* |
| **Users** ||||
| 16 | Status tabs (new) | "Account status \| tab control" → "All 124 \| tab \| selected \| 1 of 4" → `→` → "Updating results…" → "Active 97 \| tab \| selected \| 2 of 4" → "97 users found" | ✅ |
| 17 | Toolbar search | "Filter users \| search landmark" → "Search users \| edit" … "Updating results…" → "7 users found" | ✅ |
| 18 | `T`, arrow in, `Ctrl+Alt+→/↓` | "Users \| table \| with 11 rows and 6 columns \| caption \| Users" → "row 1 \| column 1 \| button \| Name" → "column 2 \| button \| Role" → … → "**Farah Fernando, farah.fernando@adminflow.dev** \| row 2 \| Active" | ✅ *(fixed, F6)* |
| 19 | Sort by Name | "Name \| button" → "Updating results…" → "sorted ascending" → "7 users found" | ✅ |
| 20 | Edit dialog | "Edit user \| dialog \| Update details for Elena Kim." → Tab: Full name → Email → "Role \| combo box \| User" → "Active account \| check box \| checked" → Cancel → Close dialog (Save is disabled until a change) | ✅ |
| 21 | Edit and save | Dialog closes; focus back on "Edit Elena Kim Jr \| button"; "User updated. Elena Kim Jr was saved." | ✅ |
| 22 | Delete and confirm | "Delete user? \| dialog \| Elena Kim Jr will be moved to deleted users…" with focus on "Cancel \| button" → confirm → "Active users \| heading \| level 2" (focus moved because the row disappears) → "User deleted … Undo" → "6 users found" | ✅ |
| **Add-user wizard** ||||
| 23 | Continue with empty fields | "Full name \| edit \| required \| invalid entry \| Name must be at least 2 characters" | ✅ |
| 24 | Fill step 1, Enter in a field | Email hint and error read together; department combo box; Enter → "Step 2 of 3: Role & access \| heading \| level 2" | ✅ |
| 25 | Review step | "Step 3 of 3: Review" → "list with 12 items \| Name \| Screen Reader \| Email \| sr.tester@adminflow.dev \| … \| Role \| User" | ✅ |
| 26 | Confirm and create | "check box \| checked" → "Create user \| button \| unavailable \| busy" → "User created…" → "Users \| heading \| level 1" | ✅ |
| **Other screens** ||||
| 27 | Activity log and breakdown rail (new) | "Activity events \| region \| list" (items read in full) → "By kind of change \| region \| heading \| level 2" → "**Users updated: 185**" → "Users restored: 89" … | ✅ *(fixed, F7)* |
| 28 | Notifications tabs | "Filter notifications \| tab control" → "**All 3** \| tab \| selected \| 1 of 2" → `→` → "**Unread 2** \| tab \| selected \| 2 of 2" | ✅ *(fixed, F8)* |
| 29 | Settings theme radios | "Appearance \| region" → "Theme \| grouping" → "Dark, Dark background, easier on the eyes at night. \| radio button \| not checked \| 2 of 3" | ✅ |
| 30 | Top bar | "banner landmark \| Theme: System. Switch to Light theme \| button" → "Sign out \| button" | ✅ |
| 31 | Quick action with a count | "Quick actions \| region \| list \| **Mark all notifications read, 2 unread** \| button" | ✅ |

## Issues found and fixed

Found by this run on the redesigned build. F1–F3 were found and fixed on the previous design.

| # | What NVDA said | Cause | Fix | Re-verified with NVDA |
|---|---|---|---|---|
| F4 | "Engineering22 of 25 activein Engineering" | The roster row's grid cells carry no whitespace | The visual cells are `aria-hidden`; the row is one sr-only sentence: "Engineering: 22 of 25 active." | ✅ |
| F5 | The `/` shortcut never reached the page: NVDA's browse mode consumed it, and the typed letters ran NVDA's quick-navigation commands ("no next edit field…") | A single-character shortcut. This is also a **WCAG 2.1.4** failure: such shortcuts can fire by accident for speech-input users | Changed to **Ctrl+K / ⌘K** (`aria-keyshortcuts="Control+K Meta+K"`); NVDA passes modifier keys through | ✅ |
| F6 | "Nuwan Kimnuwan.kim@adminflow.dev" (row header) | Name and email are stacked blocks with no space between them | An sr-only ", " between them (also on the phone list row before the status pill) | ✅ |
| F7 | "Users updated186" | Label and figure are separate flex items | An sr-only ": " between them | ✅ |
| F8 | "All6", "Unread5" (tab names) | The count span had no real space before it | A real space before the count, in both the Users and Notifications tabs | ✅ |
| F9 | Sidebar link "Notifications, 2unread" | A leading space inside a visually hidden span is dropped from the accessible name | The visible count is `aria-hidden`, and the link carries one hidden phrase, ", 2 unread" | ❌ not re-run (the NVDA session was stopped before this check); verified only by the code change and the automated suite |

F4, F6, F7, F8 and F9 are one class of bug: **adjacent flex or grid items carry no whitespace into the accessibility tree**. After F4–F8, the code was searched for the same pattern, which found F9 and the quick-action count (step 31). Neither axe nor Lighthouse flags this class of problem; only listening to the speech did.

## Notes and limitations

- **Virtualised activity log.** NVDA reports "list with 19 items" (the rendered window) rather than all 500 events. Every item reads in full, and the total ("501 events") is announced as a status message.
- **alertdialog wording.** NVDA announces the delete confirmation as "dialog". That is its normal wording for `role="alertdialog"`; the content and the initial focus on Cancel are correct.
- **Not tested:** JAWS, Narrator, VoiceOver (macOS/iOS), TalkBack, and the phone layouts with a screen reader.
