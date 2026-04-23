## [v24.6.0] — 2026-04-23 · Deal value re-introduced + SAP codes in Excel quote

Frontend-only patch. Reverses the v24.4.6 `dealValue` removal now that Cavitak's BrightSign TP price list has been consolidated in the app (present since v24.4.19). Flips `SHOW_PRICING` to `true` so Review-tab ₹ columns (Pipeline, Won, YoY) populate with real values. Adds SAP item codes to the Excel Quotation sheet as a new first-data column for ERP integration.

### Rationale

Per session with Dipenkumar: "Now that we have given prices of all BS player, pipeline value field can be added to BS app." The prior v24.4.6 removal was because no reliable ₹ source existed; v24.4.19 then consolidated PRICING but the form field was never brought back. This release closes that loop. SAP codes were added to the Excel quote so Cavitak ERP/warehouse can drop the BOQ straight into a purchase order without manual SKU translation.

### Added

- **`SAP_CODES` map + `getSapCode(sku)` helper** — 15 SAP item codes covering all Series 5 SKUs (AU335, LS425, LS445, HD225, HD1025, XD235, XD1035, XT245, XT1145, XT2145, XC2055, XC4055), both XC Win10/Win11 variants (SI0010208, SI0010209), and the WD105 Wi-Fi module. Series 6 (HD226/HD1026/XD236/XD1036) deliberately excluded — per Dipenkumar: "SAP is for Series 5 only & as of now do not consider 6 Series player."
- **`computeDealValue(f, r)` helper** — integer-rupee deal value computed from form + result:
  - Single-model: `qty × getModelPrice(model, xcOs).unitPrice`
  - Mixed environment: `(qtyIndoor × indoorPrice) + (qtyOutdoor × outdoorPrice)`
  - Wi-Fi: adds `qty × WD105_PRICE` when `wifi === 'yes'` (one WD105 per player)
  - XC OS variant: automatically applies `XC_WIN_SURCHARGE` (₹27,083) when `xcOs === 'win'`
  - Intentionally excludes CMS, SSD upgrades, installation — those are priced-on-request
- **Deal value (₹) form field** — re-introduced between Outcome and Expected close month on the New Selection form:
  - Auto-fills from `computeDealValue()` on any change to qty / qtyIndoor / qtyOutdoor / model / environment / wifi / XC OS
  - User can type over the value to override (switches to "manual" badge)
  - "Reset to auto" link reverts to auto-calc
  - Displays with Indian grouping (`1,25,000`), accepts flexible input (`1.25 L`, `50k`, `1.5 Cr`)
