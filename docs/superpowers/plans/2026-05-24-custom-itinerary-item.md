# 커스텀 일정 항목 추가 기능 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development (권장) 또는 superpowers:executing-plans. 단계는 `- [ ]` 체크박스.
> 스펙: `docs/superpowers/specs/2026-05-24-custom-itinerary-item-design.md`

**Goal:** "📝 내 일정"에서 후보카드 없는 커스텀 항목을 화면에서 직접 추가(제목·날짜·시각 + 선택 위치/비용). 위치 있으면 지도 핀+클릭연동.

**Architecture:** 기존 myPlan 빌더 확장. 외부 호출(지오코딩·OSRM)은 **추가/편집 시점 1회**만 → 결과(좌표·경로·시간)를 myPlan 항목 + localStorage 경로캐시에 **영속** → 현지 뷰는 오프라인 재생(프리셋 ROUTES_CACHE 모델).

**Tech Stack:** 단일 파일 HTML/JS(vanilla), Leaflet(기존), Nominatim(지오코딩), OSRM(경로), localStorage/URL해시(영속), playwright headless(검증).

**핵심 기존 심볼**(index.html): `myPlan`, `myPlanToItinerary()`, `addCardToMyPlan`, `removeMyPlanItem`/`setMyPlanItemTime`/`moveMyPlanItem`, `resetMyPlan`, `_encodeMyPlanToHash`/`_decodeMyPlanFromHash`, `buildPickerMarkup`/`bindPicker`, `openQuickAddSheet`, `mpEditing`/`mpControlsHtml`, `cardById`, `TRIP_DAYS`, `applyDayColors`, `renderAll`, `renderPlanTabs`. ROUTES_CACHE 조회(≈3198행), TRAVEL_TIMES 조회 헬퍼(≈2863행).

**검증:** 단위테스트 프레임워크 없음 → 각 Task는 헤드리스 playwright(데스크톱+모바일)로 동작·JS에러0 확인. 로컬서버 `python3 -m http.server <port> --bind 127.0.0.1`, 스니펫은 RESUMING.md 참조.

---

### Task 1: 브랜치 + 데이터 모델 (커스텀 항목)

**Files:** Modify `index.html` (myPlan 모듈)

- [ ] **Step 1:** 브랜치
```bash
git checkout main && git checkout -b feat/custom-itinerary-item
cp index.html /tmp/index.before_custom.html
```
- [ ] **Step 2:** 커스텀 항목 생성 함수 추가 (myPlan 모듈, `addCardToMyPlan` 근처)
```js
// 커스텀 항목: 카드 id 대신 인라인 데이터 저장
function addCustomToMyPlan({day, time, title, coords=null, icon='📍', cat=null, mode='', cost='', memo=''}) {
  if (!title || !day) return false;
  myPlan.items.push({ custom:true, id:'c'+Date.now().toString(36),
    day, time: time||'미정', title, coords, icon, cat, mode, cost, memo });
  myPlan.items.sort(mpSortByDayTime); // 기존 정렬 비교자 재사용(없으면 day,time 비교 구현)
  persistMyPlan();                    // 기존 영속 함수(해시+localStorage)
  return true;
}
```
- [ ] **Step 3:** `myPlanToItinerary()`가 커스텀 항목을 변환하도록 분기 추가
```js
// 변환 루프 안: 카드 기반 vs 커스텀 분기
if (it.custom) {
  return { time: it.time, icon: it.icon||'📍', title: it.title, tag: it.cat? catTag(it.cat):'activity',
    place: it.coords ? ('custom:'+it.id) : null, coords: it.coords||null,
    desc: it.memo||'', _custom:true };
}
```
- [ ] **Step 4:** 지도 렌더가 `coords`를 가진 항목(place 없이도) 핀 표시 + 클릭 포커스 하도록, 좌표 해석부 점검(현재 place→PLACES[place].coords 의존이면, item.coords 우선 사용하도록 가드).
```bash
grep -n "PLACES\[" index.html | head
```
- [ ] **Step 5(검증):** 콘솔에서 `addCustomToMyPlan` 호출 후 `myPlanToItinerary()` 결과에 커스텀 항목이 좌표와 함께 들어오는지 헤드리스 evaluate로 확인. JS에러 0.
- [ ] **Step 6:** 커밋 `git commit -am "feat(myplan): 커스텀 항목 데이터모델 + 변환"`

---

