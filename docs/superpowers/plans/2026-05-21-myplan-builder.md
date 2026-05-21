# 내 일정 빌더 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 후보 카드를 날짜+시각으로 담아 사용자만의 일정을 조립하는 "📝 내 일정" 기능을 추가한다.

**Architecture:** 프리셋 플랜(A~E)을 깊은 복사해 `myPlan` 객체를 만들고, 이를 기존 `ITINERARY` 배열 형태로 변환(`myPlanToItinerary`)하여 기존 `renderTimeline`/`renderMap`을 재사용한다. 6번째 플랜 탭으로 노출. 저장·공유는 localStorage + URL 해시(준비물 탭 패턴).

**Tech Stack:** 단일 `index.html`, 바닐라 JS, Leaflet, marked.js. **테스트 프레임워크 없음** → 검증은 헤드리스 playwright 렌더 + 콘솔/페이지 에러 0 확인.

**대상 스펙:** `docs/superpowers/specs/2026-05-21-myplan-builder-design.md` (먼저 읽을 것)

---

## 사전 정보 (현 index.html 기준, 라인 근사치 — 실제는 grep으로 재확인)

- `PLANS` 객체 ~1569, `ITINERARIES` ~1620, `let activePlan='A'` ~1548, `let ITINERARY=ITINERARIES[activePlan]` ~1910
- `CANDIDATE_DATA` ~2548 (단일 미니파이 라인, **직접 수정 금지**), 그 뒤 push 블록에 cat "10" 추가됨
- `renderTimeline()` ~2911, `renderMap()` ~3013
- `renderPlanTabs()` ~3245, `Object.entries(PLANS).map` ~3249, 플랜탭 클릭 핸들러 ~3259~3261 (`activePlan = el.dataset.plan; ITINERARY = ITINERARIES[activePlan]; renderTimeline(); renderMap();` 형태 — 실제 호출 확인할 것)
- `showCardDetail(card)` ~3282, `detail-actions` 영역 ~3304, `detailMapBtn` 핸들러 그 직후
- 준비물 저장 패턴 `_encodePrep`/`_decodePrep` ~2515 (URL 해시 백업 참고)

## 검증 하니스 (모든 태스크 공통)

로컬 서버: `python3 -m http.server 4178 --bind 127.0.0.1` (백그라운드)

헤드리스 스크립트 템플릿 (`/tmp/qa.mjs`):
```js
import pkg from '/Users/ijinhwan/.npm/_npx/31e32ef8478fbf80/node_modules/playwright/index.js';
const { chromium } = pkg;
const exe = '/Users/ijinhwan/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const browser = await chromium.launch({ executablePath: exe });
const errors = [];
const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
p.on('console', e => { if (e.type()==='error') errors.push(e.text()); });
p.on('pageerror', e => errors.push('PAGEERR:'+e.message));
await p.goto('http://127.0.0.1:4178/', { waitUntil: 'networkidle', timeout: 30000 });
await p.waitForTimeout(1200);
// === per-task assertions via p.evaluate(...) ===
console.log('JS errors:', errors.length ? JSON.stringify(errors) : 'none');
await browser.close();
```
경로/캐시 chromium 버전이 다르면 `ls ~/Library/Caches/ms-playwright/` 로 확인 후 교체.

**에러 0 (`JS errors: none`)은 모든 태스크의 통과 조건.** Leaflet/marked CDN 로딩 위해 네트워크 필요.

---

## File Structure

- **수정 파일은 `index.html` 단 하나.** 모든 신규 코드는 기존 `<script>` 블록(끝 ~3565) 안, 관련 기존 함수 근처에 추가.
- 신규 로직 묶음(권장 배치): `renderPlanTabs` 정의(~3245) **직전**에 "내 일정" 모듈(상태·헬퍼·변환·CRUD) 일괄 삽입 → 이후 태스크에서 기존 함수에 훅 추가.

---

## Task 1: 내 일정 데이터 레이어 (상태·헬퍼·생성)

**Files:**
- Modify: `index.html` (`renderPlanTabs` 정의 직전 ~3244에 모듈 삽입)

- [ ] **Step 1: 모듈 블록 삽입**

