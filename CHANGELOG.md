## [v24.7.0] — 2026-04-23 · Project Context standardization (13-field spec, matches tvONE v25.9)

Frontend-only patch. Aligns BrightSign's Project Context section with the unified 13-field spec shared between tvONE and BrightSign. Legacy contact* field names kept populated for backward compatibility — no Sheet rows are orphaned. Per Dipenkumar's stated plan to wipe the Sheet post-deploy, no migration script is needed for existing entries.

### Rationale

Consistent data-entry experience across tvONE and BrightSign. Same field labels, same Venue Type options, same Stage list, same Lead Source values. Review-tab analytics across both apps become directly comparable.

### Added

- **`Venue Type` dropdown** (`f-venueType`) — 34-option list in 7 `<optgroup>` sections. Same list as tvONE v25.9. Replaces the free-text Venue/Location field.
- **`State` dropdown** (`f-state`) — 36 Indian states + union territories. Required field.
- **`CITY_TO_STATE_BS` map + `autoFillStateFromCity()` helper** — when user picks a City, the State dropdown auto-fills if a mapping exists. Covers the 18 cities in BrightSign's existing City dropdown.
- **Partner Contact — Name / Mobile / Email** fields (`f-partnerContactName`, `f-partnerContactPhone`, `f-partnerContactEmail`) — same validation rules as tvONE (10-digit numeric mobile, `type="email"` + regex check for email).

### Changed

- **`FRONTEND_VERSION`: `24.6.0` → `24.7.0`**
- **Lead Source values** normalized to match tvONE:
  - `"OEM-referred"` → `"OEM"` (label: "OEM (BrightSign referral)")
  - `"Cavitak-generated"` → `"Cavitak"` (label: "Cavitak (self-sourced)")
- **`state.form` init and reset** — both occurrences updated to use new field names
- **Label map** — added `venueType`, `state`, `partnerContact*` entries
- **Progress checker** — watches new field IDs
- **Form watcher** — installs listeners on new field IDs
- **Field clearer** — clears new field IDs on reset
- **Form value reads** — reads new field IDs; legacy `contactname/phone/email` state keys mirrored to new values for any code path that still references them
- **Validation** — new field IDs validated; phone still 10-digit-only; email still regex-checked
- **Excel Summary** — Primary Contact row replaced by 3 rows (Name / Mobile / Email) plus new Venue Type + State rows

### Removed

- **`Venue / Location` text field** (`f-venue`) — Venue Type dropdown replaces it. The `state.form.venue` key is also removed; old saved entries retain their `venue` column data on the Sheet but the frontend no longer reads or writes it.

### Not changed

- **Recommendation engine** — fully intact. Technical section (qty, environment, content, resolution, I/O, CMS, budget, XC OS, SSD) is untouched.
- **BOM card + BOM totals** — untouched.
- **Excel Quotation sheet** (with SAP Code column B added in v24.6.0) — untouched.
- **Tender Compliance sheet** — untouched.
- **Deal value** (from `state._bomTotals.subtotal`, v24.6.0 feature) — untouched. Still flows silently to Sheet column AM on save.
- **Review tab** — unchanged.
- **Apps Script backend** — no changes required. The Sheet can accept the new column headers on first write via its existing add-column-on-demand behavior.

### Files in release

- `brightsign-v24-7-0.html` — frontend only (Apps Script v24.5.2 unchanged)

### Deploy

1. Rename `brightsign-v24-7-0.html` → `index.html`
2. Commit to GitHub repo, push
3. Wait ~60 seconds for GitHub Pages propagation
4. Hard refresh (Ctrl+Shift+R) on all active browsers
5. Verify: open New Selection → Project Context should show Venue Type + City, State composite UX + Partner Contact split into 3 fields
6. Test end-to-end: create an entry → save → check Google Sheet for new columns (`venueType`, `state`, `partnerContactName/Phone/Email`) — these will auto-create on first write

### Validation run (during build)

- 21/21 surgical edits on single-anchor matches
- All 6 inline `<script>` blocks parse cleanly via node's `new Function()` check
- Tag balance clean
- No duplicate `id="f-*"` attributes
- Old `f-venue`, `f-contactname`, `f-contactphone`, `f-contactemail`, `value="OEM-referred"`, `value="Cavitak-generated"` all confirmed absent
- Frontend size delta: +5.8 KB (633 → 639 KB)

### Backward compatibility

- `state.form.contactname/contactphone/contactemail` keys still exist in state, populated as mirrors of `partnerContactName/Phone/Email`. Any internal code path (Excel Summary, email template, etc.) that hasn't been updated this release will still receive values.
- Legacy `contactname/phone/email` columns in the Sheet will no longer receive new data (new columns `partnerContactName/Phone/Email` take over), but existing column data is preserved.
- Payload still includes both old and new field names so Apps Script v24.5.2 schema handling stays compatible.

### Known limitations

- **Stage list unchanged** — BrightSign already had the 5-option list (Lead / Opportunity / Proposal / Negotiation / Order), which is what we're standardizing to. tvONE's richer 7-option list got reduced to match.
- **Post-deploy Sheet wipe planned** — per Dipenkumar's note, old BrightSign Sheet entries will be deleted. If the Sheet isn't wiped, old entries will show with new labels but missing venueType/state/partnerContact* values.
- **Lead Source value change is a breaking rename** — existing entries with `leadSource: "OEM-referred"` or `"Cavitak-generated"` will not match the new dropdown's selected state on edit. Either wipe the Sheet as planned, or run a one-time update: `leadSource = leadSource.replace('-referred','').replace('-generated','')`.

### Companion release

- **tvONE v25.9** — shipped same day, same spec.

### Pending (tracked separately)

- Series 6 tender spec reconciliation (HD226/HD1026/XD236/XD1036 — "Launches India Sept 2026")
- Apps Script column header migration (auto-rename `contactname → partnerContactName` etc. on first read) — deferred since Sheet will be wiped
