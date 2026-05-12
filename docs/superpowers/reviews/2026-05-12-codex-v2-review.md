# v2-rebuild Code Review (Codex, 2026-05-12)

## Summary
The rebuilt `index.html` still carries **two hard load-time failures** from the reference multi-plan implementation, so the page will not boot reliably in the browser as committed. After those are removed, the remaining issues are mostly data-substitution gaps: prep items render with the wrong shape, itinerary-to-candidate linking was never wired up, some current-day travel pairs are missing, and the mobile LNB/initial-view behavior does not fully match the spec.

---

## 🔴 Critical (breaks site)

### C-1 — Load-time crash from nonexistent `ITINERARIES.B/C`
- **Location**: `index.html:2416`
- **Issue**: `ITINERARIES` is only declared with plan `A` (`index.html:1488`), but startup still calls `applyDayColors(ITINERARIES.B)` and `applyDayColors(ITINERARIES.C)` (`index.html:2416`, `index.html:2417`). `applyDayColors()` immediately calls `.forEach()` on `undefined`, which throws before the rest of the app can initialize.
- **Fix**: Remove the `B/C` calls, or guard them with `if (ITINERARIES.B) ...`.

### C-2 — `renderPlanTabs()` dereferences removed DOM
- **Location**: `index.html:2872`
- **Issue**: The plan-tabs LNB UI was removed from the DOM, but `renderPlanTabs()` still runs unconditionally at `index.html:2894`. `document.getElementById('planTabs')` / `document.getElementById('planFeatures')` return `null`, so `tabsEl.innerHTML = ...` will throw as soon as C-1 is fixed.
- **Fix**: Delete the leftover `renderPlanTabs()` call, or add a null guard.

---

## 🟡 Important (degrades UX)

### I-1 — Timeline-to-candidate deep links never appear
- **Location**: `index.html:1702`
- **Issue**: `PLACE_TO_CARD` is initialized as `{}` and never populated. `renderTimeline()` expects `PLACE_TO_CARD[it.place]` at `index.html:2575`, so the `📄` candidate-detail buttons never render.
- **Fix**: Populate `PLACE_TO_CARD` from `CANDIDATE_DATA.cards` keyed by `placeId`.

### I-2 — `renderPrep()` prints `[object Object]` for many checklist rows
- **Location**: `index.html:2250`
- **Issue**: The renderer interpolates `${it.task}` as a string, but many prep rows store `task` as an object (`index.html:1764` onward).
- **Fix**: `typeof it.task === 'string' ? it.task : it.task.label`.

### I-3 — 7/28 `Happy Day` stay has no `place`, breaking map/connectors for last day
- **Location**: `index.html:1629`
- **Issue**: The "Happy Day 이동과 휴식" block has no `place`, even though `PLACES` defines `'happy-day'`.
- **Fix**: Add `place: 'happy-day'` to that itinerary item.

### I-4 — Current itinerary transitions missing from `TRAVEL_TIMES`
- **Location**: `index.html:1536`
- **Issue**: Pairs like `cong-caphe-bach-dang -> hyatt-resort-time` and `hyatt-resort-time -> dragon-bridge-show` are not in `TRAVEL_TIMES`, so timeline/map connectors show no travel info.
- **Fix**: Add those pairs to `TRAVEL_TIMES`, or normalize `hyatt-resort-time` to `hyatt` in `getTravelTime()`.

### I-5 — `TRAVEL_COST` still uses source-repo place IDs
- **Location**: `index.html:2382`
- **Issue**: Keys like `DAD-MIKAZUKI`, `MIKAZUKI-FURAMA`, `FURAMA-HOIAN` don't match current v2 IDs. Mode/cost data is dead for all current transitions.
- **Fix**: Rewrite `TRAVEL_COST` keys to current v2 IDs, or remove it until matching data exists.

### I-6 — Timetable grid drops midnight events
- **Location**: `index.html:2783`
- **Issue**: Slots only run `06:00` to `24:00`, but the itinerary includes `00:30` and `00:25` events. Those never appear.
- **Fix**: Extend slots to start at `00:00`, or add an explicit overnight bucket.

### I-7 — Mobile LNB is grid expansion, not overlay
- **Location**: `index.html:616`
- **Issue**: `@media (max-width: 800px)` switches grid columns from `0 1fr` to `240px 1fr`, squeezing the main pane. Spec §4.3.A requires an off-canvas overlay with backdrop.
- **Fix**: Convert to fixed-position off-canvas with transform-based open/close and a backdrop, scoped to `<768px`.

---

## 🟢 Polish (nice to have)

### P-1 — Prep copy still says `5/22 이동`
- **Location**: `index.html:1749`
- **Fix**: Replace with correct v2 travel day or make it generic.

### P-2 — `미카즈키` still appears in archived v1 data
- **Location**: `archive/v1/data/korean-reviews.json:166`
- **Fix**: Document the exception or scrub the archive.

### P-3 — Labels still hard-code "5일 동선" for a 6-day trip
- **Location**: `index.html:1445`, `:2760`, `:3285`
- **Fix**: Derive count from `ITINERARY.length` or use "5박 6일".

---

## Spec Coverage Gaps
- `index.html:2504` initializes `activeTab` to `'all'` — first view should be "일정 mode + day 1 selected" (spec §9-A).
- No `place` data on the first-day arrival/New Orient flow, preventing the airport/hotel map context on first view.
- `@media (max-width: 800px)` should be `768px` (spec §4.3.A).
- Mobile LNB is grid expansion, not overlay + backdrop (spec §4.3.A).
- CSS day tokens still start at `--d20`; spec calls for `--d24` through `--d29`.

---

## Clean Areas
- All live itinerary `place` values that are present resolve to real `PLACES` keys — no dangling live references.
- `getTravelTime()` lookup logic is correct (checks both `from-to` and `to-from`); problem is missing pairs, not the function.
- All main DOM targets for toggles and mode switching exist: `#app`, `#lnb`, `#lnbToggle`, `#timelineToggle`, `#mapToggleBtn`, `#prepWrap`, `#detailBackBtn`.
- No live render code dereferences `PLACES.MIKAZUKI` or `PLACES.FURAMA`; old IDs are confined to `TRAVEL_COST` and archived content.