`function renderPlanTabs() {` 바로 위에 삽입:
```js
// ===== 내 일정 (My Plan) =====
const MYPLAN_KEY = 'danang-myplan';
let myPlan = null; // { basedOn, createdAt, days: { '7/24':[item,...] } }
const cardById = Object.fromEntries(CANDIDATE_DATA.cards.map(c => [c.id, c]));
const TRIP_DAYS = ['7/24','7/25','7/26','7/27','7/28','7/29'];

function _uid() { return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function _timeMin(t) { const m = String(t||'').match(/(\d{1,2}):(\d{2})/); return m ? (+m[1])*60 + (+m[2]) : 9999; }
function _sortDay(items) { items.sort((a,b) => _timeMin(a.time) - _timeMin(b.time)); }

function loadMyPlan() {
  try { const raw = localStorage.getItem(MYPLAN_KEY); if (raw) myPlan = JSON.parse(raw); } catch (e) {}
}
function saveMyPlan() {
  try { localStorage.setItem(MYPLAN_KEY, JSON.stringify(myPlan)); } catch (e) {}
  _encodeMyPlanToHash();
}
function createMyPlanFrom(presetKey) {
  const src = ITINERARIES[presetKey] || [];
  const days = {};
  src.forEach(d => {
    days[d.day] = (d.items || []).map(it => ({
      uid: _uid(), source: 'preset', time: it.time || '', icon: it.icon || '📍',
      title: it.title || '', tag: it.tag || '', desc: it.desc || '', place: it.place
    }));
  });
  myPlan = { basedOn: presetKey, createdAt: new Date().toISOString().slice(0,10), days };
  saveMyPlan();
}
function resetMyPlan() { myPlan = null; try { localStorage.removeItem(MYPLAN_KEY); } catch (e) {} _encodeMyPlanToHash(); }

// _encodeMyPlanToHash / _decodeMyPlanFromHash 는 Task 6에서 구현. 임시 no-op로 시작:
function _encodeMyPlanToHash() {}
function _decodeMyPlanFromHash() {}
```

- [ ] **Step 2: 검증 — 헬퍼 로드 및 생성 동작**

`/tmp/qa.mjs` assertion:
```js
const r = await p.evaluate(() => {
  createMyPlanFrom('A');
  return { basedOn: myPlan.basedOn, dayKeys: Object.keys(myPlan.days), firstDayItems: (myPlan.days['7/24']||[]).length, cardByIdSize: Object.keys(cardById).length };
});
console.log(JSON.stringify(r));
```
Run: `node /tmp/qa.mjs`
Expected: `basedOn:"A"`, dayKeys에 `7/24`~`7/29` 포함, `firstDayItems > 0`, `cardByIdSize >= 111`, `JS errors: none`

- [ ] **Step 3: Commit**
```bash
git add index.html && git commit -m "feat(myplan): 내 일정 데이터 레이어(상태·생성·헬퍼)"
```

---

## Task 2: myPlan → ITINERARY 변환

**Files:**
- Modify: `index.html` (Task 1 모듈 블록 내, `resetMyPlan` 다음)

- [ ] **Step 1: 변환 함수 추가**
```js
function myPlanToItinerary() {
  if (!myPlan) return [];
  const presetDays = ITINERARIES[myPlan.basedOn] || [];
  const order = presetDays.map(d => d.day);
  const dayKeys = [...new Set([...order, ...Object.keys(myPlan.days)])].filter(d => myPlan.days[d]);
  return dayKeys.map(dayKey => {
    const pd = presetDays.find(d => d.day === dayKey) || {};
    const items = (myPlan.days[dayKey] || []).map(it => {
      if (it.source === 'card') {
        const c = cardById[it.cardId] || {};
        return { time: it.time || '', icon: '📌', title: c.name || it.cardId, tag: 'card',
                 desc: it.note || c.summary || '', coords: c.coords, _uid: it.uid, _source: 'card', _cardId: it.cardId };
      }
      return { time: it.time || '', icon: it.icon, title: it.title, tag: it.tag, desc: it.desc,
               place: it.place, _uid: it.uid, _source: 'preset' };
    });
    return { day: dayKey, weekday: pd.weekday || '', title: pd.title || '내 일정', summary: pd.summary || '', items };
  });
}
```

