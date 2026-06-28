// BrightSign Selector — Service Worker
//   v2.14.1 — CACHE_NAME bump: dead tvONE-fork removal (phase 2 — code grep-zero).
//   Removed the last executable CALICO/CORIO/MV/tvONE legacy tokens: stripped
//   solutionType/calico_*/mv_*/corio_*/corio_canvases from STRUCTURAL_FIELDS and
//   the calico_inputs/outputs maps from HUMAN_LABELS (sx + LED retained); rewrote
//   __smoke / __smokeUI / __smokeStore / __smokeExportAsync / __smokeIntegration
//   fixtures to BS shapes (Player/HD1026, content/resolution → raw_submission, BS
//   series dashboard filters); removed dead step-validation + reco.cards/chassis
//   probes and fixed two dangling refs (calicoMock, defaultWizard().sx_data);
//   renamed live CSS/markup .mark-tvone→.mark-brand, .login-tvone-logo→
//   .login-brand-logo, repurposed .is-tvone→.is-brightsign (BrightSign lead-source
//   pill now renders). Only changelog/doc prose retains the legacy words. No
//   functional change to BrightSign paths. __smokeUI runs clean (no throw).
//   v2.14.0 — CACHE_NAME bump: dead tvONE-fork removal (phase 1). Removed dead
//   family handlers/renders (solution-pick/vp, mv-input*, corio-audio, renderStep3Mv,
//   renderSavedDealIoSection, familyLabel), __calico_led/__corio_canvas stepper
//   branches, vestigial product-mix + family-count dashboard widgets, calico/mv/corio
//   CATALOG data objects + mocks, and the smoke checks that tested only dead data.
//   sx + LED retained. No functional change to BrightSign paths. (~850 lines.)
// v2.13.3 (2026-06-27)
//
// Changelog (BrightSign):
//   v2.13.3 — CACHE_NAME bump: saved-deal approval badge fix. After Approve/
//     Reject the server persisted the decision correctly, but the saved-deal
//     view kept showing "Approval needed" + both buttons. Cause: the reload
//     re-hydrates via hydrateWizardFromDeal, whose HEADER whitelist drops the
//     discount_approval_* columns, so _renderSdApprovalLine recomputed 'pending'.
//     Fix: the approval columns are now snapshotted into a dedicated var on each
//     deal-get load (never merged into _savedDealData, so buildSavePayload can't
//     leak them into raw_submission) and overlaid only at render time. Soft
//     re-renders preserve the snapshot. One-file frontend change; no backend.
//   v2.13.2 — CACHE_NAME bump: name-resolution fix. The saved-deal header (and
//     every other labelFor caller) showed a raw UUID for a sales/presales owner
//     whose org_function didn't match the role-filtered *_TEAM lists. labelFor
//     now falls back to the full live roster before surfacing a bare id, so
//     owners always render by name. One-function, system-wide fix.
//   v2.13.1 — CACHE_NAME bump: approval workflow round-out. (1) Deal owners
//     (sales + presales) now get an in-app notification when a super
//     approves/rejects their discount — server-side in the approval RPC, so it
//     can't be missed. (2) New Super-only "Pending approvals" queue in the
//     account menu: every deal still awaiting discount sign-off in one focused
//     list (highest-discount first); tap a row to open and decide. Frontend +
//     backend (notification is RPC-side).
//   v2.13.0 — CACHE_NAME bump: honesty-audit close-out. (1) deal_save now
//     archives a full revision snapshot per edit into `revisions` (powers the
//     previously-empty revisions viewer) and carries a coupled party guard that
//     defends linked customer/partner/consultant ids against a name-present /
//     empty-id resave. (2) Real discount-approval workflow: super-tier reviewers
//     Approve / Reject a high-discount deal (>=15%) in place; the decision +
//     covered pct persist and the pending/approved/rejected state is derived on
//     read (history chips + saved-deal badge reflect it). (3) bs_deal_get now
//     returns the approval + v2.12.0 loss fields. UI + backend.
//   v2.12.0 — CACHE_NAME bump: Closed Lost reason capture. Moving a deal to
//     "Closed Lost" (from the saved-deal stage menu OR a History row) now
//     routes through a reason-capture sheet — a single-select 8-reason
//     taxonomy plus optional competitor + notes — instead of the bare
//     terminal confirm. On confirm the stage still moves (sd = autosave
//     pipeline; hist = atomic bs_deal_set_stage) AND loss_reason /
//     loss_competitor / loss_notes persist via the new atomic
//     bs_deal_set_loss_reason RPC. Frontend + additive backend RPC; no SW
//     logic change — bump forces clients onto the new index.html.
//   v2.11.0 — CACHE_NAME bump: quick stage-change from History rows. The stage
//     chip on each active History row is now tappable (caret affordance) and opens
//     the "Move stage" sheet without opening the deal; the pick persists via the
//     new atomic bs_deal_set_stage RPC (sets stage_id + logs stage_transitions +
//     re-stamps the SLA clock), then updates the row chip + aging badge in place.
//     Terminal stages (Won/Lost) still confirm. The quick path logs the transition
//     (auditable) but does NOT notify owners by design (avoids bulk-tidy spam).
//   v2.10.0 — CACHE_NAME bump: Data health panel + per-party export (Super-only).
//     Super avatar menu gains a "Data health" sheet (overview + pipeline hygiene +
//     linking/reconcile + directory + integrity, backed by the expanded
//     bs_health_check / bs_reconcile_parties RPCs), and Customer 360 gains an
//     "Export" button (2-sheet Excel). Frontend + additive backend RPC; no SW
//     logic change — bump forces clients onto the new index.html.
//   v2.9.0 — CACHE_NAME bump: edit-hydration party-link fix. Opening a saved
//     deal in Edit now restores the End user / Partner / Consultant pickers as
//     linked chips (hydrateWizardFromDeal was mapping the *_name fields but not
//     the *_party_id fields), and resaving preserves the links instead of
//     silently NULLing them. Frontend-only, no backend/DB change. No SW logic
//     change — bump exists only to force clients onto the corrected index.html.
//   v2.8.12 — CACHE_NAME bump: saved views (#6) + pipeline report export (#7).
//     Both UI-only, no backend change. #6: per-user History views (filter/stage/
//     region/search/sort) persisted in localStorage, save/apply/delete chips in
//     the History toolbar. #7: "Export pipeline" button → 2-sheet Excel
//     (scoped deal list + by-stage summary) via the existing ExcelJS loader.
//     No SW logic change.
//   v2.8.11 — CACHE_NAME bump: discount-approval signal (#4). UI-only — no
//     backend change. Deals whose effective discount (max of project_discount
//     and any line discount) is >= 15% (mirrors discount_high_list) get an amber
//     "Approval needed · N%" badge on the saved-deal header (auto-updates on
//     inline disc edits) and a compact chip on History rows. No SW logic change.
//   v2.8.10 — CACHE_NAME bump: per-deal follow-up (#2). New deals.next_followup_at
//     + next_followup_note columns; followup_set / followup_due_list RPCs;
//     bs_deal_get patched to surface the fields. Frontend: Home "Follow-ups due"
//     widget (actor-scoped, overdue-flagged) + saved-deal "Set follow-up" sheet
//     (native date + note). No SW logic change.
//   v2.8.9 — CACHE_NAME bump: Customer/party directory wired into the
//     wizard (Step-1 End user / Partner / Consultant pickers backed by
//     party_search / party_upsert RPCs). No SW logic change.
//   v2.8.8 — CACHE_NAME bump: dead-code sweep (8 unused fns + dead
//     .entity-tile component). No SW logic change.
//   v2.8.7 — CACHE_NAME bump: design-consistency pass (cross-theme brand
//     colour fixes + load font weight 800). No SW logic change.
//   v2.8.6 — CACHE_NAME bump so the corrected About build-date (2026-06-26)
//     reaches clients. No SW logic change.
//   v2.8.5 — CACHE_NAME bump: lazy-load ECharts (was eager) + History
//     "Load more". No SW logic change.
//   v2.8.4 — CACHE_NAME bump: removed ~880 lines of dead tvONE-fork / legacy
//     code (showDashboard legacy body, showDashboardLegacy, Corio/LED helpers)
//     + unified phone hint text. No SW logic change.
//   v2.8.3 — CACHE_NAME bump for one-tap stage move (saved-deal chip ->
//     "Move stage" dropdown; reuses the autosave persist/log/notify pipeline).
//     No SW logic change.
//   v2.8.2 — CACHE_NAME bump for the BUG-2 phone cap (Super-admin Users
//     panel phone field maxlength 20 -> 10, numeric). No SW logic change.
//   v2.8.1 — CACHE_NAME bump for the Step 2 "Choose your path" rebuild (segmented
//     Guided/Advanced switch + live preview + Continue CTA). No SW logic change.
//   v2.8.0 — CACHE_NAME bump for the advanced-mode cart/canvas composer (Step 3
//     reworked into a grouped catalog + live "Your build" canvas; same handlers,
//     same advancedSelections shape). No SW logic change.
//   v2.7.7 — CACHE_NAME bump for the quote-PDF fix: rupee sign -> "Rs" so the
//     price column renders + right-aligns correctly (helvetica has no U+20B9).
//     No SW logic change.
//   v2.7.6 — CACHE_NAME bump for the result-page bottom action bar redesign
//     (Confirm primary / Edit ghost / neutral export-share cluster / muted
//     separated Delete) + .sd-view bottom-padding so the bar clears the price
//     toggle. No SW logic change.
//   v2.7.5 — CACHE_NAME bump for the CMS Step-5 redesign (uniform white logo
//     tiles + rebuilt BrightSign asset, Deployment/Term pills, "Cloud (remote)",
//     subscription-block-on-top / brand-last, None dims the block) and an
//     app-wide dark-mode contrast fix (muted text #8A887E->#A3A199 + new
//     --c-accent-text token repointed across 18 accent-text usages). No SW logic change.
//   v2.7.4 — CACHE_NAME bump for Phase 4 close-out: ticker actor names (BUG-1)
//     now read camelCase RPC keys; first-login profile phone hard-capped to 10
//     digits (BUG-2) to match the app-wide standard.
//   v2.7.3 — CACHE_NAME bump for the saved-deal autosave fix: edits (line
//     discount %, ladder steppers) recomputed live but never persisted because
//     the re-render cleared the just-scheduled autosave timer. Guarded so the
//     timer is only cancelled when loading a different deal.
//   v2.7.2 — CACHE_NAME bump for BUG-4: advanced-mode deals lost their cart on
//            reload (showSavedDeal deleted raw_submission before re-hydration).
//            Fixed; advanced render + PDF + Excel now use advancedSelections.
//   v2.7.1 — CACHE_NAME bump for Phase 2: BoQ table mobile scroll (BUG-6),
//            History ₹ gated for Support + toggle parity (BUG-3), OEM =
//            external all-deals viewer (CHANGE-1).
//   v2.7.0 — CACHE_NAME bump for the restored "Pipeline Command" dashboard
//            (deep analytics: India zone+state map, forecast, heatmap, CMS
//            analysis, cross-filter). Old PC5 render block removed.
//   v2.6.0-rc1 — CACHE_NAME bump for the Users admin panel (Super-only
//             user management: list/create/edit/enable-disable/reset).
//             Additive frontend feature. No SW logic change.
//   v2.5.0-rc2 — CACHE_NAME bump for dark-mode contrast fixes (LIVE badge
//             white-on-purple, saved-deal status pills, SX hint strips).
//             CSS-only. No SW logic change.
//   v2.5.0-rc1 — CACHE_NAME bump for the rc1 bundle (Excel clipping fix,
//             dashboard ₹ role-gate + persistent price toggle, days-in-stage
//             from current_stage_entered_at, About-sheet BrightSign wordmark,
//             desktop share → wa.me/mailto). No SW logic change.
//   v2.4.0  — CACHE_NAME bump for USD-master pricing (frontend half):
//             player/accessory/CMS price reads prefer RPC-derived
//             quote_price_inr with unit_price_inr fallback. Price-safe
//             today (bp_usd NULL -> fallback). No SW logic change.
//   v2.3.1  — CACHE_NAME bump: wizard hotfix (CMS-step crash fix, Build
//             button on Step 6, wiz-jump bound). Frontend-only.
//   v2.3.0  — CACHE_NAME bump for the BS close-out (XC-Windows SAP,
//             graceful no-match concern, Poppulo removal). No SW logic change.
//   v2.2.0  — CACHE_NAME bump for the result-page / quote-engine /
//             unified-exports release (hero + quote table + price toggle,
//             CMS rework + pending-scope customization, per-line disc%,
//             bomLines-sourced Excel/PDF with SAP-on-Excel-only,
//             share-sheet PDF). No SW logic change.
//   v2.1.0  — CACHE_NAME bump for the F1–F6 device-feedback release
//             (CMS pricing hardening, advanced-grid clipping, full-bleed
//             footer, dark-theme ladder/BoM legibility, Step-3 caption
//             rhythm, review uplift). No SW logic change.
//   v2.0.2 and earlier — CACHE_NAME bumps only.
//
// NOTE: the changelog below this line is inherited from the tvONE
// service worker this file was forked from — kept for archaeology,
// it does not describe BrightSign releases.
//
// Changelog:
//   v27.16.0 — Home + Dashboard major rebuild ("Command."). Home:
//             operational focus-list (slipped + closing this month) with
//             per-deal days-overdue / days-left, this-week strip, scrolling
//             team ticker — replaces KPI/attention/month-tile grid (moved
//             to Dashboard). Center FAB nav button → New Deal wizard.
//             Dashboard: mission-control telemetry strip, 4 hero KPIs,
//             8-tile velocity grid w/ sparklines, 2 semicircle gauges
//             (win rate + composite health score), month-segment stacked
//             bar, India map with count-scaled region pins, per-rep health
//             badges in sales table. Theme-aware (Choice X — all surfaces
//             obey light/dark). Additive: existing funnel/donut/region/
//             heatmap/filter/saved-views wiring preserved. CACHE_NAME bump.
//   v27.14.0 — Dashboard reframe: stage funnel promoted from 1/3-width
//             tile to full-width top position per owner perspective;
//             regional chart redesigned (Option B) — abstract India SVG
//             blobs replaced with clean horizontal bar chart. Product
//             mentions + Origin split rebalanced to col-6 each. No
//             backend changes. CACHE_NAME bump only.
//   v27.13.2 — OEM donut empty-state fix: when one side is 0, the SVG
//             stroke-linecap:round was rendering the zero-dasharray as a
//             visible rounded dot at the start position. Now handles 3
//             states cleanly: both zero (hide), one zero (full ring), both
//             nonzero (split). CACHE_NAME bump only.
//   v27.13.1 — Dashboard visual fixes (frontend-only): null-safe ticker
//             formatter + ticker CSS overlap fix on Z Fold, 'Unknown' →
//             defensive name cascade with UUID fallback, funnel bar empty
//             state at count=0, attention card label 2-line wrap, "Product
//             mix" → "Product mentions" framing, smoother India zone blobs.
//             No backend changes. CACHE_NAME bump only.
//   v27.13.0 — Security + reliability hardening: CSP meta header, SRI doc
//             comment for ECharts CDN, RPC rate limiter (20/10s/RPC),
//             error_log_list + push_subs_count for #/admin/health view,
//             SLA-crossed cron + push trigger. SW unchanged from v27.12.0
//             other than CACHE_NAME bump.
//   v27.12.0 — Offline draft mode in frontend (no SW logic change here —
//             saves go to IndexedDB on the page, not via SW). CACHE_NAME
//             bump only. Push event handlers unchanged from v27.9.0.
//   v27.9.0 — Tier-1.4 push notifications frontend: SW push event handler
//             + notificationclick handler. Payload schema: {title, body, url}.
//             Notification tag = url to dedupe per-deal updates. Click opens
//             or focuses existing app window, navigates to URL.
//   v27.8.2 — Sprint 1 UX polish: smart close_month default (today+60d),
//             keyboard shortcuts (Ctrl/Cmd+S, /, ?, g+h/d/q/l), Z Fold
//             safe-area inset fix on BoM action bar.
//   v27.8.1 — Tier-1.3 follow-on: stage velocity bars on the dashboard
//             now color by SLA state (fresh/aging/slipped) instead of
//             per-stage palette when SLA is configured. Bar labels show
//             "avg / target" format. No DB changes. Frontend-only ship.
//   v27.8.0 — Tier-1.3 ships: stage aging / SLA badges. Adds
//             stage_sla_days column on pipeline_stages + denormalized
//             current_stage_entered_at on deals. New helpers
//             computeStageAgeBadge / renderStageAgeBadge. Badge renders
//             on saved deals list next to stage chip. Requires
//             MIGRATION-v27_8_0-stage-sla.sql applied first.
//   v27.7.4 — Bundle ships F6 (a11y baseline: openSheet focus management +
//             aria-labelledby + ESC handler + Tab focus trap). No SW logic
//             change — CACHE_NAME bump only.
//   v27.7.3 — Bundle ships F5 (SALES_TEAM / PRESALES_TEAM from live roster
//             at login, no more hardcoded UUID arrays).
//   v27.7.2 — Bundle ships F1 (stages-from-DB), F2 (AP-536 placeholder
//             flag), F3 (de-hardcoded escalation contact), F7 (uncaught
//             error → error_log).
//   v27.7.1 — Manifest fix (minimal manifest, no embedded PNG / hex)
//
// Strategy:
//   - Shell (index.html + CDN scripts): cache-first. On install, prime the
//     cache. On fetch, serve from cache if present; revalidate in background.
//   - Supabase / RPC calls: NEVER cached. Network only. Returning stale RPC
//     data would silently corrupt the dashboard.
//   - Navigation requests: cache-first with offline fallback to cached
//     index.html so the SPA shell still boots without network.
//
// Versioning: bump CACHE_NAME on every release. Old caches are deleted in
// the activate handler. Promotes hard-refresh semantics for users with the
// PWA installed.

