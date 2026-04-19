# Changelog — BrightSign Product Selector

All notable changes to the BrightSign Product Selector web application.
Built for Cavitak Marketing Pvt Ltd · National Product Manager: Dipenkumar Gajjar.

Versions follow semantic-ish conventions: MAJOR.MINOR[.PATCH].

---

## [v24.2.1] — 2026-04-19 · Forgot password + branded login splash

### Added
- **"Forgot password?" link** on login page — opens a modal where the user enters their login name and optional reason.
- **Password reset request flow** — request goes to a new "ResetRequests" tab in the Google Sheet. Super-user sees a pulsing red badge on the Team tab with pending count. Each request shows requester name/login, timestamp, reason, and Approve/Deny buttons.
- **Approve action** — resets target user's password to default (`cavitak@123`) with `mustChange=TRUE`. User is forced to change on next login.
- **Deny action** — marks request as denied, no password change.
- **Resolved requests history** — collapsed section shows last 5 approved/denied requests with timestamps and who resolved them.
- **Deduplication** — if a user already has a pending request, their new submission returns "you already have a pending request" instead of creating a second one.
- **Privacy** — the API returns "ok" even for non-existent login names (prevents username enumeration attacks via the forgot-password form).
- **Branded login splash screen** — full-screen indigo-violet gradient shown between successful login and first app render. Features:
  - BrightSign logo mark with frosted-glass card
  - "BrightSign Product Selector" brand name
  - Progress bar advancing through: Signing in ✓ → Loading your data → Checking connection → Syncing entries → Ready
  - Tagline "Signage that performs, effortlessly"
  - Smooth fade-out after ~3.5 seconds or when forced-password-change modal needs to appear