- **Auto/Manual badge** next to field label — violet "auto" or amber "manual" to signal state at a glance
- **Required validation** — dealValue must be > 0, same pattern as other required fields, inline error highlighting
- **SAP Code column in Excel Quotation sheet** — new column B in the BOM table (between # and SKU), showing SAP code per line item with `—` fallback for non-catalog SKUs (services, custom items). Column width 16 chars, Consolas font, bold.

### Changed

- **`SHOW_PRICING` flag: `false` → `true`** — unhides Pipeline (₹) and Won (₹) KPI tiles in Card 1, the Pipeline/Won quarterly rows in Card 5, the Funnel ₹ values in Cards 3 and 7, and the Total pipeline / Won value rows in Card 6. Also restores the Data quality banner for missing dealValue (but new entries from v24.6.0 onward will all have values, so the banner should stay at 0).
- **`state.form` initialization** — adds `dealValue: 0, dealValueEdited: false` flags
- **`buildEntryPayload()`** — includes `dealValue` in every saved payload (Sheet column AM); schema was already there, just no longer writing `0`
- **`editPastEntry()` snapshot** — reads `entry.dealValue` from the Sheet, treats any non-zero value as a manual override (locks auto-calc so editing an entry preserves its exact stored ₹)
- **`prefillFormUI()`** — writes dealValue into the input field on edit-mode entry, sets badge state
- **Excel Quotation sheet column layout** — shifted from 7 columns (A-G) to 8 columns (A-H):
  - A=#, B=**SAP Code** (new), C=SKU, D=Description, E=Qty, F=Unit Price (₹), G=Gross Total (₹), H=Notes
  - Cell formulas updated: `D{n}*E{n}` → `E{n}*F{n}`; `SUM(F...)` → `SUM(G...)`; `F{subRow}*0.18` → `G{subRow}*0.18`
  - Cell style references shifted: `E4`→`F4` (Quote Ref label), `D8`→`E8` (right-side section header), `C15`→`D15` (model tag right-half); `B15`→`B15+C15` (model-ID fill extends one column right)
  - 17 `!merges` entries updated: full-width merges end at `c:7` instead of `c:6`; interior split-row merges shift by +1 on appropriate sides
  - Autofilter range `A18:G...` → `A18:H...`
  - Column widths prepend `{wch:16}` for SAP Code
- **Existing FY26-27 entries** unchanged per Dipenkumar's instruction — entries saved before v24.6.0 keep their blank `dealValue`; only new entries from this version forward capture ₹. No retroactive migration.

### Not changed

- **Apps Script** — no changes. Sheet column AM (`dealValue`) still exists and still accepts what the frontend sends. Backend `handleReviewData` already aggregates `pipelineValue` and `wonValue` from this column.
- **Tender Compliance sheet** — untouched. Per Dipenkumar: "Quotation sheet only — skip Tender Compliance sheet changes." Tender Compliance has no BOM table; its sole product reference is the "Model Offered" metadata row.
- **Summary sheet** — untouched. Keeps existing project-context layout.
- **Result page** — unchanged. Per Dipenkumar: "do not show on result page but in excel quote add those sap code column."
- **PRIOR_FY_DATA + Review tab Cards 5 and 6** — v24.5.0 FY25-26 invoiced reference remains. With `SHOW_PRICING=true` and real dealValue flowing, Card 6's YoY table now shows **real** current-year pipeline alongside the FY25-26 invoiced baseline. Footnotes still explain the pipeline-vs-invoiced distinction.

### Files in release

- `brightsign-v24-6-0.html` — frontend only (Apps Script v24.5.2 unchanged)

### Deploy

1. Rename `brightsign-v24-6-0.html` → `index.html`
2. Commit to GitHub repo, push
3. Hard refresh (Ctrl+Shift+R)
4. Verify by creating a new entry: pick model XT1145 at qty 10 → Deal value should auto-fill as `14,01,560`
5. Open Review tab: Card 6 should now show real pipeline ₹ on the current-FY side

### Validation run (during build)

All 44 surgical edits succeeded on single-anchor matches. Functional smoke test confirms:
- PRICING lookups return expected values (XC2055 std ₹174,688; XC2055 win ₹201,771; XT1145 ₹140,156)
- SAP codes resolve correctly for every catalog SKU
- `computeDealValue()` accurate for single-model, Wi-Fi, XC Win variant, and mixed-environment cases
- `fmtDealValueInput` ↔ `parseDealValueInput` round-trip preserves exact rupee values
- Flexible input parsing works: "1.25 L", "50k", "1.5 Cr", "1,25,000" all normalize correctly
- All 6 `<script>` blocks parse cleanly; tag balance clean

### Known limitations

- **Old entries stay at 0** — by design. If the team wants a one-time backfill (qty × catalog), it's straightforward as a separate Apps Script utility but out of scope for this release.
- **Price changes require a new HTML deploy** — PRICING and SAP_CODES are hardcoded constants. When Cavitak issues a new rate card, update the consts and ship a version bump. (Future work: move PRICING into a Google Sheets tab like the architecture note in v24.5.0 mentioned.)
- **Series 6 models in the catalog (`available: false`)** — cannot generate dealValue or SAP codes. When they launch India Sept 2026, add pricing and SAP codes then.

### Companion work (still pending)

- Port the v24.2.7 auth fix (missing `user: data.user` return) to the **tvONE** app
- tvONE v24.5.0 equivalent (PRIOR_FY_DATA reference, without dealValue — tvONE stays activity-only per Dipenkumar's earlier choice)
