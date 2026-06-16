# 다낭 "내 일정" 기본 시드 + 나이 정정 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 설계 spec(`2026-06-01-danang-myplan-itinerary-design.md`)의 6일 일정을 `index.html`의 "📝 내 일정"(plansStore.my) 기본 시드로 심고, 가족 나이를 딸 9세·아들 6세로 정정한다.

**Architecture:** `DEFAULT_MY_PLAN` 상수(6일 days 모델)를 추가하고, `ensurePlan('my')`가 슬롯 부재/빈 상태일 때 이 상수를 깊은 복사해 시드하도록 한 줄 분기. 프리셋 `ITINERARIES`(A~E) 구조는 불변. 검증은 로컬 서버 + Playwright MCP 브라우저로 렌더·무결성 확인.

**Tech Stack:** 단일 `index.html`(vanilla JS), localStorage(`danang-plans`), Playwright MCP, `python3 -m http.server`.

**스코프 가드:** 프리셋 A~E의 **일정 항목/구조는 절대 수정 금지.** 나이는 **표기 숫자만** 7→9, 4→6 정정(문장 구조 유지). 교통 메모 변경은 이번 범위 제외(후속).

---

### Task 1: DEFAULT_MY_PLAN 상수 추가 + 시드 분기

**Files:**
- Modify: `index.html` — `_seedPlanFromPreset` 직후(~3771) 상수 추가, `ensurePlan`(3779~3784) 'my' 분기 수정

- [ ] **Step 1: DEFAULT_MY_PLAN 상수 추가** (`index.html`, line 3771 `_seedPlanFromPreset` 닫는 `}` 다음 줄에 삽입)