- [ ] **Step 2: 검증 — 변환 결과 형태**
```js
const r = await p.evaluate(() => {
  createMyPlanFrom('A');
  const it = myPlanToItinerary();
  return { days: it.length, day0: it[0]?.day, day0items: it[0]?.items?.length, hasItemFields: !!(it[0]?.items?.[0]?.title) };
});
console.log(JSON.stringify(r));
```
Expected: `days >= 1`, `day0:"7/24"`, `day0items > 0`, `hasItemFields:true`, `JS errors: none`

- [ ] **Step 3: Commit**
```bash
git add index.html && git commit -m "feat(myplan): myPlan→ITINERARY 변환(myPlanToItinerary)"
```

---

## Task 3: 플랜 탭에 "📝 내 일정" 노출 + 전환

**Files:**
- Modify: `index.html` (`renderPlanTabs` ~3245, 플랜탭 클릭 핸들러 ~3259)

- [ ] **Step 1: 먼저 기존 renderPlanTabs / 클릭 핸들러 정확히 읽기**
Run: `sed -n '3245,3275p' index.html`
기존 구조 확인: `Object.entries(PLANS).map(...)` 로 `.plan-tab[data-plan=X]` 생성, 클릭 시 `activePlan = el.dataset.plan; ITINERARY = ITINERARIES[activePlan]` 후 `renderTimeline(); renderMap();` (정확한 호출 확인).

- [ ] **Step 2: renderPlanTabs에 내 일정 탭 추가**
`Object.entries(PLANS).map(...)`로 만든 HTML 문자열 끝에 내 일정 탭을 덧붙인다. 예(기존 map 결과를 `let html = ...map().join('')` 형태로 받은 뒤):
```js
const myTabLabel = myPlan ? '📝 내 일정' : '➕ 내 일정';
html += `<button class="plan-tab ${activePlan==='my'?'active':''}" data-plan="my" style="--plan-color:#2d2a55;">
  <span class="picon">📝</span><span class="pname">${myPlan ? '내 일정' : '만들기'}</span></button>`;
tabsEl.innerHTML = html;
```
(기존이 직접 `tabsEl.innerHTML = Object.entries(PLANS).map().join('')` 라면, 그 뒤에 `tabsEl.insertAdjacentHTML('beforeend', `...`)`로 추가.)

- [ ] **Step 3: 클릭 핸들러에 'my' 분기 추가**
기존 핸들러(`activePlan = el.dataset.plan; ...`)를 다음으로 보강:
```js
el.addEventListener('click', () => {
  const plan = el.dataset.plan;
  if (plan === 'my') {
    if (!myPlan) {
      const k = prompt('어느 프리셋을 복사해 시작할까요? (A~E)', 'A');
      if (!k || !ITINERARIES[k.toUpperCase()]) return;
      createMyPlanFrom(k.toUpperCase());
    }
    activePlan = 'my';
    ITINERARY = myPlanToItinerary();
  } else {
    activePlan = plan;
    ITINERARY = ITINERARIES[activePlan];
  }
  renderPlanTabs();
  renderTimeline();
  renderMap();
  // 기존 핸들러가 plan-features(요약) 갱신 코드를 포함하면 'my'일 때 가드 처리
});
```
**주의:** 기존 핸들러가 `PLANS[activePlan]` 으로 plan-features를 렌더한다면, `activePlan==='my'`일 때 `PLANS['my']`가 없어 에러. 가드 추가: `const meta = PLANS[activePlan] || { summary:'내가 조립한 일정', features:[] };` 사용.

- [ ] **Step 4: 검증 — 탭 노출 및 전환**
```js
const r = await p.evaluate(() => {
  const before = !!document.querySelector('.plan-tab[data-plan="my"]');
  return { myTabExists: before };
});
// 클릭 시 prompt가 뜨므로 헤드리스에서는 prompt를 우회: 미리 생성 후 렌더
const r2 = await p.evaluate(() => {
  createMyPlanFrom('A'); renderPlanTabs();
  const tab = document.querySelector('.plan-tab[data-plan="my"]');
  tab.click();
  return { active: document.querySelector('.plan-tab[data-plan="my"]').classList.contains('active'),
           timelineHasContent: document.getElementById('timelineWrap').innerText.length > 0 };
});
console.log(JSON.stringify(r), JSON.stringify(r2));
```
Expected: `myTabExists:true`, `active:true`, `timelineHasContent:true`, `JS errors: none`
**참고:** 실제 prompt 흐름은 수동(브라우저)에서 별도 확인. 헤드리스는 prompt를 띄우지 않도록 사전 생성으로 우회.