const CACHE_NAME = 'brightsign-v2.25.0';
const SHELL_URLS = [
  './',
  './index.html'
];

// Domains whose responses must NEVER be cached.
const NEVER_CACHE_HOSTS = [
  'supabase.co',
  'supabase.in',
  'googleapis.com'  // any Google Identity / OAuth calls
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      // Don't fail install if shell prime errors — let runtime cache it later.
      return cache.addAll(SHELL_URLS).catch(function(err) {
        console.warn('[SW] shell prime failed (non-fatal):', err && err.message);
      });
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) {
        return k !== CACHE_NAME;
      }).map(function(k) {
        return caches.delete(k);
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  const req = event.request;

  // Only handle GET. Non-GET (POST/PATCH/DELETE) goes straight to network.
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  // v1.9.1 — only handle http(s). Browser-extension (chrome-extension://),
  // blob:, data: etc. cannot be put into the Cache API and were throwing
  // "Request scheme 'chrome-extension' is unsupported" (uncaught, noisy).
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return;

  // Skip caching for explicitly-blocked hosts (Supabase RPC, OAuth).
  const isNeverCache = NEVER_CACHE_HOSTS.some(function(host) {
    return url.hostname.indexOf(host) >= 0;
  });
  if (isNeverCache) return;

  // Navigation requests: cache-first with offline fallback to index.html.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(function(resp) {
        // Network fresh — cache the response if successful for future offline use.
        if (resp && resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(req, clone); });
        }
        return resp;
      }).catch(function() {
        // Offline — serve cached index.html shell.
        return caches.match('./index.html').then(function(hit) {
          return hit || caches.match('./');
        });
      })
    );
    return;
  }

  // All other GET (CDN scripts, fonts, etc): cache-first.
  event.respondWith(
    caches.match(req).then(function(hit) {
      if (hit) {
        // Background revalidate — don't wait on the response. Stale-while-revalidate.
        fetch(req).then(function(resp) {
          if (resp && resp.ok && resp.type !== 'opaque') {
            caches.open(CACHE_NAME).then(function(c) { c.put(req, resp.clone()); });
          }
        }).catch(function() { /* offline, ignore */ });
        return hit;
      }
      // Miss — go to network. Cache successful responses.
      return fetch(req).then(function(resp) {
        if (resp && resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(req, clone); });
        }
        return resp;
      });
    })
  );
});