### Apps Script v24.2 changes
- New tab auto-created: `ResetRequests` with 7-column schema (requestId, loginName, requestedAt, reason, status, resolvedAt, resolvedBy)
- New actions: `reset_request_create`, `reset_request_list`, `reset_request_approve`, `reset_request_deny`
- Approval reuses existing password reset logic (same effect as super clicking 🔑 Reset in Team tab)
- List and approve/deny require super-user auth; create is open (users forgot their password, so can't auth)

### Files in release
- `brightsign-v24-2-1.html` (frontend — 475 KB)
- `apps-script-v24-2.gs` (backend — 30 KB)

---

## [v24.2] — 2026-04-18 · History tab search

### Added
- Search input at the top of the History tab. Filters visible entries as you type — no Enter key or submit needed.
- Broad match across 11 fields: project name, end-user, venue, partner, city, consultant, contact name, model, outdoor model, user full name, login name.
- Live result count ("3 of 47 entries match") appears below the search box while a query is active.
- "×" clear button on the search box appears when there's a query; clears instantly.
- Empty-state message when no entries match with a quick-clear link.
- Search query persists across tab switches (switching to Dashboard and back preserves the search).
- Search is scope-aware — filters the entries the current user can see (super/OEM see team-wide; others see own only).

### Files in release
- `brightsign-v24-2.html` (frontend only — Apps Script v24.1 unchanged)

---

## [v24.1] — 2026-04-18 · Rename "Environment" → "Deployment type"

### Changed
- Label rename everywhere the field is user-visible. The stored data values are unchanged (`indoor` / `outdoor` / `mixed`) — this is purely a label change for clarity.
- Rename applies to:
  - Form field label (on the "New selection" page)
  - Form validation error messages
  - Result page summary row
  - Email body (mailto: template)
  - CSV export header
  - Excel Summary sheet field label
  - Excel Tender sheet field label
  - Google Sheet column Z header (auto-renamed on first webhook call after deploy)

### Unchanged (intentional)
- Internal field name remains `environment` in the data model, Apps Script, API payloads, and pending-sync queue. This preserves backward compatibility with existing Sheet rows and in-flight local entries.
- Values remain `indoor` / `outdoor` / `mixed`.

### Apps Script v24.1 changes
- New helper `renameEnvironmentHeader()` — idempotent. Checks Sheet1 cell Z1 and renames "Environment" to "Deployment type" if found. Safe to call repeatedly.
- Called lazily from `handleLogPost` (on first log write) and `doGet` (on first read). No manual migration step needed.

### Files in release
- `brightsign-v24-1.html` (frontend — 451 KB)
- `apps-script-v24-1.gs` (backend — 23 KB)

---

## [v24] — 2026-04-18 · Hardening + role-based permissions

### Added
- **Session re-auth prompt.** If the cached session password is cleared silently (timeout, DevTools clear, etc.), any sensitive action (save profile, reset user, add/edit/delete user) now prompts for password confirmation instead of failing silently. Implemented via `requireAuth()` helper.
- **60-second auto-logout warning modal** with live countdown and "Stay signed in" button. Regular users had silent 10-minute logouts before; now they get a visible warning one minute out with the option to extend or sign out immediately. Super-user unaffected (no timeout).
- **Webhook health check** on login. Verifies the Apps Script URL is reachable and returning valid data. Shows a dismissible banner at the top of the app if broken, with specific guidance (HTTP error code, invalid data, network failure) instead of silent sync failures.
- **Last-login timestamp** on Team tab rows. Apps Script v24 writes `lastLogin` on every successful auth. Team list shows it as relative time ("2h ago", "3 days ago") or absolute date for older entries. Helps super-user see who's actually using the app.
- **Dashboard date range filter.** New dropdown: "All time / Last 30 days / Last quarter (90d) / Last year". Defaults to "All time". Works alongside existing filters (city/user/project/partner/consultant). Applied via `applyFiltersToEntries` with cutoff comparison on entry timestamp.
- **Duplicate project warning banner.** When typing a project name on the "New selection" form, if a case-insensitive match exists in the team log, a soft warning banner appears inline under the section header showing: existing project, who created it, date, model. User can still proceed OR click "Open existing entry to edit" to jump to the History tab and open the matching entry. Doesn't block — purely advisory. Suppressed automatically when already in edit mode (editing an existing entry).
- **Role-based permissions (5 roles):** Super · OEM · Presales · Sales · Support.
  - **Super** — full access + user CRUD (unchanged)
  - **OEM** — can create/edit own entries, sees ALL team entries and dashboard with filters, cannot delete entries, cannot manage users
  - **Presales / Sales / Support** — same as pre-v24 regular user (own entries only)
- **Role dropdown** enforces valid roles in Add/Edit user modals. Apps Script validates against `ALLOWED_ROLES` constant on both `users_add` and `users_update`. Free-text role entry is no longer possible.
- **Super role is hardcoded.** The Add/Edit modals show only `OEM / Presales / Sales / Support` — super cannot be promoted via UI under any circumstance. Super-user's row shows role as locked "Super" in edit modal.

### Changed
- `getVisibleEntries()` — OEM role now sees all entries (was super-only)
- `renderDashboard` + `renderLog` — OEM gets filter bar and team-wide titles/subtitles
- Session timer split into warning (9 min) + final (10 min) with independent clear/restart
- Users tab schema expanded from 11 to 12 columns (added `lastLogin`)
- Migration script normalizes roles to the 5-role whitelist during Users tab seeding

### Apps Script v24 changes
- `getUsersSheet` creates 12-column sheet or adds missing `lastLogin` column to existing sheets
- `handleAuthCheck` stamps `lastLogin` timestamp on successful login
- `handleUsersAdd` + `handleUsersUpdate` validate role against `ALLOWED_ROLES`
- `rowToUser` returns `lastLogin` field to frontend
- All backward compatible — no migration needed beyond updating the script

### Files in release
- `brightsign-v24.html` (frontend — 451 KB)
- `apps-script-v24-full.gs` (backend — 21 KB)

---

## [v23.1] — 2026-04-18 · Dashboard tab split from History

### Changed
- **Dashboard separated into its own tab.** Previously charts and KPI strip were embedded above the log list on the History tab.
- **4 tabs for super-user**: New selection · History · Dashboard · Team
- **4 tabs for regular user**: New selection · History · Dashboard · Profile
- **History tab** now shows only the raw entry list + action bar (Refresh, Sync, Reset, Export, Clear)
- **Dashboard tab** now shows the hero banner, KPI strip, filter bar (super only), and all 9 charts
- Filter changes (`applyFilters`, `clearFilters`) now re-render the Dashboard instead of the log list
- `refreshLog` refreshes both tabs so charts and list stay in sync after a pull
- New helper `getVisibleEntries()` — single source of truth for "what entries does this user see" (super=all, regular=own)

### Rationale
- Reduces cognitive load — each tab has a single job
- Faster History view when you just want to scan recent entries (no chart render overhead)
- Dashboard becomes a dedicated analytics surface that can grow without cluttering History

### Files in release
- `brightsign-v23-1.html` (frontend only — Apps Script v23 unchanged)

---

## [v23] — 2026-04-18 · Full user management

### Added
- **New "Users" tab in Google Sheet** replaces the Auth tab with richer schema: loginName, fullName, email, phone, role, passwordHash, mustChange, isSuper, isActive, lastChanged, createdAt
- **New top-nav tab**: "Profile" for regular users / "Team" for super-user
- **Profile tab (regular users)**: View avatar + name + role. Edit own email and phone. Change own password. Name/role fields locked (🔒) — only super can change them.
- **Team tab (super-user only)**: Full list of all team members with avatar, name, role, email, phone, active status, super badge
- **Add user flow**: Super-user clicks "➕ Add user" modal with login name, full name, role, email, phone. New user gets default password `cavitak@123` and `mustChange=TRUE`.
- **Edit user flow**: Super-user can edit any user's full name, role, email, phone, and active status (except super-user's own isSuper flag, which is hardcoded)
- **Delete user flow**: Super-user can delete any non-super user. Past selections in History tab preserved (attributed to login name).
- **Reset password from Team tab**: Per-row 🔑 Reset button sends `auth_reset` for that user
- **Deactivate instead of delete**: Setting `isActive=false` blocks login while keeping history attribution
- **Name-protected super account**: `dipenkumar` is hardcoded as super in Apps Script — no one can promote or demote super via UI
- HTML `USERS` config shrunk to single super-user fallback entry (used only if webhook offline)