```js
// 내 일정 기본 시드(설계 spec 2026-06-01). card 항목은 cardId 참조, custom은 자체 필드.
const DEFAULT_MY_PLAN = {
  basedOn: 'A', createdAt: '2026-06-01', seedV: 1,
  days: {
    '7/24': [
      { uid:'mp-2435a', source:'custom', time:'20:35', icon:'✈️', title:'ZE593 인천 출발', tag:'transport', memo:'이스타항공 · 소아 동반 카운터 체크인' },
      { uid:'mp-2435b', source:'custom', time:'23:25', icon:'🛬', title:'다낭 도착 · 입국 패스트트랙(일반)', tag:'transport', memo:'다낭고스트 일반 패스트트랙으로 빠른 입국' },
      { uid:'mp-2435c', source:'custom', time:'23:50', icon:'🚐', title:'공항 픽업차량 → New Orient', tag:'transport', mode:'픽업차량', memo:'심야 도착이라 그랩 대신 픽업', cardId:'8.17' },
      { uid:'mp-2435d', source:'card', time:'00:30', cardId:'8.17', note:'체크인·취침 (관광 0)' }
    ],
    '7/25': [
      { uid:'mp-2535a', source:'custom', time:'09:30', icon:'😴', title:'New Orient 회복·조식', tag:'rest', memo:'늦잠·회복, 오전 관광 0' },
      { uid:'mp-2535b', source:'card', time:'12:00', cardId:'5.15', note:'점심(안전식). 대안: 피자 4P's(5.14)' },
      { uid:'mp-2535c', source:'custom', time:'14:00', icon:'🚕', title:'GrabCar7로 하얏트 이동', tag:'transport', mode:'GrabCar 7' },
      { uid:'mp-2535d', source:'card', time:'15:00', cardId:'8.16', note:'체크인 → 수영장·해변 첫 물놀이' },
      { uid:'mp-2535e', source:'card', time:'18:30', cardId:'5.26', note:'저녁(풀사이드)' }
    ],
    '7/26': [
      { uid:'mp-2635a', source:'custom', time:'09:30', icon:'🏊', title:'하얏트 풀·해변', tag:'activity', cardId:'8.16', memo:'5개 풀·해변' },
      { uid:'mp-2635b', source:'card', time:'10:00', cardId:'3.8', note:'아이 키즈클럽 09–18시' },
      { uid:'mp-2635c', source:'card', time:'12:30', cardId:'5.25', note:'점심(안전식)' },
      { uid:'mp-2635d', source:'custom', time:'14:30', icon:'💆', title:'부부 스파 — 퀸 스파(커플 90분)', tag:'activity', mode:'그랩 왕복', cost:'커플 ~17만원', memo:'예약 필수 · 아이는 Camp Hyatt' },
      { uid:'mp-2635e', source:'custom', time:'18:30', icon:'🍽️', title:'저녁 — 리조트 내부', tag:'food', memo:'컨디션 따라' },
      { uid:'mp-2635f', source:'card', time:'21:00', cardId:'6.1', note:'(옵션) 일요일 21:00 · 아이 컨디션 좋을 때만' }
    ],
    '7/27': [
      { uid:'mp-2735a', source:'custom', time:'10:00', icon:'🏖️', title:'오전 하얏트 휴식·물놀이', tag:'rest', memo:'한낮 더위 회피' },
      { uid:'mp-2735b', source:'custom', time:'12:30', icon:'🍽️', title:'점심(안전식) — 하얏트', tag:'food' },
      { uid:'mp-2735c', source:'custom', time:'15:00', icon:'🚐', title:'호이안 단독차량 출발(왕복)', tag:'transport', mode:'단독차량 왕복' },
      { uid:'mp-2735d', source:'card', time:'15:40', cardId:'3.4', note:'코코넛마을 바구니배 + 마켓' },
      { uid:'mp-2735e', source:'card', time:'16:30', cardId:'3.7', note:'반쎄오·짜조 → 만든 음식이 저녁(로컬). 지치면 쿠킹 생략→모닝글로리(5.8)' },
      { uid:'mp-2735f', source:'card', time:'19:00', cardId:'1.18', note:'올드타운 등불 야경' },
      { uid:'mp-2735g', source:'card', time:'19:20', cardId:'3.3', note:'소원배 양초 띄우기' },
      { uid:'mp-2735h', source:'card', time:'19:45', cardId:'4.14', note:'차 한잔(선택)' },
      { uid:'mp-2735i', source:'custom', time:'20:15', icon:'🚐', title:'하얏트 복귀', tag:'transport' }
    ],
    '7/28': [
      { uid:'mp-2835a', source:'custom', time:'09:00', icon:'🏊', title:'하얏트 마지막 짧은 물놀이', tag:'activity' },
      { uid:'mp-2835b', source:'custom', time:'11:00', icon:'🧳', title:'하얏트 체크아웃', tag:'transport' },
      { uid:'mp-2835c', source:'card', time:'11:30', cardId:'8.14', note:'이동·체크인(공항 5분)' },
      { uid:'mp-2835d', source:'custom', time:'13:00', icon:'😴', title:'점심(안전식) → Vanda 샤워·낮잠', tag:'rest', memo:'혼자 애 둘 대비 체력 비축' },
      { uid:'mp-2835e', source:'custom', time:'16:00', icon:'✈️', title:'와이프 별도 출국', tag:'transport', memo:'출발 시각 확정 시 조정' },
      { uid:'mp-2835f', source:'card', time:'17:00', cardId:'7.5', note:'쇼핑 60분: 커피·건망고·캐슈넛' },
      { uid:'mp-2835g', source:'custom', time:'18:30', icon:'🍜', title:'저녁(로컬) — 안 토이(An Thôi)', tag:'food', memo:'미슐랭 빕구르망·에어컨·한시장 5분·한국인 입맛' },
      { uid:'mp-2835h', source:'card', time:'20:00', cardId:'4.1', note:'코코넛커피' },
      { uid:'mp-2835i', source:'custom', time:'21:30', icon:'🧳', title:'Vanda 복귀·짐정리·분리가방', tag:'rest' },
      { uid:'mp-2835j', source:'custom', time:'22:30', icon:'🛫', title:'공항 이동 → 출국 VIP 패스트트랙(라운지)', tag:'transport', memo:'본인+애 둘 VIP' }
    ],
    '7/29': [
      { uid:'mp-2935a', source:'custom', time:'00:25', icon:'✈️', title:'ZE594 다낭 출발', tag:'transport' },
      { uid:'mp-2935b', source:'custom', time:'06:55', icon:'🛬', title:'인천 도착', tag:'transport' }
    ]
  }
};
function _clone(o){ return JSON.parse(JSON.stringify(o)); }
function _planIsEmpty(p){ return !p || !p.days || !Object.values(p.days).some(a => Array.isArray(a) && a.length); }
```

