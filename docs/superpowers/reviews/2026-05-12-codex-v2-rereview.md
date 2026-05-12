# v2-rebuild Re-Review (Codex, 2026-05-12, after fixes)

| ID | Status | Note |
|---|---|---|
| C-1 | VERIFIED | `Object.values(ITINERARIES).forEach(applyDayColors)` runs after B/C/D/E defined. |
| C-2 | VERIFIED | `renderPlanTabs()` has null guard. |
| I-1 | VERIFIED | `PLACE_TO_CARD` populated before first `renderTimeline()`. |
| I-2 | VERIFIED | Prep renderer handles object `task`. |
| I-3 | VERIFIED | 7/28 Happy Day + 7/25 New Orient places attached. |
| I-4 | VERIFIED | `_normalizePlace()` maps hyatt variants in both `getTravelTime` and `getTravelInfo`. |
| I-5 | VERIFIED | `TRAVEL_COST` v2 IDs only. |
| I-6 | VERIFIED | Timetable slots cover 00:00–24:00. |
| **I-7** | **FAIL** | CSS overlay `@media (max-width: 768px)` but JS `isMobile()` uses `<=800`. Range 769–800px broken. |
| P-1, P-3 | VERIFIED | Stale copy cleaned. |
| Plans A–E | VERIFIED | All 5 plans defined, plan tabs click switches ITINERARY. |
| 호이안 7/27 | VERIFIED | Plan A 7/27 is 등불 야경, no 바나힐 reference. |
| **Hoian cards** | **FAIL** | `hoi-an-night-market` and `cam-thanh-coconut` in PLACES but NOT in CANDIDATE_DATA.cards → no PLACE_TO_CARD entry → silent timeline jump failure. |
| **Coords guard** | **FAIL** | `renderMap()` pushes `p.coords` without `undefined` check. Missing/null coords → `L.polyline()` throws → breaks map for that day. |
| activeTab='0' | VERIFIED | Initial state per spec §9-A. |

## Issues remaining
1. **Mobile breakpoint mismatch** — align CSS and JS to 768px.
2. **Hoian incomplete card coverage** — add `hoi-an-night-market` and `cam-thanh-coconut` to CANDIDATE_DATA (or remove from PLACES if not referenced).
3. **Missing coords guard** — `renderMap()` must filter out items where `PLACES[place]?.coords` is missing before pushing.

## Verdict
13 of 16 fixes verified clean. 3 new gaps are incomplete-implementation issues, not regressions.