### Apps Script v23 changes
- New actions: `users_list`, `users_get`, `users_add`, `users_update`, `users_delete`, `users_migrate`
- `auth_check` now returns full user record (not just ok/bad)
- `auth_check` rejects inactive accounts
- `handleUsersMigrate` auto-reads existing Auth tab hashes and preserves them in new Users tab — zero password loss during migration
- Regular users can self-update their own email/phone (after password verify); all other fields require super auth

### Migration
- Apps Script v23 auto-migrates from Auth tab on first `users_migrate` call
- All existing hashes preserved, mustChange flags preserved
- Run once from Apps Script editor: `handleUsersMigrate({secret:'cavitak-auth-init-2026'})`

---

## [v22.6] — 2026-04-18 · Password rotation system

### Added
- Secure Sheet-backed password storage with SHA-256 hashing (client-side)
- "🔑 Password" button in header for users to change their own password
- "🔑 Reset user password" button in super-user action bar
- Forced password change modal on first login after deploy (or after super reset)
- Offline fallback: super-user can still log in if webhook unreachable (regular users cannot)
- Password rules: min 8 chars, can't reuse `cavitak@123`, must differ from current

### Apps Script v22 changes
- New Auth tab auto-created on first auth_init
- Actions: `auth_check`, `auth_change`, `auth_reset`, `auth_init`
- Super-user allowlist hardcoded in SUPER_USERS const