- [ ] **Step 2: `ensurePlan`의 'my' 분기를 DEFAULT 시드로 변경** (line 3779~3784)

기존:
```js
function ensurePlan(key) {
  if (plansStore[key]) return plansStore[key];
  plansStore[key] = ITINERARIES[key] ? _seedPlanFromPreset(key) : { basedOn: 'A', createdAt: _today(), days: {} };
  persistPlans();
  return plansStore[key];
}
```
변경:
```js
function ensurePlan(key) {
  if (key === 'my' && _planIsEmpty(plansStore.my)) { plansStore.my = _clone(DEFAULT_MY_PLAN); persistPlans(); return plansStore.my; }
  if (plansStore[key]) return plansStore[key];
  plansStore[key] = ITINERARIES[key] ? _seedPlanFromPreset(key) : _clone(DEFAULT_MY_PLAN);
  persistPlans();
  return plansStore[key];
}
```

- [ ] **Step 3: JS 문법 검사**

Run: `cd ~/danang-trip-plan && node --check <(sed -n '/<script>/,/<\/script>/p' index.html | sed '1d;$d') 2>&1 | head` 가 어려우면, 브라우저 콘솔 0 에러로 대체(Task 2에서 확인).
간이: `python3 -c "import re,sys; h=open('index.html').read(); assert h.count('DEFAULT_MY_PLAN')>=2 and '_planIsEmpty' in h; print('const present OK')"`
Expected: `const present OK`

- [ ] **Step 4: 커밋(검증 후로 미룸 — Task 4에서 일괄)**

---

### Task 2: 헤드리스 렌더 검증 (내 일정 6일 + 프리셋 무결성)

**Files:** 없음(검증 전용)

- [ ] **Step 1: 로컬 서버 기동**

Run: `cd ~/danang-trip-plan && python3 -m http.server 4178 --bind 127.0.0.1` (백그라운드)

- [ ] **Step 2: Playwright MCP로 로드 + 내 일정 탭 활성화 + 검증**

`http://127.0.0.1:4178/` 로드 → localStorage 비운 상태에서 `ensurePlan('my')` 경로로 내 일정 활성화. eval로 확인:
```js
() => { localStorage.removeItem('danang-plans'); loadPlansStore(); const mp=ensurePlan('my');
  const days=Object.keys(mp.days); const counts=days.map(d=>mp.days[d].length);
  return { days, counts, total: counts.reduce((a,b)=>a+b,0),
           presetA_len: (window.ITINERARIES&&ITINERARIES.A.length)||0 }; }
```
Expected: `days=['7/24'...'7/29']`(6일), total ≈ 31, `presetA_len` 변동 없음(기존 6).

- [ ] **Step 3: 탭 렌더 + 카드 매핑 + JS 에러 0 확인**

내 일정 탭 클릭 → 타임라인에 6일 렌더, card 항목 이름이 정상(예: cardId 3.4 → "Cam Thanh 코코넛 마을 바구니배 ⭐"). 콘솔 에러 0. 프리셋 A~E 탭 전환 정상.

- [ ] **Step 4: 깨진 cardId 점검**

eval: 모든 card/custom 항목의 cardId가 `cardById`에 존재하는지 확인. 누락 0이어야 함.
```js
() => { const ids=[]; Object.values(ensurePlan('my').days).flat().forEach(it=>{ const c=it.cardId; if(c) ids.push([c, !!cardById[c]]); }); return ids.filter(x=>!x[1]); }
```
Expected: `[]` (빈 배열)

---

### Task 3: 가족 나이 정정 (딸 9세 · 아들 6세)

**Files:** `index.html` — 나이 표기 위치. 프리셋 일정 **구조 불변**, 표기 숫자만.

- [ ] **Step 1: 전역 헤더 (line 1467)**