- [ ] **Step 5: Commit**
```bash
git add index.html && git commit -m "feat(myplan): 플랜 탭에 내 일정 추가 + 전환/생성"
```

---

## Task 4: 카드 → 내 일정 담기 (버튼 + 피커 + 추가)

**Files:**
- Modify: `index.html` (모듈 블록에 `addCardToMyPlan`/`openAddToPlanPicker`, `showCardDetail` ~3304에 버튼)

- [ ] **Step 1: 추가 함수**
```js
function addCardToMyPlan(cardId, day, time) {
  if (!myPlan) { const k = prompt('내 일정이 없습니다. 어느 프리셋을 복사할까요? (A~E)', 'A'); if (!k || !ITINERARIES[k.toUpperCase()]) return false; createMyPlanFrom(k.toUpperCase()); }
  if (!myPlan.days[day]) myPlan.days[day] = [];
  myPlan.days[day].push({ uid: _uid(), source: 'card', time: time || '', cardId });
  _sortDay(myPlan.days[day]);
  saveMyPlan();
  if (activePlan === 'my') { ITINERARY = myPlanToItinerary(); renderTimeline(); renderMap(); }
  return true;
}
```

- [ ] **Step 2: 피커 UI** (경량 — prompt 2개로 시작, 추후 개선 가능)
```js
function openAddToPlanPicker(card) {
  const day = prompt('어느 날짜에 담을까요?\n' + TRIP_DAYS.join(' / '), '7/26');
  if (!day || !TRIP_DAYS.includes(day)) { if (day) alert('날짜 형식: ' + TRIP_DAYS.join(' / ')); return; }
  const time = prompt('시각 (예: 14:00) — 비워도 됩니다', '');
  if (time === null) return;
  if (addCardToMyPlan(card.id, day, time)) alert(`'${card.name}' → ${day} ${time||'(시간미정)'} 담음`);
}
```
> NOTE(추후 개선): prompt 대신 인라인 시트(날짜 칩 + time input)로 교체 가능. 이번 범위는 동작 우선.

- [ ] **Step 3: showCardDetail에 버튼 추가**
`detail-actions` 블록(`detailMapBtn` 버튼 옆)에 추가:
```js
<button class="detail-action-btn" id="detailAddPlanBtn">📅 내 일정에 담기</button>
```
그리고 `detailContent.innerHTML = ...` 직후 핸들러 바인딩부(예: `document.getElementById('detailMapBtn').onclick=...` 근처)에:
```js
const addBtn = document.getElementById('detailAddPlanBtn');
if (addBtn) addBtn.onclick = () => openAddToPlanPicker(card);
```

- [ ] **Step 4: 검증 — 담기 동작 (prompt 우회, 함수 직접 호출)**
```js
const r = await p.evaluate(() => {
  createMyPlanFrom('A');
  const before = (myPlan.days['7/26']||[]).length;
  addCardToMyPlan('3.1', '7/26', '14:00');
  addCardToMyPlan('3.2', '7/26', '09:00');
  const day = myPlan.days['7/26'];
  return { added: day.length - before, sortedFirstTime: day.find(i=>i.source==='card')?.time, order: day.filter(i=>i.source==='card').map(i=>i.time) };
});
console.log(JSON.stringify(r));
```
Expected: `added:2`, 카드 항목이 시간순(`09:00` 먼저)으로 정렬, `JS errors: none`
(버튼 존재는 수동/추가 evaluate로 확인: 후보카드 클릭 → `#detailAddPlanBtn` 존재.)

- [ ] **Step 5: Commit**
```bash
git add index.html && git commit -m "feat(myplan): 카드를 내 일정에 담기(버튼+피커+정렬)"
```

---

## Task 5: 내 일정 타임라인 편집 컨트롤 (삭제·시간변경·날짜이동)

**Files:**
- Modify: `index.html` (모듈에 CRUD 함수, `renderTimeline` ~2911에 조건부 컨트롤)