---

## [v22.5.1] — 2026-04-18 · Email via user's own mail app

### Added
- **Email to partner** button on Result page (indigo-violet gradient, next to Download Excel)
- One-click email flow: Excel auto-downloads + user's default mail app opens with To / CC / Subject / Body pre-filled
- Emails send from the user's real email address (Outlook, Gmail, Apple Mail — whichever is their default)
- Validates partner contact email before triggering mail app
- Pre-composed professional email body with project details, model recommendation, quantity, environment, resolution
- Always CCs `dipen.g@cavitak.com`

### Design notes
- Chose `mailto:` approach over server-side send (via Apps Script `MailApp`) because server-side would always send from `dg.cavitak@gmail.com`
- Cavitak identity preserved — `dg.cavitak@gmail.com` is nowhere in the user-facing stack

---

## [v22.4] — 2026-04-18 · Local entry re-sync with pending queue

### Added
- Pending sync queue in `localStorage` (key: `bs-pending-sync`) — entries never lost even if Sheet is offline
- Three retry triggers: (1) auto-retry 3s after login, (2) background retry every 60 seconds, (3) manual "⟳ Sync now" button
- Pulsing red badge on History tab showing pending count (e.g., `3`, `9+`)
- Verifier function fetches central log and auto-removes queue items already present in Sheet
- Each queued item tracks: refId, full payload, attempts count, queuedAt, lastAttempt, lastError

### Changed
- `logEntry()` now pushes to queue before attempting webhook, then verifies after 4 seconds
- On successful Apps Script POST, verifier runs to confirm entry actually landed in Sheet

---

## [v22.3] — 2026-04-18 · Per-user history, dashboards, and edit permissions

### Added
- **User-isolated history** — regular users see only their own entries (matched by loginName, case-insensitive, with fullName fallback)
- **Per-user mini dashboards** — each user gets KPIs + all 9 charts filtered to their own data
- **All users can edit past entries** (previously super-user only)
- **Basic info locked in edit mode** — project, end-user, venue, partner, consultant, city, contact name/phone/email, stage, close month all become readonly with 🔒 icon
- **Technical fields stay editable** — qty, indoor/outdoor qty, environment, content, resolution, update, HDMI, touch, Wi-Fi, GPIO, SSD, CMS vendor/term, budget
- Edit mode banner at top of form with Cancel button
- Defensive filter in `exportCSV` — regular users only export their own rows

### Changed
- `refreshLog` no longer gated behind isSuper — all users can read central log
- Regular users get same dashboard infrastructure as super-user (no filter bar for them)
- Page title adapts: "My selection history" vs "All-team selection history"

---

## [v22.2] — 2026-04-18 · Past-entry edit (initial super-only version)

### Added
- Edit ↻ button on every log row (indigo-violet gradient, right-aligned)
- `editPastEntry()` loads entry data into `state.form`, preserves refId for upsert
- `prefillFormUI()` repopulates all form inputs, pill groups, choice cards from cached state
- Cached `window._lastRefIdForEdit` so Recommend upserts instead of appending

### Note
- Initially gated to super-user only; generalized to all users in v22.3

---

## [v22.1] — 2026-04-18 · Model Demand Analytics

### Added
- Dashboard Row 4: "Product Demand" section with 2 new charts
- **Chart 8: Model Demand** — horizontal bar chart of top 10 models ranked by total units, shaded by rank (deep indigo to softer violet)
- **Chart 9: Top Models Monthly Trend** — multi-line chart of top 3 models across last 6 months (indigo / violet / emerald)
- New `.ci-violet` icon class for chart cards

### Business rationale
- Answers "what's actually selling?" and "which models are trending?" for OEM conversations with BrightSign

---

## [v22.0.1] — 2026-04-18 · Excel styling actually works

