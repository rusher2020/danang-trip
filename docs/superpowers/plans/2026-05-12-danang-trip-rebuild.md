# Danang Trip v2 Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `rusher2020/danang-trip` using `first6/family-trip-2605` as base structure/design, with 2026-07-24~29 itinerary as primary content and existing research as +α.

**Architecture:** Single-file static site (`index.html`) with inline `PLACES` / `ITINERARY` / `TRAVEL_TIMES` objects. LNB + main 2-column layout, 4 modes (일정/시간표/후보/준비), Leaflet map. Mobile-first responsive. Old v1 archived, content reorganized to `docs/`. Work on `v2-rebuild` branch, 15 commits, merge to main triggers Pages redeploy.

**Tech Stack:** Vanilla HTML/CSS/JS, Leaflet 1.9.4 (CDN), no build tools, no backend.

**Spec:** `docs/superpowers/specs/2026-05-12-danang-trip-rebuild-design.md`

**Workspace:** `D:\2026\4.개인\danang-trip` (already on `v2-rebuild` branch)

**Reference repo:** Cloned at `/tmp/trip-compare/family-trip-2605/` (re-clone if missing: `git clone https://github.com/first6/family-trip-2605.git`)

---

## File Structure (Target)

```
/
  index.html                # Single-file site
  README.md                 # KakaoTalk-shareable summary
  .gitignore                # +.DS_Store, Thumbs.db, *.log, assets/img/_raw/
  assets/img/
    {category}/{place_id}-{n}.webp
  archive/
    v1/                     # Old index.html, script.js, styles.css, data/, scripts/, configs
    design-notes/           # DESIGN_*.md, SESSION_STATE.md, TRAVELER_FRIENDLY_REDESIGN.md
  docs/
    research/               # research-*.md, danang-family-research-*.md, apis.md, IMAGE_SOURCING.md
    plan/                   # FINAL_TRIP_PLAN.md, expert-itinerary.md, planning.md, questions.md
    superpowers/
      specs/                # design spec (already exists)
      plans/                # this file
  data/                     # Kept temporarily for reference; archived in T15
```

---

## Task 1: Archive v1 and reorganize documentation

**Files:**
- Move (existing → new path) — see steps below
- Create: `archive/v1/`, `archive/design-notes/`, `docs/research/`, `docs/plan/`

- [ ] **Step 1: Verify branch and clean state**

Run from `D:\2026\4.개인\danang-trip`:
```bash
git status
git branch --show-current
```
Expected: `On branch v2-rebuild`, clean working tree (spec already committed).

- [ ] **Step 2: Create target folders**

```bash
mkdir -p archive/v1 archive/design-notes docs/research docs/plan
```

- [ ] **Step 3: Move v1 site assets**

```bash
git mv index.html archive/v1/index.html
git mv script.js archive/v1/script.js
git mv styles.css archive/v1/styles.css
git mv config.example.js archive/v1/config.example.js
git mv config.public.js archive/v1/config.public.js
git mv scripts archive/v1/scripts
```

- [ ] **Step 4: Move design notes / work artifacts**

```bash
git mv DESIGN_APP_TONE_REVISION.md archive/design-notes/
git mv DESIGN_HANDOFF.md archive/design-notes/
git mv DESIGN_QA_NOTES.md archive/design-notes/
git mv DESIGN_QA_ROUND2.md archive/design-notes/
git mv DESIGN_QA_ROUND3.md archive/design-notes/
git mv SESSION_STATE.md archive/design-notes/
git mv TRAVELER_FRIENDLY_REDESIGN.md archive/design-notes/
```

- [ ] **Step 5: Move research MDs**

```bash
git mv research-matrix.md docs/research/
git mv research-notes.md docs/research/
git mv research-report.md docs/research/
git mv danang-family-research-2026.md docs/research/
git mv apis.md docs/research/
git mv IMAGE_SOURCING.md docs/research/
```

- [ ] **Step 6: Move plan MDs**

```bash
git mv FINAL_TRIP_PLAN.md docs/plan/
git mv expert-itinerary.md docs/plan/
git mv planning.md docs/plan/
git mv questions.md docs/plan/
```

- [ ] **Step 7: Update .gitignore**

Edit `.gitignore` to append:
```
# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Raw photo workspace (only curated images are committed)
assets/img/_raw/
```

- [ ] **Step 8: Verify root is clean**

