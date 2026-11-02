# AdminFlow Dashboard — Accessibility Audit (WCAG 2.1 AA)

**Author:** Lakshitha · **Month 4 deliverable** · **Target:** WCAG 2.1 Level AA
**Build audited:** production build (`npm run build` → `vite preview`), light and dark themes, desktop (1366 px), mobile (390 px) and 320 px reflow widths.

## 1. Summary

| Method | Scope | Result |
|---|---|---|
| **axe-core 4.14** (`npm run a11y`): tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `best-practice` | 13 scenarios (every route plus dialogs, validation errors, popover, mobile drawer, empty state) × 2 themes = **26 runs** | **0 violations** |
| **Reflow check** at 320 CSS px (custom, part of `npm run a11y`) | Same 26 runs | **No overflow** outside intentionally scrollable regions |
| **Keyboard / focus checks** (`scripts/keyboard-check.mjs`, puppeteer) | 10 scripted keyboard-only journeys | **10 / 10 pass** |
| **Lighthouse accessibility** | Login, Dashboard, Users × mobile/desktop | **100** on every run |
| **Storybook a11y addon** | Every story, `a11y.test: 'error'` | Fails the story on any violation |
| **Unit tests** | Modal (labelling, focus trap, Esc, focus restore); wizard (error focus, Enter, step-heading focus) | Pass |
| **Manual review** of criteria automation cannot judge (non-text contrast, focus order, meaning) | All components | 4 issues found and fixed (§5) |
| **Real screen reader: NVDA 2026.2 + Chrome** ([report](accessibility/screen-reader-test.md)) | 30 steps across every page, dialog and live region, driven with real keystrokes; speech captured from NVDA's log | **30/30 pass** after fixing 3 issues it found (§5 F1–F3) |

Raw results: [`accessibility/axe-results.json`](accessibility/axe-results.json), [`accessibility/keyboard-results.json`](accessibility/keyboard-results.json).

> Automated tools find roughly a third to a half of accessibility issues. They are a floor, not proof of conformance. That is why a real NVDA session was also run (§6), and it caught three issues the tools missed.

## 2. WCAG 2.1 A/AA success criteria