// Allow runtime cache nuke via postMessage. Use sparingly — only for
// debugging "force-refresh" scenarios.
self.addEventListener('message', function(event) {
  if (event.data === 'brightsign:cache:nuke') {
    caches.keys().then(function(keys) {
      keys.forEach(function(k) { caches.delete(k); });
    });
  }
});

// v27.9.0 — Tier-1.4 push notifications. Payload format expected from
// Supabase Edge Function `send_push`:
//   { title: string, body: string, url: string }
// All three are size-limited server-side (title <=80, body <=200). On
// notification click we open or focus the URL in the app's existing
// client window (no new tab if the app is already open).
self.addEventListener('push', function(event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    // Non-JSON or empty payload — show a generic notification rather
    // than silently dropping. Most push services reject empty payloads
    // upstream so this is rare.
    data = { title: 'tvONE', body: 'You have a new update', url: '/' };
  }
  const title = String(data.title || 'tvONE').slice(0, 80);
  const opts = {
    body:  String(data.body  || '').slice(0, 200),
    icon:  './icon-192.png',
    badge: './icon-192.png',
    data:  { url: String(data.url || '/') },
    // tag dedupes notifications: if a new push has the same tag, the
    // OS replaces the old one rather than stacking. URL is a good dedup
    // key since multiple updates to the same deal collapse to one.
    tag:   String(data.url || 'tvone-default')
  };
  event.waitUntil(self.registration.showNotification(title, opts));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // If the app is already open, focus that window + navigate to URL
      for (const c of clientList) {
        if ('focus' in c) {
          c.focus();
          if ('navigate' in c) {
            try { c.navigate(url); } catch (_) {}
          }
          return;
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