```bash
ls
```
Expected: only `archive/`, `data/`, `docs/`, `README.md`, `.gitignore`, `.nojekyll`. No DESIGN_*.md, no research-*.md, no plan MDs, no v1 site files.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "v2: archive v1 site and reorganize docs"
```

---

## Task 2: Import base structure from reference

**Files:**
- Create: `index.html` (root) — copied from reference and stripped of reference-specific content
- Reference path: `/tmp/trip-compare/family-trip-2605/itinerary.html`

- [ ] **Step 1: Re-clone reference if missing**

```bash
[ -d /tmp/trip-compare/family-trip-2605 ] || (mkdir -p /tmp/trip-compare && cd /tmp/trip-compare && git clone https://github.com/first6/family-trip-2605.git)
```

- [ ] **Step 2: Copy reference itinerary.html to new index.html**

```bash
cp /tmp/trip-compare/family-trip-2605/itinerary.html "/d/2026/4.개인/danang-trip/index.html"
```

- [ ] **Step 3: Replace title and meta**

In `index.html`, find:
```html
<title>다낭 가족여행 · 2026.05.20 ~ 05.24</title>
```
Replace with:
```html
<title>다낭 가족여행 · 2026.07.24 ~ 07.29</title>
```

- [ ] **Step 4: Replace day color tokens (--d20~d24 → --d24~d29)**

In the `:root` CSS block, find:
```css
--d20: #e8a87c;
--d21: #65a3c8;
--d22: #6fb583;
--d23: #a86fb5;
--d24: #e8a233;
```
Replace with:
```css
--d24: #e8a87c;
--d25: #65a3c8;
--d26: #6fb583;
--d27: #a86fb5;
--d28: #e8a233;
--d29: #d4644a;
```

Then global replace in the file (case-sensitive):
- `--d20` → `--d24-`  (temp marker to avoid collisions)
- `--d21` → `--d25-`
- `--d22` → `--d26-`
- `--d23` → `--d27-`
- `--d24` → `--d28-` (skip the new declaration line)
- Then `--d24-` → `--d24`, `--d25-` → `--d25`, etc.

Use Edit tool with `replace_all: true` per token if simpler. The new `--d29` token is unused yet (covers 6th day, T3 will reference it).

- [ ] **Step 5: Clear reference content (PLACES / ITINERARY / TRAVEL_TIMES)**

Find:
```js
const PLACES = {
```
Through the matching closing `};`. Replace contents with:
```js
const PLACES = {};
```

Same for `ITINERARY`:
```js
const ITINERARY = [];
```

Same for `TRAVEL_TIMES`:
```js
const TRAVEL_TIMES = {};
```

- [ ] **Step 6: Clear reference-specific LNB content**

Open `index.html`, locate `<aside class="lnb"` block. Replace inner LNB sections with placeholder skeleton:
```html
<aside class="lnb" id="lnb">
  <div class="lnb-section">
    <h2 class="lnb-title">다낭 가족여행</h2>
    <p class="lnb-sub">2026.07.24 - 07.29 · 5박 6일<br>부부(43·41) + 딸 9세 · 아들 6세</p>
  </div>
  <!-- Sections filled in T6-T8 -->
</aside>
```

- [ ] **Step 7: Local smoke test**

```bash
cd "/d/2026/4.개인/danang-trip" && python3 -m http.server 4177 --bind 127.0.0.1 &
```
Open `http://127.0.0.1:4177/` in browser. Expected:
- Page loads, no JS errors in console
- Empty date tabs (no crash from empty `ITINERARY`)
- Mode bar (일정/시간표/후보/준비) visible
- LNB shows only the trip title placeholder

If JS crashes on empty arrays, locate the render function (e.g., `renderItinerary()`) and wrap with `if (!ITINERARY.length) return;` guards. Don't fix all empty-state handling now — just enough for the page to not crash.

Stop the server: `pkill -f "http.server 4177"` (or close the background process).

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "v2: import base structure from reference (LNB + main + 4 modes, empty content)"
```

---

## Task 3: Add ITINERARY for 2026-07-24~29

**Files:**
- Modify: `index.html` (the `ITINERARY` constant)

**Source:** `data/days.json` (has day-0 through day-5 with blocks)

- [ ] **Step 1: Read source data**

Read `data/days.json` to extract 6 days. Note the structure:
- `id`, `date`, `theme`, `summary`, `blocks: [{time, title, note}]`, `mapPointIds`

- [ ] **Step 2: Define target ITINERARY shape**

Target structure (matches reference renderer expectations):
```js
const ITINERARY = [
  {
    day: "7/24",
    weekday: "금",
    colorVar: "--d24",
    title: "출국·도착",
    summary: "ZE593 20:35 출발, 23:25 다낭 도착. New Orient 체크인.",
    blocks: [
      { time: "20:35", icon: "✈️", title: "ZE593 인천 출발", note: "공항 카운터 체크인" },
      { time: "23:25", icon: "🛬", title: "다낭 도착", note: "입국·수하물 후 New Orient" },
      { time: "00:30", icon: "🏨", title: "New Orient 체크인", placeId: "new-orient" }
    ]
  },
  // 7/25 (--d25), 7/26 (--d26), 7/27 (--d27), 7/28 (--d28), 7/29 (--d29)
];
```

- [ ] **Step 3: Write ITINERARY entries from days.json**

For each day (day-0 → day-5):
- Map `date` → `day` + `weekday`
- Map `theme` → `title`
- Map `summary` → `summary`
- Map `blocks[]`: keep `time`, use `title` as title, `note` as note. Add `icon` based on activity heuristic (✈️ flight, 🏨 hotel, 🍜 meal, 🏖️ beach/pool, 🚌 transport, 🎡 attraction, 💆 spa, 🛍️ shopping)
- Cross-reference with `data/days.json[].mapPointIds` to populate `placeId` on relevant blocks

Insert into `index.html` replacing the empty `const ITINERARY = [];`.

- [ ] **Step 4: Verify renderer**

Reload `http://127.0.0.1:4177/`. Expected:
- 6 day tabs visible (7/24~29) with day colors
- Clicking each tab shows the timeline blocks
- No JS console errors

If tabs not generating: check the renderer function (likely named `renderPlanTabs` or similar in reference) and verify it iterates `ITINERARY` correctly.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "v2: add ITINERARY for 2026-07-24~29 (6 days)"
```

---

## Task 4: Add PLACES with coordinates and Korean review tags

**Files:**
- Modify: `index.html` (the `PLACES` constant)

**Sources:** `data/places.json`, `data/korean-reviews.json`, `data/hotels.json`

- [ ] **Step 1: Inventory required place IDs**

From the ITINERARY committed in T3, collect every unique `placeId` referenced. These are the minimum required entries in PLACES (e.g., `new-orient`, `hyatt`, `happy-day`, `hoian-old-town`, `marble-mountain`, `cong-caphe-bach-dang`, `han-market`, `an-thoi-danang`, ...).

- [ ] **Step 2: Define PLACES schema**

```js
const PLACES = {
  "new-orient": {
    name: "New Orient Hotel Da Nang",
    nameEn: "New Orient Hotel",
    category: "stay",
    lat: 16.0723, lng: 108.2222,
    pinNumber: 1,
    images: ["assets/img/stay/new-orient-1.webp"],  // populated in T13
    koreaReviewTag: "공항 근접 / 깔끔",
    seasonNote: null,
    sourceUrls: ["https://..."]
  },
  // ...
};
```

- [ ] **Step 3: Collect coordinates per spec §5.1**

For each required place:
1. Search Google Maps for the place name
2. Right-click pin → copy coordinates (or copy share URL and parse `@lat,lng,zoom` / `!3d{lat}!4d{lng}`)
3. Record lat/lng to 4 decimals (±50m accuracy per spec)

Pull existing data from `data/places.json` and `data/hotels.json` where available — they may already have addresses to disambiguate.

- [ ] **Step 4: Merge Korean review tags**

Read `data/korean-reviews.json`. For each place that has a review signal, condense it to a 1-line `koreaReviewTag` (≤20 chars, slash-separated keywords). Example: `"가족 / 키즈클럽 / 풀"`.

- [ ] **Step 5: Assign pin numbers**

Pin numbers are per-day (the map shows only the active day's pins). Assign them inside ITINERARY blocks rather than on PLACES, OR keep a global `pinNumber` only for places appearing in a single day. Easier: drop `pinNumber` from PLACES and compute at render time from ITINERARY block order. Verify the reference renderer's expectation by reading the map function in `index.html`.

- [ ] **Step 6: Insert PLACES into index.html**

Replace empty `const PLACES = {};` with the populated object.

- [ ] **Step 7: Visual coordinate verification**

Reload page, switch to each day tab, look at the map. Each pin should land roughly where expected (hotel near beach, market in old town, etc.). Fix any obvious mislocations.

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "v2: add PLACES with coordinates and Korean review tags"
```

---

## Task 5: Add TRAVEL_TIMES matrix

**Files:**
- Modify: `index.html` (the `TRAVEL_TIMES` constant)

**Source:** `data/map-routes.json`, `data/transport.json`, plus Google Maps directions

- [ ] **Step 1: Identify key route pairs**

Core hubs: `new-orient`, `hyatt`, `happy-day`, `airport`, `hoian-old-town`, `marble-mountain`, `han-market`, `dragon-bridge`. Compute ~10-15 most-used pairs (any two hubs that appear in the same day or adjacent days in ITINERARY).

- [ ] **Step 2: Collect travel times**

For each pair, use Google Maps directions at a representative time (weekday afternoon for typical, mention peak in `note`). Record `car` minutes.

- [ ] **Step 3: Write TRAVEL_TIMES**

```js
const TRAVEL_TIMES = {
  "hyatt|hoian-old-town": { car: 35, note: "오후 정체 시 +15분" },
  "hyatt|marble-mountain": { car: 12 },
  "hyatt|airport": { car: 25 },
  "new-orient|hyatt": { car: 20 },
  "happy-day|airport": { car: 15 },
  // ...
};
```

Key format: `"{fromId}|{toId}"` sorted alphabetically so lookups can normalize. Confirm the reference renderer's key convention by reading its travel-time lookup code.

- [ ] **Step 4: Verify travel-time display**

Reload page, view a day with multiple stops. Travel time should appear between pins or blocks. Fix any missing pair entries.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "v2: add TRAVEL_TIMES matrix"
```

---

## Task 6: Fill LNB — flight, hotels, Hyatt programs

**Files:**
- Modify: `index.html` (LNB section)

**Sources:** `data/airline-info.json`, `data/hotels.json`, `data/hyatt-programs.json`

- [ ] **Step 1: Add flight section to LNB**

After the trip title section, add:
```html
<div class="lnb-section">
  <h3 class="lnb-h">항공</h3>
  <div class="lnb-card">
    <div class="lnb-card-row"><strong>ZE593</strong> 7/24 20:35 → 23:25</div>
    <div class="lnb-card-row"><strong>ZE594</strong> 7/29 00:25 → 06:55</div>
    <p class="lnb-card-note">베트남 노선·소아 동반은 카운터 체크인. 영문명 대조 필수.</p>
  </div>
</div>
```

- [ ] **Step 2: Add hotels section**

```html
<div class="lnb-section">
  <h3 class="lnb-h">숙소</h3>
  <div class="lnb-card">
    <div><strong>New Orient</strong> · 7/24 밤 (0.5박)</div>
    <div><strong>Hyatt Regency</strong> · 7/25-7/28 (3박)</div>
    <div><strong>Happy Day</strong> · 7/28 오후-밤 (대기)</div>
  </div>
</div>
```

- [ ] **Step 3: Add Hyatt programs card**

Pull top 4-6 items from `data/hyatt-programs.json` (kids club hours, pools, beach service, breakfast venue, etc.). Compact display:
```html
<div class="lnb-section">
  <h3 class="lnb-h">하얏트 프로그램</h3>
  <ul class="lnb-list">
    <li>Camp Hyatt 키즈클럽 · 09:00-18:00</li>
    <li>워터파크 · 06:00-19:00</li>
    <!-- ... -->
  </ul>
</div>
```

- [ ] **Step 4: Verify LNB rendering**

Reload. LNB shows 3 new sections. Toggle (▾) hides them. Mobile (DevTools 393px) — LNB overlays correctly.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "v2: fill LNB (flight, hotels, hyatt programs)"
```

---

## Task 7: Add emergency one-tap cards

**Files:**
- Modify: `index.html` (LNB)

**Source:** `data/emergency.json` + manual enrichment

- [ ] **Step 1: Build emergency section**

After the Hyatt section:
```html
<div class="lnb-section emergency">
  <h3 class="lnb-h">응급</h3>
  <ul class="lnb-emergency-list">
    <li>
      <a href="tel:+842363821080">한국영사관 +84 236 382 1080</a>
      <a href="https://maps.google.com/?q=Korean+Consulate+Da+Nang" target="_blank">지도</a>
    </li>
    <li>
      <a href="tel:+842363582700">Family Hospital Da Nang +84 236 358 2700</a>
      <a href="https://maps.google.com/?q=Family+Hospital+Da+Nang" target="_blank">지도</a>
    </li>
    <li>SOS International +84 28 3829 8520</li>
    <li>여권 분실 · 영사관 → 임시여권 발급</li>
    <li>카드 분실 · 한국 카드사 분실신고 전화 즉시</li>
  </ul>
</div>
```

Replace the phone numbers with the actual values from `data/emergency.json`. Verify each by reading the JSON.

- [ ] **Step 2: Style emergency cards as tappable**

Add CSS (if not present in base):
```css
.lnb-emergency-list li { padding: 8px 0; border-bottom: 1px solid var(--line-soft); }
.lnb-emergency-list a { display: inline-block; padding: 4px 8px; margin-right: 6px; background: #f3f1ec; border-radius: 6px; color: var(--ink); text-decoration: none; font-size: 12px; }
```

- [ ] **Step 3: Verify on mobile**

DevTools 393px. Tap a `tel:` link in mobile device emulation — should prompt dial. Tap 지도 — opens Google Maps.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "v2: add emergency one-tap cards"
```

---

## Task 8: Add basics + KR-VN expression cards

**Files:**
- Modify: `index.html` (LNB)

**Source:** reference `1-basics/베트남·다낭-기본.md`, `4-candidates/prep-esim.md`, `prep-transport.md`, `prep-hotels.md`. Already cloned at `/tmp/trip-compare/family-trip-2605/`.

- [ ] **Step 1: Extract basics content**

Read reference files. Compile compact list (≤8 items) for LNB:
- 비자: 다낭 e-Visa, 한국 여권 무비자 45일
- 환전: 한국 ATM USD → 현지 환전소 VND (공항보다 시내 유리)
- 매너: 두 손 받기, 머리 만지지 않기, 모자 실내 X
- 안전: 야간 단독 보행 자제, 택시 미터 확인, 그랩 권장
- eSIM: Klook/Trip.com 사전 구매, 도착 즉시 활성화

- [ ] **Step 2: Add basics section**

```html
<div class="lnb-section">
  <h3 class="lnb-h">기본정보</h3>
  <details class="lnb-details">
    <summary>비자·환전·매너·안전</summary>
    <ul class="lnb-list-sm">
      <li>비자: 무비자 45일</li>
      <li>환전: 시내 환전소 권장</li>
      <li>매너: 두 손 받기, 머리 X</li>
      <li>안전: 그랩 권장, 야간 단독 X</li>
      <li>eSIM: 사전 구매 활성화</li>
    </ul>
  </details>
</div>
```

- [ ] **Step 3: Add KR-VN expression cards**

```html
<div class="lnb-section">
  <h3 class="lnb-h">한↔베 표현</h3>
  <details class="lnb-details">
    <summary>현지에서 보여주세요 (15개)</summary>
    <table class="krvn-table">
      <tr><th>한국어</th><th>베트남어</th><th>발음</th></tr>
      <tr><td>안녕하세요</td><td>Xin chào</td><td>씬짜오</td></tr>
      <tr><td>감사합니다</td><td>Cảm ơn</td><td>깜언</td></tr>
      <tr><td>물 주세요</td><td>Cho tôi nước</td><td>쪼또이느억</td></tr>
      <tr><td>안 매워요</td><td>Không cay</td><td>콩까이</td></tr>
      <tr><td>매워요</td><td>Cay quá</td><td>까이꾸아</td></tr>
      <tr><td>얼마예요?</td><td>Bao nhiêu?</td><td>바오니에우</td></tr>
      <tr><td>계산할게요</td><td>Tính tiền</td><td>띤띠엔</td></tr>
      <tr><td>도와주세요</td><td>Giúp tôi</td><td>줍또이</td></tr>
      <tr><td>화장실</td><td>Nhà vệ sinh</td><td>냐베신</td></tr>
      <tr><td>아이 메뉴</td><td>Menu trẻ em</td><td>메뉴쩨엠</td></tr>
      <tr><td>얼음 빼고</td><td>Không đá</td><td>콩다</td></tr>
      <tr><td>아이스</td><td>Đá</td><td>다</td></tr>
      <tr><td>핫</td><td>Nóng</td><td>농</td></tr>
      <tr><td>포장</td><td>Mang về</td><td>망베</td></tr>
      <tr><td>맛있어요</td><td>Ngon</td><td>응온</td></tr>
    </table>
  </details>
</div>
```

- [ ] **Step 4: Add tap-to-zoom JS**

Append to existing `<script>` block:
```js
document.querySelectorAll('.krvn-table td').forEach(td => {
  td.addEventListener('click', () => {
    const big = document.createElement('div');
    big.className = 'krvn-zoom';
    big.textContent = td.textContent;
    big.addEventListener('click', () => big.remove());
    document.body.appendChild(big);
  });
});
```

And CSS:
```css
.krvn-zoom { position: fixed; inset: 0; background: rgba(0,0,0,.85); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 48px; z-index: 9999; cursor: pointer; }
```

- [ ] **Step 5: Verify**

Tap KR-VN cells — large overlay shows. Tap to dismiss.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "v2: add basics + KR-VN expression cards"
```

---

## Task 9: Candidates pool with 8+1 categories and detail view

**Files:**
- Modify: `index.html` (PLACES additions + candidates rendering)

**Source:** reference `4-candidates/0-전체-후보-풀.md` through `9-공항·라운지.md`. Apply spec §5.1.A filter (3/4 criteria).

- [ ] **Step 1: Define category list**

```js
const CANDIDATE_CATEGORIES = [
  { id: "nature", label: "자연·해변" },
  { id: "culture", label: "사찰·문화" },
  { id: "experience", label: "체험" },
  { id: "cafe", label: "카페·디저트" },
  { id: "food", label: "식당" },
  { id: "night", label: "야간·엔터" },
  { id: "shopping", label: "쇼핑·시장" },
  { id: "spa", label: "숙소·스파" },
  { id: "airport", label: "공항·라운지" }
];
```

- [ ] **Step 2: Curate candidates per category**

For each category, read the reference MD file. Apply 4-criterion filter:
- (a) 7월 우천 시 실내 대안 or 우산 OK
- (b) 6세·9세 OK
- (c) 하얏트/Happy Day 편도 45분 이내
- (d) 한국어 후기 or 공식 사이트

Mark each candidate with `passedCriteria: ["a","b","c","d"]` and include only those passing 3+. For 1-or-2 passers, include with `dim: true` flag for greyed display.

Target: 5-10 candidates per category. Add each to `PLACES` with `category` matching the category id.

- [ ] **Step 3: Add candidates renderer**

Find the existing candidates mode render function in `index.html`. Confirm it iterates `PLACES` by category. If not, add:
```js
function renderCandidates() {
  const wrap = document.querySelector('.candidates-wrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  CANDIDATE_CATEGORIES.forEach(cat => {
    const places = Object.entries(PLACES).filter(([id,p]) => p.category === cat.id);
    if (!places.length) return;
    const section = document.createElement('section');
    section.innerHTML = `<h3>${cat.label}</h3><div class="cand-grid"></div>`;
    const grid = section.querySelector('.cand-grid');
    places.forEach(([id,p]) => {
      const mark = localStorage.getItem(`danang-trip-v2:candidate:${id}`) || '';
      const card = document.createElement('article');
      card.className = `cand-card ${p.dim ? 'dim' : ''} mark-${mark}`;
      card.innerHTML = `
        <img src="${p.images?.[0] || 'assets/img/placeholder.webp'}" alt="${p.name}">
        <h4>${p.name}</h4>
        <p class="tag">${p.koreaReviewTag || ''}</p>
        ${p.seasonNote ? `<p class="season-note">${p.seasonNote}</p>` : ''}
        <div class="mark-row">
          <button data-mark="yes">✅</button>
          <button data-mark="skip">⏭️</button>
          <button data-mark="maybe">❓</button>
        </div>`;
      card.querySelectorAll('.mark-row button').forEach(b => {
        b.addEventListener('click', e => {
          const v = e.target.dataset.mark;
          localStorage.setItem(`danang-trip-v2:candidate:${id}`, v);
          card.className = `cand-card ${p.dim ? 'dim' : ''} mark-${v}`;
        });
      });
      grid.appendChild(card);
    });
    wrap.appendChild(section);
  });
}
```

- [ ] **Step 4: Style marks**

```css
.cand-card.mark-yes { outline: 2px solid #6fb583; }
.cand-card.mark-skip { opacity: 0.4; }
.cand-card.mark-maybe { outline: 2px dashed #e8a233; }
.cand-card.dim { opacity: 0.55; }
.cand-card.dim .season-note { color: #b00; }
```

- [ ] **Step 5: Verify**

Switch to 후보 mode. Cards render by category. Click ✅/⏭️/❓ — mark persists after reload.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "v2: add candidates pool with 8+1 categories and detail view"
```

---

## Task 10: Timetable mode (6-day grid)

**Files:**
- Modify: `index.html` (timetable section)

- [ ] **Step 1: Find timetable section in reference HTML**

The reference base already has a `.timetable-section` element. Verify by grepping `index.html` for `mode-timetable`. If it has placeholder content, replace; if empty, build from scratch.

- [ ] **Step 2: Implement timetable renderer**

```js
function renderTimetable() {
  const wrap = document.querySelector('.timetable-section .timetable-wrap');
  if (!wrap) return;
  const hours = ["08","10","12","14","16","18","20","22"];
  let html = '<table class="timetable"><thead><tr><th></th>';
  ITINERARY.forEach(d => html += `<th style="color:var(${d.colorVar})">${d.day}<br><small>${d.weekday}</small></th>`);
  html += '</tr></thead><tbody>';
  hours.forEach(h => {
    html += `<tr><th>${h}:00</th>`;
    ITINERARY.forEach(d => {
      const cell = d.blocks.find(b => b.time.startsWith(h));
      html += `<td>${cell ? `${cell.icon || ''} ${cell.title}` : ''}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  wrap.innerHTML = html;
}
```

Hook it into the mode switcher (likely already calls render on mode change).

- [ ] **Step 3: Style timetable**

```css
.timetable { width: 100%; border-collapse: collapse; font-size: 12px; }
.timetable th, .timetable td { border: 1px solid var(--line); padding: 6px; text-align: left; vertical-align: top; min-width: 80px; }
.timetable thead th { position: sticky; top: 0; background: var(--panel); }
@media (max-width: 768px) { .timetable { font-size: 10px; } .timetable th, .timetable td { padding: 3px; min-width: 60px; } }
```

- [ ] **Step 4: Verify**

Switch to 시간표 mode. 6 day columns × 8 hour rows. Mobile scrolls horizontally if needed.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "v2: add timetable mode (6-day grid)"
```

---

## Task 11: Prep mode (checklist, packing, shopping)

**Files:**
- Modify: `index.html` (prep section)

**Sources:** `data/packing.json`, `data/shopping.json`, `data/checklist.json`

- [ ] **Step 1: Read source JSON**

Inspect `data/packing.json` and `data/shopping.json` for structure. Likely arrays of items with `category`, `name`, `done` (optional).

- [ ] **Step 2: Implement prep renderer**

```js
function renderPrep() {
  const wrap = document.querySelector('.prep-section');
  if (!wrap) return;
  wrap.innerHTML = `
    <section class="prep-block">
      <h3>출국 전 체크리스트</h3>
      <ul class="prep-checklist" data-key="predeparture">
        ${PREP_PRE_DEPARTURE.map(t => `<li><label><input type="checkbox" data-item="${t}"> ${t}</label></li>`).join('')}
      </ul>
    </section>
    <section class="prep-block">
      <h3>짐 (가족 공통)</h3>
      <ul class="prep-checklist" data-key="packing-common">
        ${PACKING_COMMON.map(t => `<li><label><input type="checkbox" data-item="${t}"> ${t}</label></li>`).join('')}
      </ul>
    </section>
    <section class="prep-block">
      <h3>아이 (6·9세)</h3>
      <ul class="prep-checklist" data-key="packing-kids">
        ${PACKING_KIDS.map(t => `<li><label><input type="checkbox" data-item="${t}"> ${t}</label></li>`).join('')}
      </ul>
    </section>
    <section class="prep-block">
      <h3>쇼핑 리스트</h3>
      <ul class="prep-list">${SHOPPING.map(s => `<li>${s}</li>`).join('')}</ul>
    </section>`;
  // Restore checked state from localStorage
  wrap.querySelectorAll('.prep-checklist').forEach(ul => {
    const key = ul.dataset.key;
    ul.querySelectorAll('input').forEach(cb => {
      cb.checked = localStorage.getItem(`danang-trip-v2:prep:${key}:${cb.dataset.item}`) === '1';
      cb.addEventListener('change', () => localStorage.setItem(`danang-trip-v2:prep:${key}:${cb.dataset.item}`, cb.checked ? '1' : '0'));
    });
  });
}
```

- [ ] **Step 3: Populate constants**

At top of `<script>`, add:
```js
const PREP_PRE_DEPARTURE = [
  "여권 유효기간 6개월+ 확인",
  "ZE593·ZE594 예약확인서 출력",
  "Hyatt·New Orient·Happy Day 바우처",
  "eSIM 구매·QR 저장",
  "USD → VND 환전",
  "여행자보험"
];
const PACKING_COMMON = [/* from data/packing.json */];
const PACKING_KIDS = [/* from data/packing.json kids items */];
const SHOPPING = [/* from data/shopping.json */];
```

- [ ] **Step 4: Verify**

Switch to 준비 mode. Checkbox state persists.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "v2: add prep mode (checklist, packing, shopping)"
```

---

## Task 12: Weather cards (July rainy season averages)

**Files:**
- Modify: `index.html` (add `WEATHER` constant + render in day header)

- [ ] **Step 1: Add static July averages**

7월 다낭 평년값 (Vietnam Meteorological data, public):
```js
const WEATHER = {
  "7/24": { high: 33, low: 26, rain: 55, uv: 10, advice: "오후 소나기 대비, 우산 + 실내 대안" },
  "7/25": { high: 33, low: 26, rain: 50, uv: 11, advice: "야외 OK, 오후 4시 이후 활동" },
  "7/26": { high: 32, low: 25, rain: 60, uv: 10, advice: "실내 비중↑" },
  "7/27": { high: 33, low: 26, rain: 55, uv: 11, advice: "야외 OK, 자외선 차단" },
  "7/28": { high: 32, low: 25, rain: 65, uv: 9, advice: "실내·스파 권장" },
  "7/29": { high: 32, low: 25, rain: 60, uv: 10, advice: "공항 이동, 가볍게" }
};
```

- [ ] **Step 2: Render weather in day header**

Find the `renderItinerary` (or day header render) function. Inside the day block template, add:
```html
<div class="weather-card">
  ${WEATHER[day.day] ? `
    <span class="w-temp">🌡 ${WEATHER[day.day].high}°/${WEATHER[day.day].low}°</span>
    <span class="w-rain">☔ ${WEATHER[day.day].rain}%</span>
    <span class="w-uv">☀ UV ${WEATHER[day.day].uv}</span>
    <span class="w-advice">${WEATHER[day.day].advice}</span>
  ` : ''}
</div>
```

- [ ] **Step 3: Style**

```css
.weather-card { display: flex; flex-wrap: wrap; gap: 8px; padding: 8px 12px; background: #f7f5f0; border-radius: 8px; font-size: 12px; margin: 8px 0; }
.weather-card .w-advice { width: 100%; color: var(--ink-mute); font-size: 11px; }
```

- [ ] **Step 4: Verify**

Each day tab shows weather card with temp/rain/UV/advice.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "v2: add weather cards (July rainy season averages)"
```

---

## Task 13: Curate photos for places

**Files:**
- Create: `assets/img/{category}/{place_id}-{n}.webp`
- Modify: `index.html` (update `PLACES[*].images` arrays)

- [ ] **Step 1: Set up image workspace**

```bash
mkdir -p assets/img/stay assets/img/nature assets/img/culture assets/img/cafe assets/img/food assets/img/night assets/img/shopping assets/img/spa assets/img/experience assets/img/_raw
echo "assets/img/_raw/" >> .gitignore
```

- [ ] **Step 2: Source photos**

For each place in PLACES (priority: ITINERARY-referenced first, then candidates):
1. Find 1-3 photos from: official website, Unsplash (`unsplash.com`), Pexels (`pexels.com`)
2. Save raw download to `assets/img/_raw/{place_id}-{n}.{ext}`
3. Skip if unable to find license-clean source — leave `images: []`

- [ ] **Step 3: Convert to WebP and resize**

For each raw image, produce a single committed WebP per spec §7-A.3:
- Detail size: 1200×800
- File size: ≤ 200KB per image (target: total ≤ 500KB per place)
- Tool: `cwebp` if available, else online converter, else Python Pillow:

```python
from PIL import Image
img = Image.open("assets/img/_raw/hyatt-1.jpg")
img.thumbnail((1200, 800))
img.save("assets/img/stay/hyatt-1.webp", "WEBP", quality=80)
```

- [ ] **Step 4: Update PLACES.images**

Edit `index.html` PLACES — set each entry's `images` array to the committed file paths:
```js
"hyatt": { ..., images: ["assets/img/stay/hyatt-1.webp", "assets/img/stay/hyatt-2.webp"] }
```

- [ ] **Step 5: Add placeholder fallback**

Create `assets/img/placeholder.webp` (simple beige 600×400, "이미지 준비중" text) for places without photos.

- [ ] **Step 6: Verify total size**

```bash
du -sh assets/img/
```
Expected: ≤ 20MB. If over, reduce quality or drop secondary images.

- [ ] **Step 7: Verify rendering**

Reload site. Candidate cards show thumbnails. No broken images.

- [ ] **Step 8: Commit**

```bash
git add assets/img/ index.html .gitignore
git commit -m "v2: curate photos for places"
```

---

## Task 14: Rewrite README for KakaoTalk sharing

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Write new README**

Replace entire contents:
```markdown
# 🌴 다낭 가족여행 · 2026.07.24-29

부부(43·41) + 딸 9세 + 아들 6세 · 5박 6일

✈️ ZE593 인천 → 다낭 (7/24 20:35)
✈️ ZE594 다낭 → 인천 (7/29 00:25)
🏨 New Orient(0.5박) → Hyatt(3박) → Happy Day(대기)

---

## 🌐 라이브 사이트 (모바일)

### 👉 [일정·지도 페이지 열기](https://rusher2020.github.io/danang-trip/)

좌측 메뉴(여행 개요·항공·숙소·응급·기본정보·한↔베) · 날짜 탭 · 타임라인 · Leaflet 지도

---

## 🎯 일정 요약

**7/24 (금)** 20:35 출국 → 23:25 다낭 도착 → New Orient
**7/25 (토)** 시내 짧게 + Hyatt 이동·적응
**7/26 (일)** Hyatt 풀데이 (수영장·Camp Hyatt)
**7/27 (월)** 호이안 야경 or 오행산 (날씨 보고)
**7/28 (화)** Hyatt 체크아웃 → 시내 → Happy Day → 공항
**7/29 (수)** 00:25 출국 → 06:55 인천

---

## 📱 아내·가족 공유 링크

```
https://rusher2020.github.io/danang-trip/
```

---

## 🛠️ (개발자용)

단일 파일 사이트: `index.html` 상단의 `PLACES` / `ITINERARY` / `TRAVEL_TIMES` / `WEATHER` 객체 수정

로컬 미리보기:
```bash
python3 -m http.server 4177 --bind 127.0.0.1
```

설계 문서: [`docs/superpowers/specs/2026-05-12-danang-trip-rebuild-design.md`](docs/superpowers/specs/2026-05-12-danang-trip-rebuild-design.md)
구버전 백업: [`archive/v1/`](archive/v1/)
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "v2: rewrite README for KakaoTalk sharing"
```

---

## Task 15: Mobile QA pass and final cleanup

**Files:**
- Possibly modify: `index.html`, CSS adjustments
- Move: `data/` → `archive/v1/data/`

- [ ] **Step 1: Run mobile QA per spec §10 checklist**

Open `http://127.0.0.1:4177/` in Chrome DevTools, set device to iPhone 14 Pro (393×852).

Verify each:
- [ ] Page loads, no JS errors
- [ ] LNB hidden by default on mobile, hamburger opens overlay
- [ ] All 6 day tabs render with colors
- [ ] Map shows pins for each day, no overlap
- [ ] Travel times appear between blocks
- [ ] 시간표 tab: horizontal scroll if needed, readable
- [ ] 후보 tab: ✅/⏭️/❓ marks persist after reload
- [ ] 준비 tab: checkboxes persist
- [ ] Weather card on each day
- [ ] Emergency `tel:` links present
- [ ] KR-VN tap-zoom works
- [ ] Photos load (no 404 in network tab)
- [ ] No horizontal scroll at 393px

Fix any issues inline.

- [ ] **Step 2: Wife persona check (spec §9-A)**

Send link to wife (or simulate): "이번 여행 알려줘봐". She should be able to state 4 things in <1 min:
- 언제: 7/24-29
- 어디서 자고: New Orient → Hyatt → Happy Day
- 뭐 하고: Hyatt 중심·호이안·오행산 후보
- 돌아오는 비행기: ZE594 7/29 00:25

If she can't find any of these in 1 minute, that's a UX bug — fix the LNB or first screen.

- [ ] **Step 3: Archive data/ folder**

```bash
git mv data archive/v1/data
```

(v2 now fully self-contained in `index.html`; `data/` was kept temporarily as reference during T3-T11.)

- [ ] **Step 4: Verify root is clean**

```bash
ls
```
Expected: `archive/`, `assets/`, `docs/`, `index.html`, `README.md`, `.gitignore`, `.nojekyll`. Nothing else.

- [ ] **Step 5: Run validation (if scripts kept)**

If `archive/v1/scripts/validate.js` is kept, it now refers to archived data — skip or update. Not required for v2.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "v2: mobile QA pass and final cleanup"
```

- [ ] **Step 7: Push branch**

```bash
git push -u origin v2-rebuild
```

- [ ] **Step 8: Open PR (or merge to main)**

User decides: merge directly or open PR for review. If PR:
```bash
gh pr create --title "v2: rebuild with reference design + 7/24-29 itinerary" --body "$(cat <<'EOF'
## Summary
- Rebuilt site using first6/family-trip-2605 layout as base
- Replaced reference itinerary with own 7/24-29 plan
- Absorbed existing research (Hyatt programs, airline, emergency, Korean reviews)
- Added +α: weather cards, one-tap emergency, photo curation, KR-VN cards
- Archived v1 site and reorganized docs

## Test plan
- [ ] Mobile 393px no horizontal scroll
- [ ] All 6 day tabs render with map pins
- [ ] LocalStorage marks persist
- [ ] tel:/maps: links work on mobile
- [ ] Wife persona check: 1-min comprehension

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 9: Verify GitHub Pages redeploy**

After merge to main, check Pages settings still point to main root. Visit `https://rusher2020.github.io/danang-trip/` and run mobile QA against the live URL.

---

## Notes for the executor

- **Tests**: This is a static content site, not a code library. The "tests" are the manual QA steps in T15. Don't add a test framework.
- **TDD adaptation**: For content-heavy tasks (T3-T13), the discipline is "render → eyeball → fix" rather than "write failing test → green". The verification steps in each task replace formal tests.
- **Reference re-clone**: If `/tmp/trip-compare/family-trip-2605` is missing at any point, re-clone it.
- **Server**: Keep `python3 -m http.server 4177` running in a background terminal during T3-T15 for live preview.
- **Frequent commits**: Every task ends with a commit. Don't merge tasks.
- **If stuck on coordinates/photos**: It's OK to commit partial data with `null` lat/lng or empty `images` and revisit. Mark TODOs in the commit message (e.g., `v2: add PLACES (lat/lng for X, Y still TODO)`).