- [ ] **Step 1: CRUD 함수**
```js
function removeMyPlanItem(uid) {
  if (!myPlan) return;
  for (const d of Object.keys(myPlan.days)) myPlan.days[d] = myPlan.days[d].filter(i => i.uid !== uid);
  saveMyPlan(); if (activePlan==='my'){ ITINERARY=myPlanToItinerary(); renderTimeline(); renderMap(); }
}
function setMyPlanItemTime(uid, time) {
  if (!myPlan) return;
  for (const d of Object.keys(myPlan.days)) { const it = myPlan.days[d].find(i=>i.uid===uid); if (it){ it.time = time||''; _sortDay(myPlan.days[d]); break; } }
  saveMyPlan(); if (activePlan==='my'){ ITINERARY=myPlanToItinerary(); renderTimeline(); renderMap(); }
}
function moveMyPlanItem(uid, newDay) {
  if (!myPlan || !TRIP_DAYS.includes(newDay)) return;
  let moved;
  for (const d of Object.keys(myPlan.days)) { const idx = myPlan.days[d].findIndex(i=>i.uid===uid); if (idx>=0){ moved = myPlan.days[d].splice(idx,1)[0]; break; } }
  if (!moved) return;
  if (!myPlan.days[newDay]) myPlan.days[newDay] = [];
  myPlan.days[newDay].push(moved); _sortDay(myPlan.days[newDay]);
  saveMyPlan(); if (activePlan==='my'){ ITINERARY=myPlanToItinerary(); renderTimeline(); renderMap(); }
}
```

- [ ] **Step 2: renderTimeline에 편집 컨트롤(내 일정 모드만)**
먼저 `sed -n '2911,3012p' index.html`로 항목 렌더 구조 파악. 각 item 렌더 시 `activePlan==='my' && item._uid` 이면 컨트롤 HTML 추가:
```js
${(activePlan==='my' && item._uid) ? `<div class="myplan-controls" data-uid="${item._uid}">
  <button class="mp-time">⏰</button><button class="mp-move">📅</button><button class="mp-del">🗑️</button>
  ${item._source==='card' ? '<span class="mp-badge">내가 추가</span>' : ''}
</div>` : ''}
```
렌더 직후(타임라인 wrap 갱신 후) 이벤트 위임 바인딩:
```js
document.getElementById('timelineWrap').querySelectorAll('.myplan-controls').forEach(ctrl => {
  const uid = ctrl.dataset.uid;
  ctrl.querySelector('.mp-del').onclick = () => { if (confirm('이 항목을 삭제할까요?')) removeMyPlanItem(uid); };
  ctrl.querySelector('.mp-time').onclick = () => { const t = prompt('시각 (예: 14:00)', ''); if (t!==null) setMyPlanItemTime(uid, t); };
  ctrl.querySelector('.mp-move').onclick = () => { const d = prompt('옮길 날짜\n'+TRIP_DAYS.join(' / '), '7/26'); if (d) moveMyPlanItem(uid, d); };
});
```
최소 CSS(스타일 블록 아무 곳):
```css
.myplan-controls { display:flex; gap:6px; margin-top:4px; align-items:center; }
.myplan-controls button { font-size:12px; padding:2px 6px; border:1px solid var(--line,#ddd); border-radius:6px; background:#fff; cursor:pointer; }
.mp-badge { font-size:11px; color:#2d2a55; background:#2d2a5515; padding:1px 6px; border-radius:6px; }
```

- [ ] **Step 3: 검증 — CRUD 동작**
```js
const r = await p.evaluate(() => {
  createMyPlanFrom('A'); addCardToMyPlan('3.1','7/26','14:00');
  const uid = myPlan.days['7/26'].find(i=>i.source==='card').uid;
  setMyPlanItemTime(uid, '08:00');
  const t = myPlan.days['7/26'].find(i=>i.uid===uid).time;
  moveMyPlanItem(uid, '7/27');
  const movedOk = !myPlan.days['7/26'].some(i=>i.uid===uid) && myPlan.days['7/27'].some(i=>i.uid===uid);
  removeMyPlanItem(uid);
  const gone = !Object.values(myPlan.days).flat().some(i=>i.uid===uid);
  return { time:t, movedOk, gone };
});
console.log(JSON.stringify(r));
```
Expected: `time:"08:00"`, `movedOk:true`, `gone:true`, `JS errors: none`

- [ ] **Step 4: Commit**
```bash
git add index.html && git commit -m "feat(myplan): 타임라인 편집 컨트롤(삭제·시간·날짜이동)"
```