### Task 2: 경로/시간 영속 캐시 (계획시 계산, 현지 오프라인 재생)

**Files:** Modify `index.html`

- [ ] **Step 1:** localStorage 경로 캐시 헬퍼 추가 (좌표쌍 키, 기존 ROUTES_CACHE 미러)
```js
const CUSTOM_ROUTES_KEY='danang-custom-routes';
function _rk(a,b){ const k=[a.join(','),b.join(',')].sort().join('|'); return k; }
function loadCustomRoutes(){ try{return JSON.parse(localStorage.getItem(CUSTOM_ROUTES_KEY))||{}}catch{ return {} } }
function saveCustomRoutes(o){ localStorage.setItem(CUSTOM_ROUTES_KEY, JSON.stringify(o)); }
function getCustomRoute(a,b){ return loadCustomRoutes()[_rk(a,b)]||null; } // {poly:[[lat,lon]..], min:Number}
```
- [ ] **Step 2:** 추가/편집 시 OSRM 1회 호출 → 캐시 저장 (온라인일 때만; 실패시 무시)
```js
async function ensureCustomRoute(a,b){
  const cache=loadCustomRoutes(), k=_rk(a,b);
  if(cache[k]) return cache[k];
  try{
    const r=await fetch(`https://router.project-osrm.org/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`);
    const j=await r.json(); const rt=j.routes[0];
    cache[k]={poly:rt.geometry.coordinates.map(c=>[+c[1].toFixed(5),+c[0].toFixed(5)]), min:Math.round(rt.duration/60)};
    saveCustomRoutes(cache); return cache[k];
  }catch{ return null; }
}
```
- [ ] **Step 3:** 지도 경로 렌더(≈3198행 ROUTES_CACHE 조회부)에 폴백 체인 추가: `ROUTES_CACHE[k] || getCustomRoute(a,b)?.poly || 직선([a,b])`. 이동시간 헬퍼(≈2863행)도 `... || getCustomRoute()?.min` → "🚐 X분", 없으면 직선거리 추정.
- [ ] **Step 4(검증):** 온라인에서 두 좌표로 `ensureCustomRoute` 호출→localStorage에 poly/min 저장 확인. 이후 `getCustomRoute` 동기 반환 확인(현지 오프라인 재생 시뮬). JS에러0.
- [ ] **Step 5:** 커밋 `git commit -am "feat(myplan): 커스텀 경로/시간 영속 캐시(오프라인 재생)"`

---

### Task 3: 위치 입력 — 지오코딩 검색 + 미니지도 미세조정

**Files:** Modify `index.html`

- [ ] **Step 1:** Nominatim 검색 헬퍼
```js
async function geocode(q){
  const u=`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q+' Da Nang')}&format=json&limit=5`;
  const r=await fetch(u,{headers:{'Accept-Language':'ko'}}); const j=await r.json();
  return j.map(x=>({name:x.display_name, coords:[+x.lat,+x.lon]}));
}
```
(User-Agent/rate-limit: 호출 throttle, 검색 버튼 눌렀을 때만)
- [ ] **Step 2:** 위치 위젯 마크업: 검색 input+버튼 → 결과 리스트 클릭 → 미니 Leaflet 지도에 마커, 드래그/탭으로 미세조정 → 확정 좌표 폼에 보관. (기존 Leaflet 재사용; 미니맵은 별 div+L.map)
- [ ] **Step 3(검증):** 헤드리스에서 geocode mock 또는 실호출로 결과→마커→좌표확정 흐름, JS에러0. 오프라인 시 검색 실패해도 지도 탭으로 좌표 지정 가능.
- [ ] **Step 4:** 커밋 `git commit -am "feat(myplan): 커스텀 위치 검색+미니지도"`

---

### Task 4: UI — ＋직접 추가 시트 + 폼

**Files:** Modify `index.html` (내 일정 뷰 렌더 `renderPlanTabs`/타임라인 헤더, CSS)

- [ ] **Step 1:** 내 일정 활성 시 `＋ 직접 추가` 버튼 노출(기존 "후보 ＋담기" 옆/상단).
- [ ] **Step 2:** 버튼 → `openCustomAddSheet()` (기존 `openQuickAddSheet` 패턴: 백드롭·✕·Esc·`aria-labelledby`). 폼: 제목(input)·날짜(TRIP_DAYS 칩)·시각(기존 시각 피커: 미정/08:00~21:00)·위치위젯(Task3)·아이콘(카테고리 아이콘 셋)·이동수단/비용(input)·메모(textarea). 담기 버튼→`addCustomToMyPlan(...)` + 위치 있으면 `await ensureCustomRoute(인접좌표)` + `activePlan='my'` + `renderPlanTabs()`.
- [ ] **Step 3:** CSS: 시트/폼 스타일(기존 `.cand-add`/바텀시트 토큰 재사용).
- [ ] **Step 4(검증):** 헤드리스 데스크톱+모바일 — 버튼 클릭→시트 열림→입력→담기→타임라인/시간표/지도 즉시 반영, native 팝업0, JS에러0.
- [ ] **Step 5:** 커밋 `git commit -am "feat(myplan): ＋직접 추가 시트+폼"`

---

### Task 5: 편집·삭제 + "내가 추가" 뱃지

**Files:** Modify `index.html` (`mpControlsHtml`/타임라인 항목 렌더)

- [ ] **Step 1:** 커스텀 항목에도 기존 인라인 칩 에디터(⏰시간/📅날짜/🗑️삭제) 적용 + 커스텀 전용: 제목·위치·비용 편집. 위치 변경 시 `ensureCustomRoute` 재호출.
- [ ] **Step 2:** 커스텀/카드추가 모두 "내가 추가" 뱃지 표시(기존 뱃지 로직 확장).
- [ ] **Step 3(검증):** 헤드리스 — 커스텀 시간변경/날짜이동/삭제/제목편집 동작, 재렌더 관용구(`ITINERARY=myPlanToItinerary();applyDayColors(ITINERARY);renderAll();`) 일관, JS에러0.
- [ ] **Step 4:** 커밋 `git commit -am "feat(myplan): 커스텀 항목 편집·삭제·뱃지"`

---

### Task 6: 영속(해시+localStorage) — 커스텀 필드 직렬화

**Files:** Modify `index.html` (`_encodeMyPlanToHash`/`_decodeMyPlanFromHash`, persist 로직)

- [ ] **Step 1:** 해시 인코딩에 커스텀 필드(custom/title/coords/icon/cat/mode/cost/memo) 포함. 단 **경로 폴리라인은 해시에 넣지 않음**(localStorage `danang-custom-routes`만). 디코딩 대칭.
- [ ] **Step 2:** 새로고침/공유링크 복원 시 커스텀 항목 정상 복원. 수신자 오프라인이면 경로 캐시 미스→직선 폴백, 온라인이면 `ensureCustomRoute` 재생성.
- [ ] **Step 3(검증):** 헤드리스 — 커스텀 추가→`mp=`해시 생성→새 탭에서 해시로 열기→항목 복원, 좌표 핀 표시, 해시 라운드트립 보존, JS에러0.
- [ ] **Step 4:** 커밋 `git commit -am "feat(myplan): 커스텀 항목 해시/로컬 영속"`

---

### Task 7: 최종 검증(계획→현지 시뮬) + 머지

- [ ] **Step 1:** 헤드리스 종합: 추가/정렬/편집/삭제/새로고침/공유링크 복원/프리셋 불변, native팝업0, JS에러0.
- [ ] **Step 2:** **오프라인 시뮬**: 온라인에서 커스텀(위치 포함) 추가→경로캐시 저장 확인→`page.context().setOffline(true)`로 차단→새로고침→저장 좌표·도로경로·시간 정상 렌더, 캐시미스쌍은 직선 폴백.
- [ ] **Step 3:** 프리셋 `ITINERARIES`·하드코딩 `TRAVEL_*`/`ROUTES_CACHE` 불변 재확인.
- [ ] **Step 4:** main 머지+푸시 (로컬 확인·사용자 승인 후).

---

## Self-Review (작성자 점검)
- 스펙 커버: 진입UI(T4)·폼/위치검색(T3,T4)·데이터모델(T1)·이동정보 영속캐시·오프라인재생(T2)·편집삭제뱃지(T5)·해시영속(T6)·검증(T7) — 전부 매핑.
- 플레이스홀더: 코드 스케치는 시그니처·핵심 로직 제시. 실행 세션이 정확한 삽입 행/기존 정렬비교자(`mpSortByDayTime`) 유무를 확인해 채움(각 Task에 grep 단계 포함).
- 일관성: `getCustomRoute`/`ensureCustomRoute`/`_rk`/`CUSTOM_ROUTES_KEY` 명칭 T2↔T6 일관. 재렌더 관용구 통일.
