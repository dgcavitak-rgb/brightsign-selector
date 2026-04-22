# Changelog — BrightSign Product Selector

All notable changes to the BrightSign Product Selector web application.
Built for Cavitak Marketing Pvt Ltd · National Product Manager: Dipenkumar Gajjar.

Versions follow semantic-ish conventions: MAJOR.MINOR[.PATCH].

---

## [v24.4.2] — 2026-04-19 · Unified theme pill (Light / Auto / Dark)

Frontend-only patch release. Theme control consolidated into a single 3-state pill.

### Changed
- **Replaced 2-state sun/moon toggle** (Light ↔ Dark only) with **3-state pill**: Light / Auto / Dark.
- **"Auto" mode** follows the device's OS preference via `prefers-color-scheme` media query.
- If the OS switches day-to-night mode while the user is on "Auto", the app theme updates live without requiring a refresh.
- Both locations of the control updated:
  - **Login page** — top-right floating pill
  - **App header** — inline next to the user avatar

### Added
- New `setThemeMode(mode)` JS function — explicit setter for a specific mode
- Visual "active" state on the currently-selected pill segment (indigo highlight + subtle shadow)
- OS-preference listener for live updates when in Auto mode

### Migration
- Previous storage key `bs-theme` (values: `light`/`dark`) is automatically migrated to new key `bs-theme-mode` (values: `light`/`auto`/`dark`) on first load after deploy.
- Users who had previously chosen an explicit light or dark theme will keep that choice.
- New users default to **Auto**.

### Fixed
- Mobile viewport had a stale `.theme-toggle` rule that tried to size the old button. Replaced with `.theme-pill` sizing for touch targets.

### Files in release
- `brightsign-v24-4-2.html` — frontend only (Apps Script v24.5 unchanged)

### Deploy
- Frontend-only patch. Replace `index.html` on GitHub. Hard refresh to see new pill.

---

## [v24.4.2] — 2026-04-19 · Theme control — 3-state pill (Light / Auto / Dark)

Frontend-only patch release. UX improvement.

### Changed — Theme control
- **Old:** Single toggle button (sun ↔ moon) cycling between light and dark. Shown twice (header + login page).
- **New:** 3-state pill with Light / Auto / Dark options, shown twice (header + login page floating top-right).
- **"Auto" mode** follows the device's OS-level `prefers-color-scheme` setting and live-updates if the user changes their OS theme while the app is open.
- Active state is visually indicated (highlighted pill segment).
- All 3 modes persist to `localStorage`.

### Added — OS theme sync
- Media query listener for `prefers-color-scheme` — when in Auto mode, theme updates instantly if the device switches (e.g., iOS Auto Appearance sunset/sunrise transitions, Windows light↔dark schedule).

### Migration
- Legacy `bs-theme` localStorage key (values: `light` / `dark`) is auto-migrated to new `bs-theme-mode` key on first load after deploy. Old explicit choice is preserved.
- New users default to `auto`.

### Kept
- `toggleTheme()` function kept as a legacy shim — cycles through light → auto → dark. Any old code still calling it continues to work.

### Files in release
- `brightsign-v24-4-2.html` — frontend only (Apps Script v24.5 unchanged)

### Deploy
- Frontend-only patch. Replace `index.html` on GitHub. Hard refresh.

---

## [v24.4.13] — 2026-04-20 · Remove Password button from header

Frontend-only patch. Removes the "🔑 Password" button that lived in the header next to the avatar.

### Removed

- **Header Password button** (`<button class="btn-password">🔑 Password</button>`) — it cluttered the header and was redundant with the same functionality already in the Profile tab.

### Preserved

- **"🔑 Change password" button in Profile tab** remains — users can still change their own password there.
- **All password change logic** (`showChangePasswordModal`, forced-change flow on first login) is unchanged.
- **CSS for `.btn-password`** class kept (no longer used, but harmless — removing would trigger a full sweep).

### Deploy

Single-file swap. Replace `index.html` on GitHub. Hard refresh.

---

## [v24.4.19] — 2026-04-22 · Pricing integration (MAJOR feature)

Frontend-only patch. First BrightSign release with in-app pricing. Previously the selector stopped at the BOM and directed users to contact Dipenkumar for quotes; now final prices flow from the BOM through to the Excel quote and the partner email.

### Added — Hardcoded pricing catalog

New `PRICING` const map with final (post-negotiation) INR prices for every currently-shipping SKU:

| Series | Model | Price |
|--------|-------|-------|
| AU | AU335 | ₹25,729 |
| LS | LS425 | ₹47,396 |
| LS | LS445 | ₹61,615 |
| HD | HD225 / HD226 | ₹74,479 |
| HD | HD1025 / HD1026 | ₹88,021 |
| XD | XD235 / XD236 | ₹90,729 |
| XD | XD1035 / XD1036 | ₹1,04,271 |
| XT | XT245 | ₹1,26,615 |
| XT | XT1145 | ₹1,40,156 |
| XT | XT2145 | ₹1,67,240 |
| XC | XC2055 (Standard) | ₹1,74,688 |
| XC | XC4055 (Standard) | ₹2,42,396 |

Series 6 SKUs (HD226 / HD1026 / XD236 / XD1036) mapped to the same prices as their Series 5 predecessors per the current rate card — adjust the `PRICING` map and redeploy when Series 6 prices diverge.

### Added — XC OS variant (Standard vs Win10/Win11)

New pill group in the Video & Interactivity section, shown **only when the budget slider is on tier 5 (Flagship / XC)**. Two choices:
- **BrightSignOS (Standard)** — default, base price
- **Windows IoT (Win10/Win11)** — adds ₹27,083 surcharge per player

The XC variant SKU rendering automatically adapts: XC2055 becomes "XC2055 - Win10/Win11" in the BOM, Excel SKU column, and quote line items. Implemented via new `XC_WIN_SURCHARGE` constant and `getModelPrice(modelId, osVariant)` helper — single source of truth for all downstream consumers.

### Added — WD105 Wi-Fi module auto-add

When the form's **Wi-Fi = Yes**, the BOM automatically includes one **WD105 Wi-Fi module (₹16,000)** per player. This replaces the previous "WD-105 Wi-Fi / Bluetooth module" text-only BOM line that had no price. One `WD105_PRICE` constant governs the price everywhere.

### Added — Pricing columns in Result page BOM

The BOM table now has four columns: **Line item · Qty · Unit price · Subtotal**. Rows without a fixed price (SSD, CMS line items with vendor-specific pricing) show an em-dash in those columns instead of a number. Totals section at the bottom of the table:

- **Subtotal** — sum of all line totals with prices
- **GST @ 18%** — auto-calculated  
- **Grand total** — indigo gradient highlight row, displayed as bold `₹X,XX,XXX`

All amounts use Indian grouping (`1,23,456`) via the new `formatINR(amount)` helper.

### Added — Real prices in Excel quote export

The Quotation sheet's Unit Price column now contains actual numbers instead of empty amber fill-in cells. Line Total = Qty × Unit Price formulas (`=D7*E7`) now resolve to real values. Subtotal / GST / Grand Total formulas at the bottom populate automatically. Amber fill-in styling is preserved only for rows where we have no price to populate (SSD, generic CMS rows) — these remain as manual fill-in cells for partners.

Implementation approach: prefers to read from `state._bomTotals.rows` which is cached by `buildBOMCard()` every time the Result page renders — this guarantees the Excel and the in-app BOM always agree. Falls back to live price lookup via `getModelPrice()` if the cache is missing (defensive).

### Added — Grand total in mailto email body

The "Email to partner" button's pre-composed email now includes an "Indicative quotation" block after the project details:

```
Indicative quotation: ₹2,56,789 (incl. GST @ 18%)
(Subtotal ₹2,17,618 + GST ₹39,171)
```

Reads from the same `state._bomTotals` cache. Excel description softened from "cells for you to fill" to "BOM line-items + indicative pricing". CTA softened from "for commercial terms, pricing" to "for commercial terms, volume rates".

### Changed — Pricing callout card softened

The "For Pricing & Quotation" glass card that previously said "Contact for best pricing" + "Download the Excel BOM below and email it along with your enquiry for a swift quote" is now titled **"For Better Pricing"** with the eyebrow **"Call Dipenkumar for better pricing"** and the supporting note **"Prices shown above are indicative. Contact Dipenkumar for volume rates, stock position, and PO placement."** Contact pills (email + phone) unchanged. This keeps the CTA to reach Dipenkumar for negotiation without contradicting the in-app prices.

### Internal changes

- New constants: `PRICING`, `XC_WIN_SURCHARGE`, `WD105_PRICE`, `WD105_SKU`, `WD105_NAME`
- New helpers: `formatINR(amount)`, `getModelPrice(modelId, osVariant)`
- `state.form` defaults: added `xcOs:'std'` (3 locations — initial state, `resetForm()` rewrite, edit-mode prefill)
- `buildBOMCard()` — rewritten: 4-column table, row-level `unitPrice`/`lineTotal` fields, totals rows, caches `state._bomTotals = {subtotal, gst, grandTotal, rows}`
- `downloadQuoteExcel()` — BOM rows loop reads from `state._bomTotals.rows` with legacy fallback; unit-price column populated with numbers; amber fill only when no price
- `emailQuoteToPartner()` email body — conditional `Indicative quotation` block when `state._bomTotals.grandTotal` is present
- Pill-group handler — added `xc-os` to keyMap, syncs `#f-xc-os` hidden input
- New visibility wiring: `wireXcOsVisibility()` toggles `#field-xc-os` based on budget slider value (tier 5 only)
- `buildPricingCallout()` — softened copy

### Files in release

- `brightsign-v24-4-19.html` — frontend only (Apps Script v24.5.2 unchanged)

### Deploy

Single-file swap. No backend migration required. Prices are baked into the frontend — **to update prices, edit the `PRICING` map (near line 5880), bump `FRONTEND_VERSION`, and redeploy**.