`5박 6일 · 부부(39·39) + 딸 7세 · 아들 4세` → `5박 6일 · 부부(39·39) + 딸 9세 · 아들 6세`

- [ ] **Step 2: 준비물 카시트 메모 (line 1579)**

`<strong>4세 카시트</strong> 한국어 단독차량 사전 요청 (D-7)` → `<strong>6세 카시트</strong> 단독차량 사전 요청 (D-7)`
(line 1517 `6세 카시트`는 이미 정상 — 변경 없음)

- [ ] **Step 3: 프리셋 설명문 내 나이 숫자만 치환** (line 1774, 1844, 1884, 1916, 1932)

각 라인에서 `7세`→`9세`, `4세`→`6세` 문자열만 교체(문장/항목 구조·time·title·tag 불변). 예:
- 1844 `아이 둘(7세·4세) 컨디션` → `아이 둘(9세·6세) 컨디션`
- 1884 `4세는 키즈풀, 7세는 Camp Hyatt` → `6세는 키즈풀, 9세는 Camp Hyatt`
- 1916 `7세 키즈클럽, 4세 키즈풀` → `9세 키즈클럽, 6세 키즈풀`
- 1932 `4세 낮잠` → `6세 낮잠`
- 1774 `7세 호기심·사진 만족` → `9세 호기심·사진 만족`

- [ ] **Step 4: 잔여 나이 표기 점검**

Run: `cd ~/danang-trip-plan && grep -nE "7세|4세" index.html`
Expected: 빈 출력(0건). 남으면 문맥 확인 후 처리.

- [ ] **Step 5: spec 문서 동기화**

`docs/superpowers/specs/2026-06-01-danang-myplan-itinerary-design.md`의 "딸 8세" → "딸 9세" 1건 교체.

---

### Task 4: 최종 검증 + 리뷰 + (커밋·푸시는 사용자 승인)

- [ ] **Step 1: 종합 헤드리스 재검증** — 내 일정 6일 렌더 OK, 프리셋 A~E 정상, 나이 9/6 노출, 콘솔 에러 0.

- [ ] **Step 2: diff 리뷰**

Run: `cd ~/danang-trip-plan && git --no-pager diff --stat && git --no-pager diff index.html | head -120`
확인: 변경이 (a) DEFAULT_MY_PLAN/ensurePlan, (b) 나이 표기에만 국한. 프리셋 ITINERARIES 항목 구조 변경 0.

- [ ] **Step 3: 사용자에게 diff 제시 + 푸시 승인 요청**

멀티머신 레포 + github.io 라이브 반영이므로 **사용자 확인 후** 커밋·푸시. (origin 동기 상태는 작업 시작 시 확인됨: 9102ca6)

```bash
# 승인 시:
git add index.html docs/superpowers/specs/2026-06-01-danang-myplan-itinerary-design.md docs/superpowers/plans/2026-06-01-danang-myplan-seed.md
git commit -m "feat(myplan): 내 일정 기본 시드(6일 가족여행) + 가족 나이 9/6 정정"
git push origin main
```

---

## Self-Review

- **Spec 커버리지:** 6일 일정 전부 Task1 DEFAULT_MY_PLAN에 포함(7/24~7/29). 퀸스파·안토이=custom, 검증 venue(바구니배 3.4/요리 3.7/올드타운 1.18 등)=card 매핑 확인. 나이 정정=Task3. 교통 메모 정정은 spec §4였으나 "건들지마" 가드로 **이번 범위 제외**(후속 별도 승인) — 의도적 축소.
- **Placeholder 스캔:** 미해결 TODO 없음. 와이프 출발 시각은 의도된 가정(7/28 16:00 placeholder, memo로 명시).
- **타입 일관성:** card 항목={uid,source:'card',time,cardId,note}, custom={uid,source:'custom',time,icon,title,tag,memo,mode?,cost?,cardId?} — `myPlanToItinerary`(3810~3828) 필드명과 일치(custom은 `memo`/`mode`/`cost`/`cardId`, card는 `note`).
- **스코프:** 프리셋 ITINERARIES 항목 구조 불변. 나이는 표기 숫자만.