---

## Task 6: 영속성 — URL 해시 인코딩/복원 + 로드 시 적용

**Files:**
- Modify: `index.html` (Task 1의 no-op `_encodeMyPlanToHash`/`_decodeMyPlanFromHash` 교체, 로드 초기화부)

- [ ] **Step 1: 먼저 준비물 해시 패턴 확인**
Run: `sed -n '2515,2545p' index.html` — `_encodePrep`/`_decodePrep`의 해시 키·인코딩 방식(예: `location.hash` 파라미터, base64) 확인 후 동일 컨벤션 따름.

- [ ] **Step 2: 인코딩/디코딩 구현(no-op 교체)**
```js
function _encodeMyPlanToHash() {
  try {
    const params = new URLSearchParams(location.hash.slice(1));
    if (myPlan) params.set('mp', btoa(unescape(encodeURIComponent(JSON.stringify(myPlan)))));
    else params.delete('mp');
    const s = params.toString();
    history.replaceState(null, '', s ? ('#'+s) : location.pathname);
  } catch (e) {}
}
function _decodeMyPlanFromHash() {
  try {
    const params = new URLSearchParams(location.hash.slice(1));
    const mp = params.get('mp');
    if (mp) { const obj = JSON.parse(decodeURIComponent(escape(atob(mp)))); if (obj && obj.days) myPlan = obj; }
  } catch (e) {}
}
```
> 준비물 패턴이 다른 인코딩(예: 별도 키, LZ)을 쓰면 거기에 맞춰 조정. 충돌 없게 파라미터 키 `mp` 사용.

- [ ] **Step 3: 로드 시 초기화 (localStorage → 없으면 해시)**
스크립트 하단 초기화부(준비물 `_decodePrep(); renderPrep();` ~3546 근처)에 추가:
```js
loadMyPlan();
_decodeMyPlanFromHash(); // 해시가 있으면 localStorage보다 우선(공유 링크)
if (myPlan) saveMyPlan(); // 해시→localStorage 동기화
renderPlanTabs();
```

- [ ] **Step 4: 검증 — 저장/복원**
```js
const r = await p.evaluate(() => {
  createMyPlanFrom('A'); addCardToMyPlan('3.1','7/26','14:00');
  const ls = !!localStorage.getItem('danang-myplan');
  const hashHasMp = location.hash.includes('mp=');
  // 복원 시뮬: myPlan 비우고 해시에서 복원
  myPlan = null; _decodeMyPlanFromHash();
  const restored = !!(myPlan && myPlan.days['7/26']?.some(i=>i.cardId==='3.1'));
  return { ls, hashHasMp, restored };
});
console.log(JSON.stringify(r));
```
Expected: `ls:true`, `hashHasMp:true`, `restored:true`, `JS errors: none`
추가: 새 페이지 로드(`p.reload()`) 후 `localStorage` 기반 myPlan 유지 확인.

- [ ] **Step 5: Commit**
```bash
git add index.html && git commit -m "feat(myplan): localStorage+URL해시 저장·복원"
```

---

## Task 7: 엣지 케이스 가드 + 초기화 + 최종 통합 QA

**Files:**
- Modify: `index.html` (renderMap 가드, 초기화 버튼)

- [ ] **Step 1: renderMap의 coords-only 항목 가드 확인/보강**
Run: `sed -n '3013,3125p' index.html` — 타임라인 item에서 좌표를 얻는 로직 확인. 기존이 `item.place`(→PLACES 좌표)만 쓰면, 카드 항목(`item.coords` 직접 보유, place 없음)은 핀이 안 생김. 좌표 해석부에 가드 추가:
```js
// 좌표 결정: place 우선, 없으면 item.coords(카드)
const coords = item.place ? (PLACES[item.place]?.coords) : item.coords;
if (!coords) return; // 좌표 없으면 핀 건너뜀(크래시 금지)
```
정확한 변수명은 기존 코드에 맞출 것. **목표: 좌표 없는 항목에서 절대 throw 하지 않음.**