### Test checklist

1. **New selection → tier 1-4 budget** (LS/HD/XD/XT): XC OS field should be hidden
2. **New selection → tier 5 (Flagship/XC)**: XC OS field appears with Standard pre-selected
3. **Result page BOM with Wi-Fi = Yes**: Includes a WD105 line at ₹16,000/unit
4. **Result page BOM with XC model**: Unit price reflects OS choice (base or +₹27,083)
5. **Grand total row**: Indigo gradient highlight, bold amount
6. **Download Excel**: Unit Price column is populated with numbers (not empty amber cells); Line Totals compute correctly; Subtotal/GST/Grand Total at bottom
7. **Email to partner**: Composed email body contains "Indicative quotation: ₹X,XX,XXX (incl. GST @ 18%)"
8. **Pricing callout card**: Now titled "For Better Pricing", eyebrow says "Call Dipenkumar for better pricing"
9. **Dark mode**: All price text, BOM table, totals rows, pricing callout remain readable
10. **Edit past entry**: Re-opening an old entry populates `xcOs` from stored data (or defaults to `'std'` if missing)

### Known limitations (intentional for this iteration)

- **SSD pricing** not in catalog — shows "Cost excluded" in BOM (your rate card didn't include SSD unit prices)
- **CMS pricing** not in catalog — CMS line items show em-dash in unit price (CMS pricing is vendor/tier dependent and handled separately)
- **No discount field** — per PM decision, prices are final quoted prices, not MRP
- **Sheet-backed pricing** not implemented — per PM decision to start with hardcoded prices; editing prices requires app redeploy

---

## [v24.4.18] — 2026-04-20 · Chart.js text colors theme-aware

Frontend-only patch. Fixes the remaining dark-mode visibility issue in Dashboard charts that v24.4.17 didn't catch.

### Fixed — Chart axis labels and tick text invisible in dark mode

**Root cause:** Chart.js renders text (axis labels, tick numbers, legend text, tooltip content) as actual pixels on an HTML `<canvas>` element. This is fundamentally different from DOM text — **CSS cannot restyle canvas-rendered text**. No amount of `color: var(--ink) !important` will affect what Chart.js paints onto the canvas.

v24.4.17 fixed the chart **card containers** (dark background, visible card titles) but the chart **contents** themselves continued to use hardcoded light-mode colors: `colorInk='#0F172A'` (near-black) for axis labels, `colorMuted='#64748B'` for tick text. On a dark card background these appeared as very dim dark-grey-on-dark-grey text — technically visible if you squinted, but effectively invisible for the user.

Specifically affected:
- **Deal Stage Funnel** — y-axis labels (Lead, Qualified, Proposal, Negotiation, Won, Lost) invisible
- **Top Partners / SI** — partner names on y-axis (Allot, Chintech, Bholenath Agency, DOTCAD, N/A, Vishal Enterprises) invisible
- **City Distribution** — city names on y-axis
- **Activity Timeline** — x-axis date labels and y-axis tick numbers
- **Product Demand charts** — axis labels on both
- Any chart in dark mode used these variables

**Fix:** Added `isDarkTheme` detection at chart render time (reads `data-theme` attribute) and pass theme-aware color values to every Chart.js config:

```js
const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
const colorInk    = isDarkTheme ? '#E2E8F0' : '#0F172A';  // bright slate in dark, near-black in light
const colorMuted  = isDarkTheme ? '#94A3B8' : '#64748B';  // muted slate in dark, slate in light
const colorBorder = isDarkTheme ? 'rgba(148,163,184,0.18)' : '#E2E8F0';  // translucent in dark
```

All existing chart configs already reference these `colorInk` / `colorMuted` / `colorBorder` variables in their `scales.x.ticks.color`, `scales.y.ticks.color`, `scales.x.grid.color`, etc. — so the fix is a single source change that cascades through all 9 charts automatically.

### Fixed — Theme switch while Dashboard is open didn't refresh chart colors

When a user toggles theme (Light / Auto / Dark) while viewing the Dashboard tab, the `data-theme` attribute changes instantly, but the already-rendered charts keep the colors that were baked in when they were first drawn (Chart.js doesn't know the theme changed).

**Fix:** `applyTheme()` now captures the previous theme before applying the new one. If the effective theme actually changed AND there are charts in `window._charts`, it destroys all existing chart instances and (if the Dashboard tab is currently visible) re-renders via `renderDashboard()`. Wrapped in try/catch with graceful fallback so a malformed chart can't break theme switching.

### Files in release

- `brightsign-v24-4-18.html` — frontend only (Apps Script v24.5.2 unchanged)

### Deploy

Single-file swap.

### QA test matrix

| Scenario | Expected |
|----------|----------|
| Dashboard tab in **dark mode** | All axis labels (Lead/Qualified/etc., partner names, city names, date ticks) rendered in bright slate, clearly readable |
| Dashboard tab in **light mode** | Axis labels rendered in near-black, same as before — no regression |
| Switch theme Light → Dark while on Dashboard | Chart text colors should update within ~100ms (charts destroyed + re-rendered) |
| Switch theme while NOT on Dashboard | Charts destroyed (won't leak memory); next time Dashboard opens, charts render fresh with correct colors |

---

## [v24.4.17] — 2026-04-20 · Dark mode polish + remove outdated deployment notes

Frontend-only patch. Addresses 5 specific issues reported from dark-mode QA.

### Fixed — Dashboard chart cards had white backgrounds in dark mode

All 9 charts (Deal Stage Funnel, Model Distribution, Deal Stage Pipeline, User Leaderboard, Top Partners, City Distribution, Activity Timeline, and the two Product Demand charts) rendered with hardcoded `background:#fff` backgrounds. In dark mode this meant white cards with white-ish titles — the chart headings ("Deal Stage Funnel", "Model Distribution", etc.) were nearly invisible.

Added `html[data-theme="dark"] .chart-card-v18, .chart-card` override: dark translucent background, explicit ink colors for titles and subtitles, proper border.

### Fixed — "Alternative Tiers" (Step Down / Step Up) cards unreadable in dark mode

Same pattern: `.alt-card-v21` used a light grey background (`rgba(248,250,252,0.7)`) with `color: var(--indigo)` for the model name. In dark mode `--indigo` is light lavender (for dark-bg text), so the card was pale-grey-on-dark with lavender-on-pale-grey model name — three layers of low contrast.

Added dark overrides: opaque dark background, saturated `#818CF8` for model name (visible against dark), muted `#CBD5E1` for description tags.

### Fixed — "PRIMARY" tier badge in Tender Specs invisible in dark mode

`.tender-section-badge` used `background: var(--indigo)` + white text. In dark mode this resolved to lavender-on-lavender-ish-card. Added dark override pinning badge background to saturated `#4F46E5`. Also fixed the Common (`#64748B`) and Outdoor (`#B45309`) badge variants which had the same issue.

### Removed — "HDMI input — HDCP on OS roadmap" deployment note

Per PM request, this advisory is removed from the Deployment Notes list on the Result page. The note was added when HDCP support on HDMI inputs was still pending on BrightSign's firmware roadmap; it's no longer relevant messaging. Tender spec clauses that mention HDCP in formal documents (for output side, HDCP 2.2) are unchanged — only the advisory on the results page is removed.

### Removed — "confirm CMS scaling early" note for 100+ players

Per PM request, the note triggered when quantity exceeded 100 units is removed. CMS scaling is handled during presales design now; the advisory is no longer needed in the result output.

### Not changed (already working)

- **"Confirm ✓" button** uses `.btn-action`, which got its dark-mode gradient override in v24.4.15/v24.4.16. User's screenshot of a washed-out Confirm was from pre-v24.4.16 deploy; after deploying v24.4.16 or later, button renders correctly in both themes.

### Files in release

- `brightsign-v24-4-17.html` — frontend only (Apps Script v24.5.2 unchanged)

### Deploy

Single-file swap.

### QA test matrix (light + dark modes)

| Location | Check |
|----------|-------|
| Dashboard tab | All 9 chart card titles + subtitles clearly readable |
| Result page → Alternative Tiers | Step Down / Step Up cards show dark bg + visible model text |
| Result page → Tender Specs | PRIMARY / Common / Outdoor tier badges saturated + white text |
| Result page → Deployment Notes | No HDCP roadmap entry, no CMS scaling early entry |
| Result page → action bar | Confirm ✓ button saturated indigo gradient |

---

## [v24.4.16] — 2026-04-20 · Smart close-month picker + Recommend button dark fix

Frontend-only patch.

### Fixed — Recommend button washed-out in dark mode (same root cause as v24.4.15)

v24.4.15 fixed the Add user button but only targeted `.btn-action`. The Recommend button on the form also rendered as lavender in dark mode because it shares the same class. Extended the dark-mode override to cover both `.btn-action` AND `.btn-primary`, with a proper indigo gradient (`#4F46E5 → #6366F1`) and stronger shadow. Now Recommend, Add user, and Sign in all look correct in both themes.

### Changed — Smarter close-month picker

The previous "24 months forward" flat dropdown worked but was clunky — too many options to scroll through, and users often just wanted "this month" or "end of quarter". Replaced with a three-part smart picker:

1. **Quick-pick chips** — one-click selection for common targets:
   - This month
   - Next month
   - End of quarter (Indian FY quarters: Q1 Apr-Jun, Q2 Jul-Sep, Q3 Oct-Dec, Q4 Jan-Mar)
   - End of FY (March 31 of the next April, respecting Indian fiscal year)

2. **Year + Month selectors** — for anything else. Year is 3 years forward (current + 2), Month is all 12. Grid layout on desktop (1fr + 1fr), stacks to single column on mobile (<640px).

3. **Confirmation display** — "✓ Target close: May 2026" in green below the picker, so the user can see exactly what was picked without having to mentally combine Year + Month.

The underlying `f-closemonth` field is now a hidden input holding the YYYY-MM value for backend compatibility. All downstream code (validation, save payload, edit-mode prefill, export) works unchanged.

### Internal changes

- New `pickCloseMonth(value)`, `syncCloseMonth()`, `renderCloseMonthQuickChips()`, `updateCloseMonthDisplay()` helpers.
- `resetForm()` updated to clear new picker state (selects, chips, display).
- `prefillFormUI()` updated to call `pickCloseMonth()` in edit mode so visible widgets sync with the entry's stored value.
- `applyEditLocks()` updated to disable the Year/Month selects and the quick-pick chips (plus visual lock icon) when an edit is in progress for a past entry.
- Full dark-mode CSS for all picker elements.

### Files in release

- `brightsign-v24-4-16.html` — frontend only (Apps Script v24.5.2 unchanged)

### Deploy

Single-file swap.

### Test after deploy

1. **Recommend button:** open New Selection in dark mode → scroll to bottom → button should be saturated indigo, not lavender.
2. **Close-month picker (new entry):**
   - Click "This month" chip → selects auto-fill to current month, display reads "✓ Target close: [Month] [Year]"
   - Change month via dropdown → display updates, chip deselects
   - Click "End of FY" → should pick March of whichever April is next
3. **Close-month picker (edit past entry):**
   - Go to History → Edit on an entry with a close month set
   - Picker should show the entry's month pre-selected in both dropdowns and the display
   - Picker should be locked (disabled) if the entry predates the smart-lock logic
4. **Reset:** after entering a close month, click Reset → picker should fully clear (selects empty, chips deselected, display back to "No month selected yet.")

---

## [v24.4.15] — 2026-04-20 · Add user button dark-mode fix + super self-reset

Frontend-only patch.

### Fixed — "Add user" button washed out in dark mode

Root cause: the `--indigo` CSS variable is redefined in dark mode as `#C7D2FE` (light lavender) so that indigo-colored **text** reads well against dark backgrounds. But `btn-action` used `var(--indigo)` as its **background** with white text — resulting in lavender-on-white in dark mode, basically invisible.

Added dark-mode-specific override that pins the button background to saturated `#4F46E5` (true indigo) with strong indigo shadow, and `#6366F1` on hover. Same button now looks correct in both themes.

### Added — Super can reset their own password

Previously the "🔑 Reset" button in the Team tab's user row was hidden for super-users (`${u.isSuper?'':...}`). This meant if a super got locked into a weird password state, they had no self-service recovery path beyond the manual SHA-256 hash reset in the Sheet.

Now super-users see the Reset button on their own row. Clicking it shows a stronger confirmation dialog explicitly warning that they'll be signed out and forced to set a new password on next login. On success:
- Password is reset to `cavitak@123`
- `mustChange=TRUE` flag is set
- User is automatically signed out
- Next login forces the password-change modal

### Files in release

- `brightsign-v24-4-15.html` — frontend only (Apps Script v24.5.2 unchanged)

### Deploy

Single-file swap.

---

## [v24.4.14] — 2026-04-20 · Accessibility (P3 / architecture review #17)

Frontend-only patch. Addresses accessibility issue #17 from the senior-dev architecture review. No visible UX changes for sighted mouse users; screen-reader and keyboard users get a substantially better experience.

### Added

**Skip-to-main-content link.** First element on every page. Hidden off-screen until focused (keyboard tab from page load), then appears top-left. Lets keyboard users skip the nav and jump directly to content.

**Proper ARIA tab semantics.** The top navigation previously was just a row of buttons with no semantic meaning for assistive tech. Now:
- The nav container uses `role="tablist"` with `aria-label="Main navigation"`
- Each tab button has `role="tab"`, `aria-selected`, and `aria-controls` pointing to its panel
- Each section div has `role="tabpanel"` and `aria-labelledby` pointing to its tab
- `aria-selected` state is dynamically synced when user changes tabs (via `showTab()`)
- Decorative SVG icons inside tabs marked `aria-hidden="true"` so screen readers don't announce redundant "image" labels

**Focus-visible outline.** `*:focus-visible { outline: 3px solid #FBBF24; outline-offset: 2px; }` — keyboard users see a clear gold outline on the currently-focused element (buttons, inputs, links). Mouse users don't see focus rings on click (browser default behavior).

**`prefers-reduced-motion` support.** Users with motion sensitivity (OS-level setting) now get near-zero animation/transition durations. Respects OS accessibility preference without requiring in-app configuration.

**`.sr-only` utility class.** Standard visually-hidden helper for adding screen-reader-only text where a visible label would be redundant.

### Changed

- `.app-nav` div changed to `<nav>` landmark element (proper HTML5 semantic).
- `showTab()` now sets `aria-selected="true"` on the active tab and `"false"` on others, so screen readers announce the current tab correctly.

### Not in this release

Other priorities from the architecture review (#3 backend calculation, #4 rate limiting, #14 multi-tenancy, #15 real-time sync) were scoped for this session but were not safely shipable in the available context budget. They are each substantial enough to deserve their own focused session. Suggested prompts for each are available in Dipenkumar's session log.

### Files in release

- `brightsign-v24-4-14.html` — frontend only (Apps Script v24.5.2 unchanged)

### Deploy

Single-file swap. Replace `index.html` on GitHub. Hard refresh.

### Test checklist

- **Keyboard only:** Tab from page load → skip link appears top-left → Enter → focus moves past header
- **Keyboard only:** Tab through nav → each tab gets gold outline → Space/Enter activates
- **Screen reader (NVDA/JAWS/VoiceOver):** Reads "Main navigation, tablist", each tab announces as "tab, 1 of 5, selected" when active
- **System preference:** Enable "Reduce motion" in OS → animations stop
- No visual regression for typical mouse users

---

## [v24.4.13] — 2026-04-20 · Remove redundant Reset user password button from History

Frontend-only patch.

### Removed

- "🔑 Reset user password" button from the History tab's action bar. Functionality was redundant — the Team tab already has per-user 🔑 Reset buttons on every non-super user row, which is a more discoverable and granular way to reset passwords (the History-tab version was a floating action that prompted for a login name).

Action bar on History tab now just has:
- ↻ Refresh
- ⟳ Retry offline saves (only when queue has items)
- ⤓ Export (CSV / Excel / PDF)
- Clear

The `superResetUserPassword()` function is preserved in the JS in case any other code paths call it, but no UI element invokes it now.

### Files in release

- `brightsign-v24-4-13.html` — frontend only (Apps Script v24.5.2 unchanged)

### Deploy

Single-file swap. Replace `index.html` on GitHub. Hard refresh.

---

## [v24.4.12] — 2026-04-20 · Theme icons + KPI cards fixed

Frontend-only patch. Two reported issues from v24.4.11 screenshots.

### Fixed — Theme pill icons were essentially invisible (showing as dots)

Previous SVG-based icons (filled sun, bold A, filled moon) were not rendering reliably — in the user's screenshot only tiny dots were visible. Root cause suspected to be browser-specific CSS or rendering issue with the SVG markup.

Replaced all 6 theme-pill icons (3 in header + 3 on login page) with simple text characters wrapped in a `.theme-pill-icon` span:
- **Light:** ☀ (U+2600 — black sun with rays)
- **Auto:** A (bold letter A)
- **Dark:** ☾ (U+263E — crescent moon)

These are baseline Unicode characters that render in every browser and OS. Font stack explicitly includes `'Segoe UI Symbol'` / `'Apple Color Emoji'` / `'Noto Sans Symbols'` to ensure the unicode symbols fall back correctly if the system font doesn't have them.

### Fixed — KPI dashboard cards looked too dark in dark mode

User wanted the colorful per-child gradients (indigo / emerald / gold / slate / rose) to appear in BOTH light and dark modes — they look vibrant and distinctive. Previous dark-mode override was replacing them all with a single dark-blue gradient, which user found worse than the original.

Removed the `html[data-theme="dark"] .kpi-tile` override entirely. The per-child gradients now apply in dark mode too. The white label text reads fine on all five gradients regardless of theme.

### Files in release

- `brightsign-v24-4-12.html` — frontend only (Apps Script v24.5.2 unchanged)

### Deploy

Single-file swap. Replace `index.html` on GitHub. Hard refresh.

---

## [v24.4.11] — 2026-04-20 · Dark mode visibility fixes

Frontend-only patch. Addresses three reported dark-mode visibility issues in one CSS batch.

### Fixed

**Theme pill invisible in header after login.** The pill group in the app-header had weaker styling than needed for the dark background. Added a stronger dark override specifically for `.theme-pill-group.theme-pill-header`: higher-opacity background, more visible border, stronger text color. Active-state pill now has a brighter indigo background with a clearly visible ring.

**Top-nav tabs invisible** ("New selection", "History", "Dashboard", "Review", "Team"). The `.app-nav` container had a hardcoded light background (`rgba(255,255,255,0.55)`) with no dark-mode override — so in dark mode it rendered as a light-ish bar that almost blended with the page, and the muted-gray text became unreadable against it. Added dark-mode overrides:
- `.app-nav` dark background (`rgba(11,16,37,0.78)`)
- Tab text color bumped to `#94A3B8`
- Active tab in brighter indigo (`#A5B4FC`)
- Hover state explicitly visible

**Tender specs / BOM / result content washed out or unreadable in dark mode.** Several result-page components had hardcoded light gradients and no dark-mode styling, causing light backgrounds with low-contrast text in dark theme. Added dark overrides for:
- `.tender-view-tabs`, `.tender-view-tab` (including active + hover)
- `.tender-section` + all variants (common / model / premium)
- `.tender-footer-box`
- `.bom-table-v21` — additional coverage for background, header, hover states
- `.result-hero`, `.result-section`, `.bom-card`, `.result-summary-card`
- `.pricing-callout-card`
- `.section-head`, `.section-title`, `.section-num` (form section headers)
- `.form-group label` + choice card text
- Generic catch-all for inline `style="background:#fff"` or `style="background:white"` elements

### Files in release

- `brightsign-v24-4-11.html` — frontend only (Apps Script v24.5.2 unchanged)

### Deploy

Single-file swap. Replace `index.html` on GitHub. Hard refresh.

---

## [v24.4.10] — 2026-04-20 · 1-on-1 briefing in Review tab

Frontend-only patch. Adds the per-user drill-down feature that was requested twice and deferred. No Apps Script changes.

### Added — 1-on-1 briefing

- **Clickable rows in "Funnel by user" table.** Hover highlights the row; click opens a detailed briefing card below the table.
- **Briefing card shows for the selected user:**
  - Summary header with user name, total entry count, and active review period
  - "Stages" chip row — count at each funnel stage (Lead / Opp / Prop / Neg / Order)
  - "Outcomes" chip row — count in each outcome state (Open / Won / Lost / On hold), color-coded
  - Full entry table with: date, project, end-user, partner, city, stage, outcome (color-coded pill), quantity × model
  - Sorted newest entry first
  - ✕ Close button to dismiss
  - Smooth scroll to briefing after open
- **Period-aware.** Briefing respects the same FY/quarter period selected in the Review tab's period selector. A new client-side helper `computePeriodDatesClient()` mirrors the backend's period logic so filtering matches server-side aggregation.
- **Ghost-entry safe.** Same filter as the main History view — entries without refId, timestamp, or project are skipped.

### Use case

Super-user or OEM opens the Review tab → filters to "Q1 FY 26-27" → scrolls to "Funnel by user" → clicks on a team member's row. The briefing card that opens is effectively a ready-made talking-points sheet for a 1-on-1: every deal that person is working on, what stage each is at, what's won / lost / on hold, which partners and end-clients, which cities. All filtered to the period under review.

### Files in release

- `brightsign-v24-4-10.html` — frontend only (Apps Script v24.5.2 unchanged)

### Deploy

Single-file swap. Replace `index.html` on GitHub. Hard refresh.

---

## [v24.4.9] — 2026-04-20 · Role-gated Review + phone & close-month hardening

Frontend-only patch. Three user-reported issues addressed.

### Changed — Review tab role-gated

- **Before:** Review tab visible to all authenticated users.
- **After:** Visible only to users with `isSuper = true` OR `role === 'OEM'`. Presales / Sales / Support users no longer see it — they already have the Dashboard tab showing their own data, and the channel-level analytics in Review were redundant (and potentially confusing) for operational roles.
- Visibility controlled at two layers:
  1. `tab-review` button display toggled in the post-login initialization block
  2. `showTab('review')` route guard — if a non-authorized user somehow navigates there (stale tab state, browser console), they're routed back to History instead of rendering blank cards

### Fixed — Phone number must be exactly 10 digits

- **Before:** v24.4.5 validation accepted 10 digits, 11 with leading 0, or 12 starting with 91. Too lenient.
- **After:** strictly 10 digits. Nothing else accepted.
- **Input hardening:**
  - `maxlength="10"` — browser blocks input beyond 10 chars
  - `oninput="this.value=this.value.replace(/\D/g,'').slice(0,10);"` — strips non-digit characters in real time, so users literally cannot type letters, +, spaces, or hyphens
  - `pattern="[0-9]{10}"` — provides native browser hint on mobile
  - `inputmode="numeric"` — surfaces the numeric keypad on mobile
- Validation error message updated: "Contact phone (must be exactly 10 digits)"

### Fixed — Close month dropdown sometimes not working

- **Root cause:** the field was `<input type="month">`, which has inconsistent support across browsers:
  - Chrome/Edge desktop: works (shows date-picker popup)
  - Firefox desktop: degrades to plain text field with no picker — user has to manually type `YYYY-MM`
  - Safari desktop: plain text field, no picker at all
  - Mobile Safari / mobile Chrome: works but can be finicky
  - This browser-dependent fallback was what users were hitting as "sometimes doesn't work"
- **Fix:** replaced with a reliable `<select>` dropdown populated with 24 months forward from today (e.g., if today is April 2026, options range from April 2026 through March 2028).
- Values still formatted as `YYYY-MM` (same as old input) — no downstream changes needed in payload, validation, edit-mode prefill, or backend.
- New helper: `populateCloseMonthDropdown()` — called once on script parse, with a `DOMContentLoaded` safety-net fallback if the script somehow runs before the DOM is ready.

### Files in release

- `brightsign-v24-4-9.html` — frontend only (Apps Script v24.5.2 unchanged)

### Deploy

Single-file swap. Replace `index.html` on GitHub. Hard refresh.

---

## [v24.4.8] — 2026-04-20 · Hide pricing cards until pricing integration

Frontend-only patch. Monetary cards/columns in the Review tab are now gated behind a `SHOW_PRICING` feature flag (currently `false`). The selector app doesn't yet have product pricing integrated, so showing Pipeline/Won values based on user-entered deal values (removed in v24.4.6) or historical residue from test data was misleading — the observed `₹892739.49 Cr` was data pollution, not real pipeline.

### Added

- **`SHOW_PRICING` const** at top of main script (near `FRONTEND_VERSION`). Set to `true` once product pricing lands and per-entry values can be reliably computed from catalog prices × quantity.

### Changed — Review tab (Channel review)

- **Executive summary:** Pipeline (₹) and Won (₹) KPI tiles hidden. Grid collapses from 5 columns to 3 (Win rate, Active deals, Total entries). CSS variant `.exec-kpi-grid.no-pricing` handles the layout.
- **Business source split:** pivots to deal **counts** instead of ₹ values when pricing hidden. Bar widths computed on count-share rather than ₹-share. Sub-label reads "N total deals" instead of "₹X Cr". Row values read as "N deals" / "1 deal".
- **Funnel:** value column hidden entirely. CSS variant `.funnel-row.no-pricing` drops the column from the grid. Dropped-pills (Lost/On hold) show counts only, not counts-plus-₹.
- **Quarterly breakdown table:** "Pipeline" and "Won" rows hidden. Only "Entries" and "Win rate" rows remain.
- **YoY growth table:** "Total pipeline" and "Won value" rows hidden. "Entries", "Unique partners/consultants/end-clients" rows remain.
- **Funnel by user table:** "Pipeline" and "Won" columns hidden from header and body.
- **Data quality banner:** "missing deal value" warning suppressed entirely when pricing hidden (irrelevant without the field).

### Preserved

- All ₹-aware code paths (`formatINR`, `parseDealValueClient`, backend aggregation) remain intact. Flipping `SHOW_PRICING = true` after pricing integration restores the full monetary view without refactoring.
- Backend aggregation (`handleReviewData` in Apps Script v24.5.1) still computes pipeline/won values — the frontend just chooses not to display them yet.

### Rationale

Per deployment feedback: showing a `₹892739.49 Cr` Pipeline number (clearly junk from earlier test entries) looked unprofessional and confused stakeholders. Since deal value was removed from the form in v24.4.6, new entries contribute 0 to pipeline, so the card only reflects legacy polluted data. Cleaner to hide until the numbers can be trusted.

### Files in release

- `brightsign-v24-4-8.html` — frontend only (Apps Script v24.5.2 unchanged)

### Deploy

Single-file swap. Replace `index.html` on GitHub. Hard refresh.

---

## [v24.4.7 + Apps Script v24.5.2] — 2026-04-20 · Ghost entries purged

Bug: User deleted entries from Google Sheet manually by clearing cell values (Delete key), which left empty rows. Backend read these empty rows and returned them as entries with blank data → frontend rendered them as ghost "1970-01-01 05:30 am" rows that couldn't be deleted (no refId).

### Fixed — Backend (Apps Script v24.5.2)

- **`doGet` read action** now skips empty rows. A row is considered empty if ALL three are missing: refId (column A), valid timestamp (column C with year > 2000), and project name (column G). Such rows are filtered out before being returned to the frontend.

### Fixed — Frontend (v24.4.7)

- **`getVisibleEntries()`** now defensively filters ghost entries. Same logic as backend — need at least one of: refId, valid timestamp (year > 2000), or project name. Catches cases where backend might miss them (e.g., if user hasn't deployed Apps Script v24.5.2 yet).
- Entries with 1970-era timestamps (Unix epoch default) are now always filtered.

### Recommended user action

Even with these fixes, the cleanest state is to properly delete the rows in the Sheet:

1. Open the Sheet
2. Click row header for row 2 (first data row)
3. Shift-click last row with data
4. Right-click → **Delete rows**
5. Hard refresh the app

Using Delete key on cells leaves empty rows that the app still has to filter past on every render (minor performance cost). Deleting entire rows removes them cleanly.

### Files in release

- `brightsign-v24-4-7.html` — frontend
- `apps-script-v24-5-2.gs` — backend

### Deploy

1. **Apps Script first:** paste new code → Save → Deploy → Manage deployments → ✏️ → New version → Deploy
2. **Frontend:** replace `index.html` → commit
3. Hard refresh

---

## [v24.4.6] — 2026-04-20 · Remove Deal value field

Frontend-only patch. Deal value input removed from the New selection form per request.

### Removed

- **Deal value (₹) input field** on the New selection form (section 01, between Lead source and Outcome)
- **`dealValue` from state.form** initialization (both primary + resetForm paths)
- **`dealValue` from form read** in runSelector
- **`dealValue` from buildEntryPayload** — submitted entries no longer include this field
- **`dealValue` from editPastEntry snapshot** and state prefill
- **`dealValue` prefill block in prefillFormUI**

### Preserved (for historical data compatibility)

- **`parseDealValueClient()`** helper — still used by Review tab for reading pre-v24.4.6 entries that have deal values in the spreadsheet
- **`formatINR()`** helper — display utility still used
- **Sheet column AM (dealValue)** — existing data preserved; Apps Script continues to accept it if submitted, just no longer sent from frontend
- **Review tab aggregation** — still sums `dealValue` from historical rows (entries saved before this update)

### Rationale

Deal value was making the form feel heavy for quick preliminary entries. Since most Cavitak entries at early stages don't have firm deal values yet, removing the field streamlines the flow. Review tab can be recalibrated in future to work from quantity × estimated-unit-price if commercial analytics are needed.

### Files in release

- `brightsign-v24-4-6.html` — frontend only (Apps Script v24.5.1 unchanged)

### Deploy

Single-file swap. Replace `index.html` on GitHub. Hard refresh.

---

## [v24.4.5] — 2026-04-20 · Validation + history cache + theme icons

Frontend-only patch addressing 5 user-reported issues.

### Fixed

**1. History tab showed phantom entries after manual row deletion.** `getVisibleEntries()` used `(window._centralLog && window._centralLog.length)` to decide between server data and localStorage fallback. When admin manually deleted all rows from the Sheet, the server returned `[]`, the `.length` check was falsy, and the code fell back to stale browser cache showing already-deleted entries. Fixed with `Array.isArray(window._centralLog)` — if we've fetched from server at all, we trust that result. Applied to all 4 locations. `clearLog()` also updated to clear in-memory `window._centralLog` and trigger a fresh server fetch.

**2. Deal value is no longer required.** Per request — users entering a preliminary selection may not have a confirmed deal value yet. Removed from validation checklist, removed red asterisk from label, updated placeholder to say "optional". Internally still parsed via `parseDealValueClient()` if provided, stored as 0 if blank. Review tab's `missingDealValue` metric still tracks empty values for data quality reporting.

**3. Email now validated as proper format.** Previously accepted any non-empty string — so random text like "abc" was accepted. Now validated against `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/` (simplified RFC 5322). Error message updated to say "must be valid format like name@company.com".

**4. Phone now requires 10 digits.** Previously accepted any non-empty string. Now validates that stripped digits (non-numeric chars removed) count to exactly 10, or 11 starting with 0, or 12 starting with 91 (India country code). So `9876543210`, `+91 9876543210`, `09876543210`, and `+91-98765-43210` all pass. `abc` and `123` are rejected. Input field upgraded with `maxlength="15"` and `inputmode="numeric"` for better mobile keyboards.

**5. Theme pill icons visible in all states.** Previous icons were outline-only with thin strokes that disappeared at 15px in some rendering contexts (reported: icons invisible after login). Rebuilt all 6 SVGs (3 header + 3 login) with:
   - Sun: filled center circle + stroke-based rays (not just outline)
   - Auto: bold "A" letter path (letter is unambiguous at any size, unlike monitor/half-circle)
   - Dark: filled crescent moon (not just outline)
   - Stroke width bumped to 2, with `!important` on stroke color to override any inherited styles
   - Pill size bumped from 30px to 32px, icon size from 15px to 16px
   - Contrast colors hardcoded (`#475569` light, `#CBD5E1` dark) instead of theme-token dependent
   - Active state uses brighter backgrounds for unmistakable selection

### Deferred

- "1-on-1 briefing" per-user drill-down in Review tab — saved for fresh chat (requires new backend endpoint to filter entries by user within period; scope too large for this session).

### Files in release

- `brightsign-v24-4-5.html` — frontend only (Apps Script v24.5.1 unchanged)

### Deploy

Single-file swap. Replace `index.html` on GitHub. Hard refresh.

---

## [Apps Script v24.5.1] — 2026-04-20 · Review data defensive hardening

Backend patch. No schema change. Fixes "Could not load review data: unknown error" by ensuring all error paths surface a real error message instead of bubbling up as a generic failure.

### Fixed / hardened

- **handleReviewData:** every block (schema migration, sheet fetch, aggregation per period, FY math) now wrapped in its own try/catch with a specific error message. If migration fails, you see "Schema migration failed: ...". If aggregation fails for a specific period, you see "Aggregation failed for period FY26-27-Q1: ...". No more silent failures.
- **aggregateReview:** hardened against NaN poisoning. Deal value parsing now checks `isFinite()` — previously `parseFloat(undefined)` returned NaN, which poisoned all downstream sums and could cause JSON serialization to silently fail.
- **aggregateReview:** each row wrapped in try/catch — one malformed row no longer breaks the whole aggregation.
- **Empty sheet:** now returns a fully-structured empty response (with currentFY, empty quarters, etc.) instead of a partial one, so the frontend renders empty cards cleanly instead of throwing.
- **Compare period failure:** if the compare period aggregation fails, we return primary without compare rather than failing the whole review.
- **Full stack trace:** errors now include the full stack trace in the response for debugging (will show in DevTools console).

### Changed

- `APPS_SCRIPT_VERSION` bumped from `24.5` to `24.5.1`.

### Files in release

- `apps-script-v24-5-1.gs` — backend only

### Deploy

Same as any Apps Script update:
1. Open Google Sheet → Extensions → Apps Script
2. Ctrl+A → Delete → paste `apps-script-v24-5-1.gs`
3. Ctrl+S to save
4. Deploy → Manage deployments → ✏️ edit → Version: **New version** → Deploy

---

## [v24.4.4] — 2026-04-20 · Better Review tab error diagnostics

Frontend-only patch. No feature change — just better debugging when something goes wrong.

### Changed

- `renderReview()` now shows a more specific error message when backend returns an unexpected response. If the backend doesn't recognize the `review_data` action (symptom of stale Apps Script deploy), the UI now says "backend did not recognize this action — is the latest Apps Script deployed?" instead of the generic "unknown error".
- Full response logged to console for debugging (check DevTools → Console).

### Files in release

- `brightsign-v24-4-4.html` — frontend only

---

## [v24.4.3] — 2026-04-20 · Theme pill icon visibility fix

Frontend-only patch fixing a reported issue: theme pill icons were barely visible or invisible in dark mode.

### Fixed

- **Inactive pill icon color:** was using `--ink-muted` which is too dim against the dark pill background. Bumped to a fixed `#64748B` (light) / `#94A3B8` (dark) for guaranteed contrast regardless of theme token drift.
- **Stroke width:** icons are tiny (15px) and thin 2px strokes disappeared at that size. Bumped to 2.25px, removed inline `stroke-width="2"` attributes that were overriding CSS.
- **Active pill in dark mode:** background opacity raised from 0.25 to 0.35, icon color changed from `#C7D2FE` to `#E0E7FF` (brighter), border opacity raised from 0.24 to 0.35. Active state is now unmistakable.
- **Auto icon:** the monitor-with-stand icon (rect + horizontal line + vertical stem) was visually cluttered at 15px and the stem went below the pill padding. Replaced with a crisper half-filled-circle icon (the universal "auto/mixed" symbol) that reads clearly at any size.
- **Hover in dark mode:** explicit hover color added (was inheriting muted ink); now bumps to `#E2E8F0` with a more visible background.

### Files in release

- `brightsign-v24-4-3.html` — frontend only

### Deploy

- Single-file swap. Replace `index.html` on GitHub. Hard refresh.

---

## [v24.4.2] — 2026-04-19 · Theme pill (light / auto / dark)

Frontend-only patch. Replaces the 2-state dark/light toggle with a 3-state pill selector that includes an "Auto" mode following the user's OS preference.

### Changed — Theme control UI

- **Old:** Two separate sun/moon toggle buttons (one in header, one on login page) cycling between light and dark on click.
- **New:** A single pill-shaped radio group with three icons: sun (Light), monitor (Auto), moon (Dark). Active mode has a raised card background. Same pill appears in both the header and top-right of the login page.

### Added — Auto mode

- **"Auto"** is now the default for new users. It reads `prefers-color-scheme` from the OS and picks light or dark accordingly.
- **Live-responsive:** if the user has Auto selected and changes their OS theme (e.g., toggles dark mode in system settings), the app switches instantly without needing a refresh. Implemented via `matchMedia().addEventListener('change')`.

### Changed — Storage

- Storage key renamed from `bs-theme` to `bs-theme-mode`.
- Values changed from `dark`/`light` to `light`/`auto`/`dark`.
- **Migration:** on first load after deploy, old `bs-theme` values (dark/light) are copied to `bs-theme-mode` and the old key is removed. Users who explicitly chose dark or light retain that preference. Users who never chose anything default to Auto.

### Changed — Early-paint script

- Inline script in `<head>` (runs before body renders to prevent flash-of-light) now understands the 3-state system. If Auto is active, it reads OS preference immediately.

### Preserved

- Legacy `toggleTheme()` function kept for backward compat, but rewritten to cycle Light → Auto → Dark instead of just Light ⇄ Dark. Not used by any current UI but preserved in case external code calls it.

### Files in release

- `brightsign-v24-4-2.html` — frontend only (Apps Script v24.5 unchanged)

### Deploy

- Single-file swap. Replace `index.html` on GitHub. Hard refresh.

---

## [v24.4.1] — 2026-04-19 · User-facing text sanitization

Frontend-only patch release. No feature changes. No backend changes. All visible strings reviewed and rewritten to speak in user-centric terms — no references to sync, webhook, Sheet1, backup tabs, central log, "uploading", or backend infrastructure.

### Rationale
We don't want users thinking about where their data lives. A user clicks Save — they expect "Saved ✓", not "Logging… Confirming… Uploaded ✓". The previous language leaked implementation: "Central fetch failed · showing local cache", "1 entry pending sync to Google Sheet", "Restore from Backup_2026-04-19 will overwrite Sheet1 contents". Every such phrase replaced.

### Changed — Toasts and notifications
- `logEntry` save toast: "Confirming… / Logging…" → "Saving…"
- `logEntry` offline fallback: "Saved · will upload when connection returns" → "Saved offline · will update when online"
- `refreshLog` success: stripped "(attempt 2)" retry suffix (leaked that retries happen)
- `refreshLog` failure: "Central fetch failed · showing local cache" → "Unable to refresh · showing last known data"
- `clearLog` confirm dialog: "Clear LOCAL history? (Central Google Sheet is not affected.)" → "Clear this device's history view? Your actual entries are safe — this only clears what's shown on this device."
- Pending queue tooltip on History tab badge: "pending sync" → "saved while offline"
- Retry button label: "⟳ Sync now" → "⟳ Retry offline saves" (and auto-hides when queue is empty)
- Post-login toast after pending upload: "N saved entr(y/ies) uploaded ✓" → "N offline entr(y/ies) now saved ✓"

### Changed — Splash screen progress labels
- "Checking connection…" → "Getting things ready…"
- "Syncing entries…" → "Almost there…"
- Removed all progress stages that mentioned sync

### Changed — Health banner
- All four webhook-offline / webhook-error variants rewritten to user-speak:
  - "No webhook URL configured…" → "The app can't reach its service. Some features may be unavailable."
  - "Webhook responded with HTTP X…" → "Connection problem — please refresh or contact your admin."
  - "Webhook is reachable but returned invalid data…" → "The app needs updating — please contact your admin."
  - "Webhook unreachable: Network error…" → "You appear to be offline. Your work is saved here and will update when you're back online."

### Changed — Version indicators
- Footer: "v24.4.0 · Backend v24.5" → "v24.4.1" (backend version stripped)
- Mismatch banner: "A newer version is available (v24.4.1). You are on v24.4.0. Please hard-refresh…" → "An update is available. Please hard-refresh (Ctrl+Shift+R) to get the latest version."

### Changed — Super-admin dialogs (still internal but cleaner)
- Wipe section description: "Deletes every entry in Sheet1 (keeps users, backups, audit log, errors)" → "Deletes all entries from the history. User accounts, backups, audit trail, and error logs are preserved."
- Backup create confirm: "Create a backup of Sheet1 right now? This snapshots the current log into a new Backup_ tab." → "Create a safety backup of all entries right now? Backups older than 30 days are auto-pruned."
- Backup create success: "Backup created: Backup_2026-04-19" → "Backup saved ✓"
- Restore confirm: shows human date ("19 Apr 2026") instead of raw tab name
- Restore confirm: "THIS WILL OVERWRITE current Sheet1 contents" → "THIS WILL OVERWRITE your current history"
- Restore success: removed `restoredFrom` and `safetyBackup` technical names, just says "Your previous state was saved as a safety backup"
- Wipe confirm: removed Sheet1 + Backup_pre_wipe_... references
- Wipe success: "Rows deleted: N · Backup created: Backup_pre_wipe_..." → "All clear ✓ — N entries removed. A safety backup was saved automatically."
- Delete backup: friendly date label + "backup from 19 Apr 2026" phrasing

### Changed — Backup list display
- Row now shows "Mon, 19 Apr 2026" instead of raw "Backup_2026-04-19" tab name
- Special backups get descriptive labels: "Safety backup (before a restore)" / "Safety backup (before clearing data)" instead of exposing `pre_restore_` and `pre_wipe_` prefixes
- Row count shows "3 entries" not "3 rows"

### Unchanged (intentional)
- Console logs (`console.warn`, `console.error`) — only visible in DevTools, not user-facing. Keeping for debugging.
- Apps Script backend code comments — internal to developers.
- CHANGELOG prior entries — history is history.
- Network tab evidence — technically visible if user opens DevTools, but out of scope for UI text review.

### Files in release
- `brightsign-v24-4-1.html` — frontend only (Apps Script v24.5 unchanged)

### Deploy
- Frontend-only patch. Replace `index.html` on GitHub. Hard refresh.

---

## [v24.4.0 + Apps Script v24.5] — 2026-04-19 · Review tab + channel review fields

**Written BEFORE implementation per discipline.**

Adds 3 new fields and a dedicated Review tab focused on channel/principal review reporting (OEM vs Cavitak attribution, ecosystem reach, funnel, YoY/QoQ/YTD growth).

### Added — Form fields

- **`leadSource`** — required dropdown: `OEM-referred` / `Cavitak-generated`. Tracks who originated each opportunity. Directly answers "What % of BrightSign business did Cavitak generate?"
- **`dealValue`** — required number input, Indian rupees. Free-form amount (not a tier). Enables real ₹-denominated pipeline, won-value, growth metrics. Input accepts `125000` or `1.25 L` or `1,25,000` — normalizes on save.
- **`outcome`** — required dropdown: `open` / `won` / `lost` / `on-hold`. Default `open`. Separates active pipeline from closed outcomes. Essential for win-rate calculation.

### Added — Review tab

New top-nav tab visible to all users. Super/OEM see team-wide data; regular users see their own entries only.

- **Period selector** — Indian fiscal year aware:
  - Current quarter (auto-detected)
  - Q1 / Q2 / Q3 / Q4 for FY 25-26 and FY 24-25
  - YTD FY 25-26
  - Full FY 25-26 / FY 24-25
  - Custom date range picker
- **Compare-to selector** — previous period, same period last year, or no comparison
- **Executive summary card** — 5 KPIs: Pipeline ₹, Won ₹, Win rate, Active deals, Entries. Each shows delta vs compare period with colored ↑/↓ indicators
- **Business source card** — OEM vs Cavitak split with ₹ value and %, plus QoQ/YoY delta on each
- **Funnel card** — 5-stage funnel (Lead → Opportunity → Proposal → Negotiation → Order) with deal count, ₹ value, and stage-to-stage retention %. Shows Lost + On-hold counts separately. Total Lead → Order conversion % at bottom
- **Ecosystem reach card** — unique counts of partners, consultants, end-clients in period + "new this period" + YoY comparison for full-year totals
- **Quarterly breakdown table** — Q1/Q2/Q3/Q4 + YTD columns, rows for entries, pipeline ₹, won ₹, win rate
- **YoY growth table** — side-by-side FY 24-25 vs FY 25-26 with growth % for all key metrics
- **Funnel by user table** — per-user stage counts so you can see who's stuck where
- **Data quality banner** — shows count of entries with missing `dealValue` if any (all required going forward, so this should stay at 0)

### Added — Super utility

- **"🗑 Clear all test data"** button in Team tab for super-user. Confirms twice, requires typing "WIPE". Useful for transitioning from test data to production data. Safety net: creates an auto-backup first (`Backup_pre_wipe_YYYY-MM-DD_HH-mm`).

### Added — Apps Script v24.5

- **Sheet1 schema migration** — idempotent `migrateSchemaV245()` function adds 3 new columns: AL (leadSource), AM (dealValue), AN (outcome). Auto-called on first `handleLogPost` after deploy, or manually runnable.
- **New action `review_data`** — returns aggregated metrics for a given period: executive KPIs, business source split, funnel, ecosystem reach, quarterly breakdown, YoY. Heavy compute done server-side so frontend stays snappy.
- **New action `clear_test_data`** — super-only, nukes all Sheet1 data rows (keeps header). Creates pre-wipe backup automatically.
- **Indian FY logic baked in** — `getFYQuarter(date)` helper returns `{fy:'25-26', quarter:'Q3', fyStartMonth:4}`. Used throughout period filtering.

### Changed — Schema

- Sheet1 columns: 37 → **40** (A through AN). Backward compatible: existing 37-column reads still work.
- Entry payload to webhook now includes `leadSource`, `dealValue`, `outcome`.

### Required policy

- All 3 new fields are **required for all entries** (option 3). Since the app hasn't gone live yet and all current data is test data, forcing clean data from day one is correct.
- Super-user has "Clear all test data" button to reset Sheet before go-live.

### Deferred

- PDF/Excel review export → Session 3
- At-risk / aging deals, forecast → Session 2
- Drill-down from summary to filtered entry list → Session 2

### Files in release

- `brightsign-v24-4-0.html` — frontend
- `apps-script-v24-5.gs` — backend
- Updated `CHANGELOG.md`

### Deploy order

1. Apps Script v24.5 first (new actions, schema migration runs automatically)
2. Frontend v24.4.0 to GitHub as `index.html`
3. (Optional) Super-user clicks "Clear all test data" in Team tab before production use
4. Super-user creates new entries with all 3 fields populated

---

## [v24.3.0 + Apps Script v24.4] — 2026-04-19 · Observability & safety foundation

**Written BEFORE implementation per new discipline (issue #6 from architecture review).**

Major stability release. No visible UX changes for regular users — all additions are infrastructure for long-term maintainability, debugging, and data safety. Addresses P0 items from senior-dev architecture review (issues #1, #2, #5, #6).

### Added — Error logging & observability (issue #1)

- **Errors tab** auto-creates in Google Sheet with 9-column schema: `logId, timestamp, user, action, errorCode, errorMessage, stackTrace, userAgent, appVersion`.
- **Frontend global error capture** — `window.onerror` and `unhandledrejection` handlers catch all JavaScript errors (except intentionally thrown validation errors). Each sends a structured error payload to the webhook with context.
- **Apps Script try/catch wrapper** — every handler in `doPost` and `doGet` is now wrapped in try/catch that logs the error to the Errors tab with full stack trace before returning the error response.
- **"⚠ N errors" badge** appears on Team tab for super-user when errors logged in last 24h. Click expands panel showing timestamp, user, action, error message, and truncated stack trace.
- **Filter by severity** — only WARN and ERROR level entries surface in badge count; INFO logs (for debugging) don't trigger alerts but are queryable.
- **New Apps Script actions:** `error_log_append`, `error_log_list`.

### Added — Automated backup & restore (issue #2)

- **Nightly backup** — Apps Script time-trigger runs at 2:00am IST daily. Copies Sheet1 contents to a new tab named `Backup_YYYY-MM-DD`. Self-prunes: keeps last 30 days, auto-deletes older backups.
- **Manual backup trigger** — super-user button "⬇ Backup now" in Team tab for on-demand snapshots before risky operations.
- **Restore UI** — super-only "Backups" section in Team tab lists all available backup tabs with timestamp, row count, and "↻ Restore this backup" button. Confirmation modal warns that restore OVERWRITES current Sheet1 contents (with automatic pre-restore backup as safety net).
- **New Apps Script actions:** `backup_run`, `backup_restore`, `backup_list`, `backup_delete`.
- **Setup function** `setupBackupTrigger()` runs once to install the time trigger. Idempotent.

### Added — Version tracking (issue #5)

- **Frontend version constant:** `FRONTEND_VERSION = '24.3.0'` exposed as `window.FRONTEND_VERSION`.
- **Apps Script version constant:** `APPS_SCRIPT_VERSION = '24.4'` + `MIN_FRONTEND_VERSION = '24.3.0'`.
- **New `ping` action** — returns `{status:'ok', appsScriptVersion, minFrontendVersion, serverTime, sheetId, totalEntries}`. Called by frontend on boot.
- **Version mismatch banner** — if frontend version < min-frontend-version returned by ping, user sees dismissible yellow banner: "A newer version is available. Please hard-refresh (Ctrl+Shift+R) to update."
- **Version display** — muted text in app footer shows "BrightSign Selector v24.3.0 · Backend v24.4". Useful for bug reports.
- **Health check** — ping also verifies that AuditLog, Users, ResetRequests, Errors tabs exist. If any missing, returns `{status:'warn', missing:[...]}` and super-user sees health indicator.

### Process change — CHANGELOG discipline (issue #6)

- **NEW RULE:** CHANGELOG entry is written FIRST, before implementation. This is that entry.
- **NEW RULE:** I reference CHANGELOG before starting work to confirm previous state.
- **NEW RULE:** Every output file gets a version-stamped filename.
- Applied retroactively: all v24.2.x entries through v24.2.15 are now accurate and complete in this CHANGELOG.

### Changed — Version bump 24.2.15 → 24.3.0

- **Minor version bump** (not patch) because this release adds new backend tabs, new frontend UI elements, and new user-facing behaviors (version banner, error badge). Per semver-ish discipline, that's a minor.

### Files in release

- `brightsign-v24-3-0.html` — frontend
- `apps-script-v24-4.gs` — backend
- `CHANGELOG.md` — updated with this entry

### Deploy order

1. Apps Script v24.4 first (backward compatible — existing tabs untouched, new tabs auto-create on first use)
2. Run `setupBackupTrigger()` once from Apps Script editor to install nightly backup
3. Then frontend v24.3.0 to GitHub as `index.html`
4. Hard refresh to pick up new FRONTEND_VERSION

### Known limitations

- Error logging uses no-cors POST (same as main logging). We assume it worked. If error logging itself fails, we'll never know. This is acceptable for v1.
- Backup restore OVERWRITES Sheet1. A partial-restore feature (restore specific rows) is not in scope.
- Errors tab grows forever. Not auto-pruned. Super-user can manually clear or we add retention later.

---



### Fixed
- **The REAL cause of blank space above Dashboard/Team titles** — `#section-dashboard` and `#section-team` were rendered OUTSIDE the `#page-app` wrapper. `#page-app` has `min-height:100vh`. When user clicked Dashboard, `#page-app` was still visible as a 100vh-tall empty container ABOVE the dashboard section — creating ~800px of phantom vertical space before dashboard content could start.
- v24.2.14's font-size and padding tweaks couldn't fix this because the space wasn't from padding at all — it was from an entire empty viewport-height element being sibling to (not parent of) the visible section.

### Changed
- Moved `</div>` closing tag for `#page-app` from after `#section-log` to after `#section-team`, so all 5 sections (form, result, log, dashboard, team) are now properly nested inside `#page-app`.
- No CSS or JS changes required — just HTML structure.

### Verification
- Counted 220 `<div>` opens and 220 `</div>` closes in the page-app scope (lines 4498-4955). Balanced.
- History tab was never affected by this bug because section-log was already inside page-app.

### Files in release
- `brightsign-v24-2-15.html` (frontend only)

---

## [v24.2.15] — 2026-04-19 · Dashboard/Team page-app wrapper fix

### Fixed
- **The REAL cause of blank space above Dashboard/Team titles** — `#section-dashboard` and `#section-team` were rendered OUTSIDE the `#page-app` wrapper. `#page-app` has `min-height:100vh`. When user clicked Dashboard, `#page-app` was still visible as a 100vh-tall empty container ABOVE the dashboard section — creating ~800px of phantom vertical space before dashboard content could start.
- v24.2.14's font-size and padding tweaks couldn't fix this because the space wasn't from padding at all — it was from an entire empty viewport-height element being sibling to (not parent of) the visible section.

### Changed
- Moved `</div>` closing tag for `#page-app` from after `#section-log` to after `#section-team`, so all 5 sections (form, result, log, dashboard, team) are now properly nested inside `#page-app`.
- No CSS or JS changes required — just HTML structure.

### Verification
- Counted 220 `<div>` opens and 220 `</div>` closes in the page-app scope (lines 4498-4955). Balanced.
- History tab was never affected by this bug because section-log was already inside page-app.

### Files in release
- `brightsign-v24-2-15.html` (frontend only)

---

## [v24.2.14] — 2026-04-19 · Actually fix padding/space issue

### Fixed
- **Real cause of "space above page titles"** — it wasn't container padding (already 22px since v24.2.2) but the `.page-title` being a 48px display font with 1.1 line-height = 52.8px tall. Combined with eyebrow + subtitle + margins, the header block took ~160px of vertical real estate before any content started.
- **Root cause of fix not sticking** — there were TWO `.page-title` / `.page-eyebrow` / `.page-subtitle` CSS rules in the file. My v24.2.2 fix touched the first; the second one (defined later) overrode everything due to CSS cascade. Both duplicates now consolidated into one rule set.

### Changed
- `.container` top padding: 22px → **14px**
- `.page-header` bottom margin: 22px → **14px**
- `.page-title` font size: 48px → **32px**, weight 500, line-height 1.15
- `.page-subtitle` font size: 15px → **14px**
- `.page-eyebrow` bottom margin: 12px → **8px**

### Net savings
~80px of vertical space reclaimed above every page title. Dashboard hero, Team list, History search now appear much closer to the nav bar — no more awkward "scroll down to see content" experience.

### Files in release
- `brightsign-v24-2-14.html` (frontend only)

---

## [v24.2.13] — 2026-04-19 · Audit history display polish

Fixes two issues in the v24.2.12 history panel UI.

### Fixed
- **Layout collision** — `.log-entry` was defined as 3-column grid at line 2966 and then overridden as flex-column at line 3037. CSS cascade gave grid priority, so the newly-added `.log-history-panel` and `.log-meta-row` rendered as additional grid cells overlapping the model column. Fix: `.log-entry` is now flex-column natively, with `.log-entry-top` holding the 3-column grid for header content. Panel sits cleanly below the row.

### Changed — Audit display formatting
- **Pretty field names** — `closemonth` → "Close month", `qtyIndoor` → "Qty (indoor)", `cmsVendor` → "CMS vendor" etc. via new `prettifyFieldName()` helper map.
- **Smart value formatting** — ISO timestamps and JS `Date.toString()` output like `"Sun Nov 01 2026 00:00:00 GMT+0530 (India Standard Time)"` now render as `"Nov 2026"`. Empty values show as `(empty)`. Long strings (>60 chars) truncate with ellipsis.
- **Visual polish** — each change row now uses a responsive grid layout: field label · old value · arrow · new value. Old values render on red background with strikethrough, new values on green. On mobile (<720px) they stack vertically with the arrow hidden.
- **Panel entry animation** — history panel slides in smoothly when expanded (6px translate + fade, 240ms).

### Files in release
- `brightsign-v24-2-13.html` (frontend only)

---

## [v24.2.12 + Apps Script v24.3] — 2026-04-19 · Audit log + soft delete + export upgrade

Large release with three independent features. Requires both frontend AND backend deploy.

### Added — Audit log (change history)

- Every edit to a past entry now records a diff (field name, old value, new value, who edited, when).
- New Google Sheet tab **AuditLog** auto-creates on first edit with 7-column schema: `logId, refId, editedBy, editedAt, fieldName, oldValue, newValue`.
- On each history row, a new **↻ History** button expands an inline panel below the row showing full change history for that entry.
- Changes are grouped by edit session (same timestamp = same save operation). Old values shown in red strikethrough, new values in green.
- Deletes and restores also logged (`status: viewed → deleted` and `status: deleted → viewed`).
- Apps Script actions: `audit_log_append` (write), `audit_log_list` (read for one refId).

### Added — Soft delete + Trash

- Super-user sees **🗑 Delete** button on every history row.
- Clicking delete flips the entry's status to `deleted` in Sheet1 (row stays, just hidden from normal views).
- Deleted entries appear in new **Trash section** at bottom of Team tab, showing project, end-user, city, model, qty, original user, timestamp.
- Each trash row has **↻ Restore** button — sets status back to `viewed` and entry returns to history.
- Never auto-purges — deleted entries remain in Sheet forever (per user preference).
- Apps Script actions: `entry_soft_delete`, `entry_restore`, `trash_list`.
- Read action modified to filter out `status=deleted` entries from normal history responses.

### Added — Export upgrade (3 formats)

- CSV button replaced with dropdown **⤓ Export ▾** offering three formats. All respect current filters (date range, user, partner, etc.).
  - **📄 CSV (raw data)** — unchanged from previous behavior.
  - **📊 Excel (formatted)** — uses xlsx-js-style. Features: purple header row with white text, frozen top row, column widths optimized per field, status column color-coded (green for confirmed, gray for viewed, red for deleted), zebra-striped alternating rows. Separate Metadata sheet showing export date, generated-by, total count, and filter summary.
  - **📕 PDF report** — uses jsPDF + autotable. Landscape A4 format. Indigo header strip with "BrightSign Product Selector · Selection History Report" branding. Generated date and user stamp on right side. Below: 5 KPI tiles (total selections, confirmed, unique projects, cities, total players) each in their own colored card. Main table with rows for every entry, status column color-coded. Footer pagination on every page.

### Dependencies added
- `jspdf@2.5.1` (~120KB) via cdnjs
- `jspdf-autotable@3.8.0` (~30KB) via cdnjs

### Apps Script v24.3 schema additions
- New tab: `AuditLog` (auto-creates) — 7 columns
- Sheet1 schema unchanged (still 37 columns), but `status` column (B) can now hold `deleted` value

### Files in release
- `brightsign-v24-2-12.html` — frontend (513KB)
- `apps-script-v24-3.gs` — backend (37KB)

### Deploy order
1. Apps Script first — paste v24.3, Deploy → Manage → New version → Deploy
2. Then frontend HTML to GitHub

---

## [v24.2.11] — 2026-04-19 · Silent retry for central fetch

### Added
- **Silent retry with exponential backoff** — every central log fetch now tries up to 3 times before falling back to local cache. Attempts fire at 0ms, 800ms, and 2000ms. Each attempt has an 8-second timeout via AbortController.
- **Fixes "sometimes showing local only"** — most cases were Apps Script cold-start delay (~2-3s). The retry layer absorbs that without user awareness.
- Silent between retries — no spammy "Retrying..." toasts. Only shows "Central fetch failed · showing local cache" after all 3 attempts fail.
- On success, shows "(attempt 2)" suffix in the success toast if retry was needed — useful for debugging without being alarming.
- New helper functions: `fetchWithTimeout(url, options, timeoutMs)` and `tryFetchCentralLog()`.

### Files in release
- `brightsign-v24-2-11.html` (frontend only)

---

## [v24.2.10] — 2026-04-19 · Never lose an entry (form-owner identity + tab auto-refresh)

Four improvements addressing the "orphan entries with — for user" bug discovered in v24.2.9 and tab staleness.

### Added
- **Form-owner identity persistence** — when user clicks "New selection" tab, their identity (loginName, fullName, role) is snapshotted to `window._formOwner`. If session expires between form-open and submit, the entry still saves with correct user attribution using this snapshot. Captured both at login time and at form-tab-open time.
- **Graceful session-dead handling** — `buildEntryPayload` now prefers live `state.user` but falls back to `_formOwner` snapshot. Only if BOTH are missing does it bounce user to login. No more silent "—" entries in the Sheet.
- **Auto-refresh on tab switch** — clicking History or Dashboard tab now re-fetches central log from Sheet via `refreshLog()`. No more stale data.
- **Recovery toast** — after login, if pending-queue entries for this user existed and got synced during the post-login retry, shows small toast "Synced N entries from earlier session ✓".

### Fixed
- **Orphan entries bug** — rows 29-31 in Sheet1 from earlier testing show "—" for user/login/role because session was gone at save time. v24.2.10 prevents this going forward. Existing orphans need manual correction.

### Files in release
- `brightsign-v24-2-10.html` (frontend only)

---

## [v24.2.9] — 2026-04-19 · Session guard on submit (superseded by v24.2.10)

### Added
- Strict guard blocking submission if `state.user` was null — alert user and bounce to login.

### Superseded
This was the right instinct but wrong implementation. v24.2.10 replaces the blocking behavior with graceful fallback to `_formOwner` snapshot, preserving the user's work instead of interrupting.

### Files in release
- `brightsign-v24-2-9.html` (deprecated, use v24.2.10+)

---

## [v24.2.8] — 2026-04-19 · Smart edit lock (backfill support)

### Added
- **Smart basic-info locks** — when editing a past entry, fields that are EMPTY stay editable so users can backfill data for entries created before that field existed. Fields with values remain locked as before.
- Empty unlocked fields show a yellow **✎ backfill** hint next to their label, making it clear they can be filled.
- Edit mode banner text updated: "Basic info locked where filled · Empty fields can be backfilled" (was: "Basic info locked, only technical fields editable").

### Context
Users with entries created before "Expected closure month" was added couldn't add that field later — it was locked-and-empty. This fix allows incremental backfilling without compromising the lock's primary purpose (preventing accidental overwrite of original project metadata).

### Files in release
- `brightsign-v24-2-8.html` (frontend only)

---

## [v24.2.7] — 2026-04-19 · Critical login fix (user object missing)

### Fixed
- **One-line bug that broke ALL logins** — `authCheckAgainstSheet()` was stripping the `user` object from server responses. Frontend then saw `userRecord = undefined` and showed "Incorrect password or user not set up" even when server returned `status: ok`.
- Bug had been present since v23 but was masked by the offline super fallback. When Apps Script started returning proper `user` objects in v24 and frontend was forced to depend on them, logins broke everywhere.
- Fix: added `user: data.user` to the returned object in the `ok` branch.

### Root cause
Classic case of frontend contract drift. Apps Script `handleAuthCheck` returned `{ status, mustChange, user, lastChanged }`. Frontend helper returned `{ ok, mustChange, lastChanged }` — missing `user`. Login flow then tried to read `authResult.user` which was `undefined`.

### Files in release
- `brightsign-v24-2-7.html` (frontend only)

### Important context for tvONE / Green Hippo ports
If those apps have similar auth flow, port this fix too. Check for `authResult.user` usage — it must be preserved through any auth helper layer.

---

## [v24.2.6] — 2026-04-19 · Mobile responsive polish pass

### Added
Comprehensive mobile polish covering two breakpoints (720px for tablets/small laptops, 480px for phones). This is a best-guess baseline pass — real issues from phone testing will be patched separately.

- **Modals full-screen on phones** — Add User, Edit User, Password Change, Forgot Password, Reset Request modals expand to fit viewport with scrollable content and full-width stacked action buttons (Cancel/Submit). Previously they were fixed-width and could overflow.
- **Dashboard filter bar stacks vertically** — the 5-column filter grid (Date range · State · User · Project · Partner) collapses to a single-column stack on phones. Each filter gets full width, easier to tap.
- **KPI strip becomes 2 columns on phones** — the 4-tile KPI row (Total · Confirmed · Cities · End-users) was getting cramped. Now renders as 2x2 grid on narrow screens.
- **Dashboard charts full-width, stacked** — the 3-column chart grid becomes single-column on phones. Each chart gets full horizontal space, height reduced to 240px for better fit.
- **Team tab polish** — user rows tighten action button spacing, avatar shrinks to 38px, team name sizes down. Team toolbar controls stack vertically on tiny phones.
- **Reset request section** — pending request rows stack their Approve/Deny buttons side-by-side with equal width. Works for tablet and phone.
- **Splash screen scales** — logo card shrinks to 52px, brand name drops to 22px, progress bar narrower. On tiny phones (<480px), logo and brand text stack vertically instead of side-by-side.
- **Touch targets increased** — minimum 44px height on primary/action buttons, 42px on input fields. Meets iOS guidelines for tap targets.
- **App header slims on phones** — user info block hidden, logo shrinks, theme toggle compacts to 36px. Header no longer dominates the viewport.
- **Tab bar horizontal scroll affordance** — already had overflow-x:auto from prior versions, verified still works after polish.

### Files in release
- `brightsign-v24-2-6.html` (frontend only — Apps Script v24.2 unchanged)

### Known limitations
- Dashboard charts on phones are functional but chart titles may truncate. This is expected — Chart.js legend behavior on 320px-wide screens has inherent limits.
- Result page (after running a selection) wasn't specifically optimized yet. Defer to next release if real issues surface.

---

## [v24.2.5] — 2026-04-19 · Chart by model + login footer fix

### Changed
- **Model Distribution chart** (previously "Model Group Mix") now shows individual model numbers instead of series groupings. Before: "HD series / LS series / XD series / XT series". After: "LS425 / XD235 / XT1145 / XC4055" etc., sorted by count descending. Each slice is colored by its series for visual continuity (all LS models blue, all XT models violet, etc.).
- **Login page footer** is no longer absolute-positioned. Previously pinned to `bottom:0` which caused it to clip on shorter viewports. Now flows naturally below the login card using flexbox column layout with 24px gap, ensuring the "Dipenkumar Gajjar · National Product Manager..." contact line is always fully visible regardless of screen size.

### Fixed (reminder)
- **Dashboard/Team blank space above titles** — padding fix from v24.2.2 confirmed in v24.2.5. If still seeing excessive whitespace, it means an older version is cached in GitHub; deploy v24.2.5 to resolve.

### Files in release
- `brightsign-v24-2-5.html` (frontend only)

---

## [v24.2.4] — 2026-04-19 · Edit button layout fix

### Fixed
- **Edit button overlapping model name in History rows.** The right column of each history entry showed the model SKU (e.g. LS425, XD235) with the Edit button rendered inline next to it, causing visual collision. Fixed by making `.log-model` a flex column — model name on top, Edit button directly below with a 10px gap. Right-aligned, proper breathing room.

### Files in release
- `brightsign-v24-2-4.html` (frontend only)

---

## [v24.2.3] — 2026-04-19 · Tab label consistency

### Changed
- **Tab label always reads "History"** — was role-dependent before ("All team" for super, "My history" for regular users). Now consistent for everyone. Data scoping logic is unchanged (super still sees team-wide, regular still sees own).

### Files in release
- `brightsign-v24-2-3.html` (frontend only)

---

## [v24.2.2] — 2026-04-19 · UI polish fixes

### Fixed
- **Excess whitespace above page titles.** Dashboard and Team tabs were showing a large empty area between the nav bar and the content. Reduced container top padding from 40px to 22px and page-header bottom margin from 40px to 22px.
- **Invisible form labels in Add/Edit user modal and Profile tab.** Labels like "LOGIN NAME", "FULL NAME", "ROLE" were using `var(--ink-muted)` at 11px uppercase which rendered nearly invisible against white modal backgrounds. Fixed by switching to `var(--ink)` with opacity 0.85 at 12px — now clearly readable in both light and dark modes.

### Files in release
- `brightsign-v24-2-2.html` (frontend only — Apps Script v24.2 unchanged)

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