| SC | Criterion | Status | How it is met |
|---|---|---|---|
| 1.1.1 | Non-text content | ✅ | Decorative SVG icons are `aria-hidden` and non-focusable. Icon-only buttons have `aria-label` (e.g. "Edit Ravi Johnson", "Delete Ravi Johnson"). The logo `<img alt="">` sits next to the visible "AdminFlow" text. The chart is `role="img"` with `<title>` and a generated `<desc>` summary, plus a full data table. |
| 1.3.1 | Info and relationships | ✅ | Landmarks (`header`, `nav[aria-label=Main]`, `main`, `role=search`, labelled regions); one `h1` per page with ordered `h2`/`h3`; every control has a `<label>`; tables use `<caption>`, `th[scope]` and a row header; the theme choice uses `fieldset`/`legend`; the wizard review uses `dl`. |
| 1.3.2 | Meaningful sequence | ✅ | DOM order equals visual order; there is no CSS re-ordering of content. |
| 1.3.3 | Sensory characteristics | ✅ | Trends say "Up 4.2%" / "Down …" in text, not only colour or arrow direction. |
| 1.3.4 | Orientation | ✅ | No orientation lock; the layout adapts to both orientations. |
| 1.3.5 | Identify input purpose | ✅ | Login uses `autocomplete="username"` and `current-password`. |
| 1.4.1 | Use of colour | ✅ | Status/role badges carry text; errors are text, not just red borders; unread notifications have an sr-only "Unread:" prefix as well as the dot; required fields use `*` plus an explanatory sentence. |
| 1.4.3 | Contrast (minimum) | ✅ | axe `color-contrast` passes in both themes. Body text, e.g. slate-600 on white, is 7.6:1. Primary buttons (white on brand-600) are 6.3:1. |
| 1.4.4 | Resize text | ✅ | rem-based sizing; usable at 200% zoom. |
| 1.4.5 | Images of text | ✅ | None used. |
| 1.4.10 | Reflow | ✅ | Mobile-first layout verified at 320 px with no horizontal scrolling. Data tables scroll inside their own keyboard-focusable region (a two-dimensional-content exception). |
| 1.4.11 | Non-text contrast | ✅ *(fixed, §5)* | Input/select borders: slate-500 (4.8:1 light, 3.7:1 dark). Focus ring: brand-600 / brand-300 (6.3:1 / 10.1:1). Selected tab: brand-600 fill. Active nav item: 3 px brand bar. |
| 1.4.12 | Text spacing | ✅ | No fixed-height text containers; content survives increased letter/line spacing. |
| 1.4.13 | Content on hover or focus | ✅ | The chart tooltip is supplementary (`aria-hidden`; the same data is in the table) and does not obscure controls. The notification popover is dismissible with Esc and persists until dismissed. |
| 2.1.1 | Keyboard | ✅ | All functionality is operable by keyboard: tables (sort buttons), tabs, dialogs, menus, the wizard, the virtual list (focusable scroll region). |
| 2.1.2 | No keyboard trap | ✅ | Modal and drawer traps are intentional and escapable (Esc, Close button); focus is restored afterwards. |
| 2.1.4 | Character key shortcuts | ✅ | No single-key shortcuts. |
| 2.2.1 | Timing adjustable | ✅ | Toasts auto-dismiss after 6–10 s but **pause on hover and focus**. Every toast that matters is also kept in the notification inbox, so no information is lost. |
| 2.2.2 | Pause, stop, hide | ✅ | Only loading indicators animate. `prefers-reduced-motion` disables animation and transitions. |
| 2.3.1 | Three flashes | ✅ | No flashing content. |
| 2.4.1 | Bypass blocks | ✅ | "Skip to main content" is the first focusable element and moves focus to `<main>`. |
| 2.4.2 | Page titled | ✅ | A unique `document.title` per route ("Users · AdminFlow"). |
| 2.4.3 | Focus order | ✅ | Logical order. On route change focus moves to the page `h1`. Dialogs focus their first control, or **Cancel** for destructive confirmations. After a delete, focus moves to the results heading because the row disappears. |
| 2.4.4 | Link purpose (in context) | ✅ | "View all" carries sr-only "activity"; "Mark as read" and "Remove" include the notification title for screen readers. |
| 2.4.5 | Multiple ways | ✅ | Sidebar navigation, dashboard quick actions and in-page links. |
| 2.4.6 | Headings and labels | ✅ | Descriptive headings and visible labels on every field. |
| 2.4.7 | Focus visible | ✅ | A global 2 px `:focus-visible` outline with offset, in both themes. |
| 2.5.1–2.5.4 | Pointer gestures, cancellation, label in name, motion | ✅ | Single-pointer actions only. Visible labels are contained in accessible names. No motion input. |
| 3.1.1 | Language of page | ✅ | `<html lang="en">`. |
| 3.2.1 / 3.2.2 | On focus / on input | ✅ | Focus never triggers navigation. Filters update results in place (announced) without moving focus. |
| 3.2.3 / 3.2.4 | Consistent navigation and identification | ✅ | One shared layout and component library. |
| 3.3.1 | Error identification | ✅ | Text errors under each field, `aria-invalid="true"`, and an error alert for server errors (e.g. invalid credentials, duplicate email). |
| 3.3.2 | Labels or instructions | ✅ | Labels, required markers, hints (e.g. "An invitation will be sent to this address"). |
| 3.3.3 | Error suggestion | ✅ | Specific messages ("Name must be at least 2 characters", "Invalid email address"). |
| 3.3.4 | Error prevention (data) | ✅ | Delete requires confirmation, is a soft delete and can be undone or restored; the wizard has a review step plus a confirmation checkbox; Reset demo data requires confirmation. |
| 4.1.1 | Parsing | ✅ | React-generated valid markup; no duplicate IDs (`useId`). |
| 4.1.2 | Name, role, value | ✅ | Native controls wherever possible. Custom widgets follow ARIA patterns: tabs (`tablist`/`tab`/`tabpanel`, `aria-selected`, `aria-controls`), dialog/alertdialog (`aria-modal`, `aria-labelledby`, `aria-describedby`), disclosure (`aria-expanded`, `aria-controls`), sortable headers (`aria-sort`), pagination (`aria-current="page"`), wizard (`aria-current="step"`), toggle (`aria-pressed` on show password). |
| 4.1.3 | Status messages | ✅ | `role="status"` for result counts ("124 users found"), toasts (polite) and loading; `role="alert"` (assertive) for errors. Live regions are mounted before content is injected, so announcements are reliable. |

## 3. Keyboard map

| Where | Keys |
|---|---|
| Anywhere | `Tab` / `Shift+Tab` move focus; the first `Tab` reaches **Skip to main content** |
| Tabs (chart range, notification filter) | `←` / `→` previous/next tab (wraps), `Home` / `End` first/last; selection follows focus |
| Dialogs (edit user, delete, reset data) | Focus is trapped inside; `Esc` closes; focus returns to the trigger |
| Mobile menu drawer | Focus is trapped; `Esc` closes; focus returns to the menu button |
| Notification bell | `Enter`/`Space` toggles; `Esc` closes and returns focus |
| Users table | `Enter` on a column header sorts it (`aria-sort` updates); row actions are buttons |
| Pagination | Buttons with `aria-label="Page N"`, previous/next |
| Wizard | `Enter` in any field = **Continue** (validates the step); errors focus the first invalid field; a new step focuses its heading |
| Scrollable regions (tables, activity log) | Focusable (`tabindex=0`), scroll with arrow keys |

## 4. Verified keyboard journeys (automated)

From `npm run a11y` → `docs/accessibility/keyboard-results.json`:

1. ✅ The first Tab reaches the skip link; Enter moves focus to `<main>`.
2. ✅ Client-side navigation moves focus to the new page's `<h1>` and updates the title.
3. ✅ Edit modal: focus moves in, 20 × Tab/Shift+Tab stays inside, Esc closes, focus returns to "Edit ‹name›".
4. ✅ The delete confirmation opens with focus on **Cancel** (the safe action).
5. ✅ Tabs: ArrowRight moves focus and selection; Home jumps to the first tab; only one tab is in the Tab order.
6. ✅ The sortable header is keyboard-operable; `aria-sort` goes from `none` to `ascending`.
7. ✅ Notification menu: Enter opens (`aria-expanded=true`); Esc closes and returns focus.
8. ✅ Mobile drawer: focus is trapped; Esc closes; focus returns to the menu button.
9. ✅ Login: submitting the empty form focuses the email field, which is `aria-invalid` and described by its error.
10. ✅ Wizard: an invalid step keeps focus on the first error; Enter on a valid step moves focus to the "Step 2 of 3" heading.

## 5. Issues found during the audit, and their fixes

| # | Issue | WCAG | Found by | Fix |
|---|---|---|---|---|
| 1 | Pressing **Enter** in a wizard field did nothing. The intermediate steps had no submit button, and HTML ignores implicit submission when a form has 2+ text fields and no submit button. | 2.1.1 | Keyboard check (journey 10) | Each step's primary action (Continue / Create user) is now the form's submit button; added a regression test (`UserWizard.test.tsx`). |
| 2 | Input/select borders were 1.48:1 (light) and 2.36:1 (dark), below the 3:1 needed to identify a field's boundary. | 1.4.11 | Manual contrast calculation (axe does not test 1.4.11) | Borders changed to slate-500: 4.8:1 light, 3.7:1 dark. |
| 3 | The selected tab differed from the others only by a white background on slate-100 (1.1:1). | 1.4.11 | Manual review | Selected tab now uses a brand-600 fill with white text. |
| 4 | The active sidebar link was indicated only by a brand-50 tint (1.1:1). `aria-current` covered screen readers but not sighted users. | 1.4.11 | Manual review | Added a 3 px brand-600/brand-300 indicator bar (6.3:1 / 9:1) and a semibold label. |
| 5 | At mobile width the dashboard's chart card overflowed the viewport: the implicit grid track was sized by its content. | 1.4.10 | Screenshot review | Explicit `grid-cols-1` (`minmax(0,1fr)`) + `min-w-0`; added an automated 320 px reflow check to `npm run a11y`. |
| 6 | Toasts were first built as `<ol role="status">`. The role strips list semantics and would orphan the `<li>`s. | 1.3.1 | Code review | The live regions are now plain `div`s. |
| F1 | Metric trends read as "**Up4.2%vs last period**": the text was split across flex items with no real whitespace. | 1.3.1 | NVDA test | A single sr-only sentence ("Up 4.2% vs last period"); the visual pieces are `aria-hidden`. |
| F2 | The required-fields note read "**Fields marked as required are required.**" | 3.3.2 | NVDA test | The sr-only text now says "with an asterisk". |
| F3 | Emails were read (and shown) as "**Sr.Tester@Example.Com**": `capitalize` was applied to every value in the wizard review and the Settings profile. | 1.3.1 | NVDA test | Only the role is title-cased; names and emails keep their real casing. |

## 6. Screen-reader testing and known limitations

- **NVDA 2026.2 + Chrome: tested for real, 30/30 steps pass.** NVDA ran live while each step was performed with real keystrokes, including NVDA's own browse-mode commands (`H`, `D`, `T`, `G`, table navigation). Its speech was captured from the NVDA log. The test covered login errors, the skip link, landmarks, the heading outline, metrics, the chart summary, tabs, the bell menu, debounced search announcements, table navigation with row headers, sorting, both dialogs, toasts, the wizard and settings. It found **3 issues no automated tool caught** (F1–F3 in §5), all fixed and re-verified with NVDA. Full step-by-step results with NVDA's actual output: [`accessibility/screen-reader-test.md`](accessibility/screen-reader-test.md).
- **Not tested:** JAWS, Narrator, VoiceOver (macOS/iOS) and TalkBack. The app uses only standard ARIA patterns, so they are expected to behave similarly, but this was not verified.
- **Chart tooltip is pointer-only.** Keyboard and screen-reader users get the same information from the `<desc>` summary and the data table; NVDA reads the summary as "Revenue trend, graphic, Revenue from … up 53.2%. Highest …".
- **Virtualised activity log.** Only visible rows exist in the DOM, so NVDA reports "list with 17 items" rather than the full 504. Every item reads in full, and the total ("504 events") is announced as a status message. The search box is the efficient way to find an event.
- **Native multi-select** (in Storybook) is accessible but less discoverable for mouse users. A custom ARIA 1.2 combobox is a possible enhancement.
- **Colour contrast in charts:** the trend line (brand-600) is 6.3:1 against the card. Grid lines are decorative and exempt.

## 7. How to reproduce

```bash
npm run build
npm run a11y        # axe (26 runs) + 320px reflow + 10 keyboard journeys
npm test            # includes Modal and wizard keyboard/focus tests
npm run storybook   # Accessibility panel on every story
```