### Fixed
- **CRITICAL**: Swapped SheetJS CE (`xlsx@0.18.5`) for `xlsx-js-style@1.2.0` CDN
- SheetJS Community Edition silently strips all cell styles when writing files (pro feature)
- Same `XLSX` global, zero code changes required — only CDN URL swap
- All fills, fonts, borders, alignments, number formats now render correctly in downloaded Excel

---

## [v22.0] — 2026-04-18 · Premium styled Excel (tvONE grammar)

### Added
- Complete rewrite of `downloadQuoteExcel()` using tvONE Calico design grammar with BrightSign indigo-violet palette
- Tagline: **"Signage that performs, effortlessly"**
- Color palette:
  - Deep indigo `#1E1B4B` — title bars
  - Medium violet `#312E81` — section headers
  - Soft lavender `#EEF2FF` — label cells
  - Pale lavender `#F5F3FF` — model highlight rows
  - Bright violet `#7C3AED` — Grand Total + Quote No. accents
  - Light indigo `#C7D2FE` — tagline
- Three sheets: Summary · Quotation · Tender Compliance
- Consolas monospace for SKUs and model IDs
- Amber-bordered fill-in cells for Unit Price / Comply / Make-Model / Remarks
- Auto-calc formulas: qty × unit → subtotal → GST → grand total
- Autofilter + freeze panes + print-ready landscape orientation
- 15-day validity, 30-day lead time, standard payment terms baked in

---

## [v21.9.x] — April 2026 · Dark mode + login polish

### Added
- Dark/light theme system using CSS custom properties
- Sun/moon toggle in both header (next to avatar) and login page (floating top-right)
- Theme persists in `localStorage` key `bs-theme`
- Inline `<script>` in `<head>` prevents flash-of-light on load
- Dark mode styles for `.choice-card`, `.number-input`, `.os-pill`, text inputs, select dropdowns

---

## [v21.7] — April 2026 · Pricing callout card

### Added
- "For Pricing & Quotation" card on Result page
- Indigo-violet gradient, glass-morph background, hover lift + shine sweep
- Directs partner/SI to contact Dipenkumar for commercial terms
- Positioned between Deployment Notes and BOM

---

## [v21.6] — April 2026 · Session management

### Added
- 10-minute hard session timeout for regular users (super-user has no timeout)
- `beforeunload` event triggers auto-logout on tab close
- Back button preserves form data for edit-and-re-run
- Confirm button resets form + navigates to blank form tab
- `window._lastRefIdForEdit` cache enables upsert behavior for same project

---

## [v21] — April 2026 · Cinematic result page

### Added
- Indigo gradient hero with cursor-follow spotlight, 3D tilt on mouse move, sparkle burst animation on render
- Deployment badge next to model ID (Indoor Grade / Outdoor Grade / Mixed)
- Hero pill order: Warranty → Power (PoE+/DC) → Wi-Fi → CMS → Hero tag
- Dual hero for Mixed deployments — indigo (primary/indoor) + teal-emerald (outdoor variant)
- Independent step-up/down alternatives for each deployment type via `computeOutdoorAlternatives()`
- Theatrical "Analyzing…" overlay before result reveal

---

## [v20] — April 2026 · CMS section (Apps Script v20 · 37 columns)

### Added
- CMS section on form: vendor, term (years), include toggle, billing type (On-premise / Cloud / Standalone)
- CMS vendors with " CMS" suffix: BrightSign CMS, Pickcel CMS, Korbyt CMS, Poppulo CMS
- Three new Sheet columns: AI (CMS Vendor), AJ (CMS Term), AK (CMS Billing Type)
- Apps Script v20 schema: 37 columns A–AK, upsert-by-refId logic
- Sheet row updates in-place when same refId POSTs again (no duplicates)

---

## [v19–v20.1] — April 2026 · Premium dashboard for super-user