- [ ] **Step 2: 내 일정 초기화 버튼**
내 일정 활성 시 타임라인 상단 또는 plan-features 영역에 버튼 추가(렌더 분기):
```js
${activePlan==='my' ? `<button id="myPlanResetBtn" class="mp-reset">내 일정 비우기</button>` : ''}
```
바인딩:
```js
const rb = document.getElementById('myPlanResetBtn');
if (rb) rb.onclick = () => { if (confirm('내 일정을 비울까요? (되돌릴 수 없음)')) { resetMyPlan(); activePlan='A'; ITINERARY=ITINERARIES['A']; renderPlanTabs(); renderTimeline(); renderMap(); } };
```

- [ ] **Step 3: 통합 시나리오 검증 (헤드리스, 데스크톱+모바일 각각)**
```js
const r = await p.evaluate(() => {
  // 좌표 없는 카드 담아도 안전한지: coords 없는 카드 id 하나 찾기
  const noCoord = CANDIDATE_DATA.cards.find(c => !c.coords);
  createMyPlanFrom('B');
  addCardToMyPlan('3.1','7/26','14:00');
  if (noCoord) addCardToMyPlan(noCoord.id, '7/26', '15:00');
  // 내 일정 활성 + 렌더
  const tab = document.querySelector('.plan-tab[data-plan="my"]'); tab && tab.click();
  return { mapPins: Object.keys(placeMarkers).length, timelineLen: document.getElementById('timelineWrap').innerText.length, presetsIntact: ITINERARIES.A.length };
});
console.log(JSON.stringify(r));
```
Expected: 크래시 없음, `timelineLen>0`, `presetsIntact` 변동 없음(프리셋 불변), `JS errors: none`
추가 수동/헤드리스 확인:
- 다른 프리셋(A~E) 전환 정상, 후보/하얏트/준비물 탭 정상
- `p.reload()` 후 내 일정 유지
- 모바일 뷰포트에서 편집 컨트롤 탭 가능

- [ ] **Step 4: Commit**
```bash
git add index.html && git commit -m "feat(myplan): 좌표 가드·초기화 버튼·통합 QA"
```

---

## Task 8: 배포 + 문서 갱신

- [ ] **Step 1: 라이브 배포**
```bash
git push origin main
```
GitHub Pages 빌드 `built` 확인: `gh api repos/rusher2020/danang-trip/pages/builds/latest --jq '{status,commit}'`
라이브 확인: `curl -s "https://rusher2020.github.io/danang-trip/?v=$(date +%s)" | grep -c 'data-plan="my"'` → 1 이상

- [ ] **Step 2: RESUMING.md 체크포인트 갱신**
`docs/RESUMING.md` 상단에 "내 일정 빌더 완료" 체크포인트 추가, 커밋·푸시.

---

## Self-Review (작성자 점검 완료)

- **스펙 커버리지**: 데이터모델(T1) · 변환(T2) · 6번째 플랜 탭/전환/생성(T3) · 카드 담기 시간정렬(T4) · 편집 삭제/시간/이동(T5) · localStorage+URL해시(T6) · 좌표 가드/초기화/통합(T7) · 배포(T8) → 스펙 §4~9 전부 매핑.
- **플레이스홀더**: 핵심 함수는 전부 실제 코드 제공. 단, 기존 함수(renderPlanTabs/renderTimeline/renderMap/showCardDetail)의 정확한 변수명·삽입 위치는 각 태스크 Step 1에서 `sed`로 먼저 읽고 맞추도록 명시(단일 파일이라 라인 변동 큼 → 함수명 기준 + 직전 read 강제).
- **타입/시그니처 일관성**: `myPlan.days[day]=[{uid,source,time,...}]`, 변환 시 `_uid/_source/_cardId` 프리픽스, CRUD는 `uid`로 식별 — 전 태스크 일관.
- **검증 현실성**: 테스트 프레임워크 부재 → 헤드리스 evaluate + `JS errors: none` 게이트. prompt/confirm/alert는 헤드리스에서 함수 직접 호출로 우회(실제 prompt 흐름은 수동 확인 명시).
- **YAGNI 준수**: 피커는 prompt로 시작(추후 인라인 시트 NOTE), 드래그앤드롭·다중일정·투표 제외.
- **알려진 통합 리스크**: ① renderPlanTabs가 PLANS[activePlan]로 features 렌더 시 'my' 가드 필요(T3 Step3 명시) ② renderMap 좌표 해석이 place 전제일 때 coords 가드(T7 Step1 명시). 둘 다 태스크에 반영됨.