### Added
- 13-user allowlist with role tags (Presales / Sales / Support + Super)
- Login page with 2-character avatar circles
- Super-user exclusive "All team" view with filter bar
- Filters: City, User, Project, Partner, Consultant (all dropdowns populated from unique values)
- 7 charts: Stage Funnel, Model Groups, User Leaderboard, Top Partners, City Heatmap, Activity Timeline, Conversion Ring
- KPI strip above charts: Total selections, Unique projects, Unique users, Conversion rate
- Double-click Confirm button protection

### Fixed
- Missing CMS vendor in Tender spec output
- Duplicate const declarations causing JS syntax errors (v21.4.3 fix)

---

## [v17] — April 2026 · Google Sheets central logging

### Added
- Apps Script webhook URL baked into HTML (`WEBHOOK_URL` constant)
- Every selection logs to central Google Sheet in real-time
- Schema includes all form fields, recommended model, outdoor variant (for Mixed), timestamp, user identity
- Status field distinguishes "viewed" vs "saved" (confirmed)
- Local `localStorage` fallback when webhook offline

---

## [v14–v16] — March 2026 · Form validation + multi-user auth

### Added
- 13-user login system with `cavitak@123` default password + super password for Dipenkumar
- Form validation with inline error highlighting
- `resetForm()` for clean state on logout and post-confirm
- Automatic ref ID generation (`BS-xxxxxxxx` format)

---

## [v11–v13] — March 2026 · Core product selector

### Added
- Recommendation engine scoring models against form inputs
- Product catalog: AU335, LS425, LS445, HD225, HD1025, XD235, XD1035, XT245, XT1145, XT2145, XC2055, XC4055
- Form fields: project context, deployment environment, content specs, I/O needs, CMS vendor, budget tier
- BOM card, Tender Spec card, Project Summary card
- Result page with model hero, pills, deployment notes, alternatives

---

## Backend — Apps Script versions

### apps-script-v20-final.gs (currently deployed)
- 37-column schema A–AK
- Upsert-by-refId (same refId → UPDATE existing row instead of appending)
- `action=read` GET endpoint returns full log as JSON (used by dashboard)
- Reverses row order (newest first)

### apps-script-v21-email.gs (built but NOT deployed)
- Added `action=email` POST handler using `MailApp.sendEmail()`
- Decoded base64 Excel → attached to Gmail
- **Abandoned** because MailApp always sends from Script owner's account (`dg.cavitak@gmail.com`)
- Dipenkumar specified emails must never show `dg.cavitak@gmail.com`
- Frontend v22.5.1 uses `mailto:` instead, so v20 Apps Script stays as authoritative backend

---

## Known pending items (tracked separately)

Deferred to future sessions:
- **#4** Password rotation / change mechanism — NOW DONE (see v22.6)
- **#6** Transparent logo PNG swap — waiting on file
- **#7** Tagged GitHub releases — Dipenkumar's task
- **#9** Mobile responsiveness audit — Dipenkumar's task
- **#11** tvONE port of v21+ features — keep apps separate for now
- **#12** Green Hippo selector — not prioritized
- **#13** PDF export alongside Excel — not prioritized

---

## Architecture notes

- **Frontend**: Single-file HTML (~400 KB) with embedded CSS, JS, base64 logo
- **Hosting**: GitHub Pages at `https://dgcavitak-rgb.github.io/brightsign-selector/`
- **Backend**: Google Apps Script webhook at fixed deployment URL (baked into HTML)
- **Storage**: Google Sheet (central) + browser `localStorage` (fallback / offline queue)
- **Excel library**: `xlsx-js-style@1.2.0` via jsDelivr CDN (preserves cell styling)
- **Charts**: Chart.js via CDN
- **No framework**: Pure vanilla JS — no React, no build step
- **Deploy workflow**: Download HTML → rename to `index.html` → GitHub upload → commit → push → live instantly

---

*Maintained by: Dipenkumar Gajjar · National Product Manager, BrightSign · Cavitak Marketing Pvt Ltd*
