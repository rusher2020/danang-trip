# 내 일정 UX 후속 + 사진 정리 설계 (4건)

- 작성일: 2026-05-21
- 대상 파일: `index.html` (단일 파일)
- 선행: 내 일정 빌더 + 인라인 담기/편집 배포 완료 (`fb89f48` 기준)
- 실행: **새 세션에서** (`superpowers:subagent-driven-development` 권장). 이 문서가 self-contained.

브레인스토밍 결정(2026-05-21): 사진은 "실제 사진 소싱", 구현 3건은 새 세션.

---

## 항목 1 — [버그] 후보카드에서 담은 뒤 일정/시간표에 즉시 반영 안 됨

### 증상
후보카드에서 "내 일정에 담기" 후 일정/시간표 탭으로 가면 새로고침해야 보임.

### 근본 원인 (확인됨)
- 담기 경로(`openAddToPlanPicker`의 save 핸들러 → `addCardToMyPlan`)는 `if (activePlan === 'my')`일 때만 `renderAll()` 한다.
- 담는 시점에 `activePlan`이 'my'가 아니면(예: 기본 'A' 또는 다른 프리셋 보는 중) **myPlan만 갱신되고 화면 플랜은 그대로** → 일정/시간표로 가도 보던 프리셋이 보임.
- 새로고침하면 로드 로직(`index.html` ~4076–4086)이 `mp=` 해시를 보고 `activePlan='my'`로 자동 전환 → 그제서야 반영됨. 그래서 "새로고침해야 적용"으로 체감.

### 수정
담기 성공 시 **활성 플랜을 '내 일정'으로 전환**하고 플랜탭/전체를 재렌더.
- `openAddToPlanPicker`의 `#apSave` 핸들러에서 `addCardToMyPlan` 호출 직전 `activePlan = 'my';` 설정(그러면 `addCardToMyPlan` 내부 `if(activePlan==='my')` 재렌더가 동작), 직후 `renderPlanTabs();` 추가(내 일정 탭 활성 표시).
- 항목 3(목록 장바구니 버튼)에서도 동일 커밋 경로를 쓰도록 **공통 커밋 함수**로 묶을 것(아래 권장 리팩터 참조).

### 검증(헤드리스)
프리셋 A 보는 상태 → 후보 담기 → `activePlan==='my'` 확인 → 일정/시간표 mode 전환 시 추가 항목 보임(새로고침 없이). JS 에러 0.

---

## 항목 2 — 시간표 탭에 날짜 선택 추가

### 현황
- `renderTimetable()`(index.html ~3228)은 `getActiveDays()`(= `activeTab` 기반)로 날짜를 고른다.
- 날짜 탭(`renderTabs()` → `#tabs`)은 `timeline-section` 안에 있어 **시간표 모드에선 안 보임**.

### 구현
- `renderTimetable()`이 만드는 html 맨 앞에 날짜 선택 바를 추가: `전체` + 각 날짜 칩. (timeline의 `renderTabs` 스타일 재사용 가능)
- 칩 클릭 → `activeTab = <값>` 설정 후 재렌더. 동기화 위해 `renderAll()` 호출(타임라인 탭·시간표·지도 일관). 또는 최소 `renderTabs(); renderTimetable();`.
- `#timetableWrap` 위 별도 컨테이너(예: `<div class="tt-day-bar">`)에 렌더하거나, 기존 `tabs-bar`를 시간표 모드에서도 보이게 CSS로 노출하는 방법도 가능. **권장: 시간표 전용 day-bar를 timetable html에 prepend**(모드 독립적이고 단순).

### 검증
시간표 모드에서 날짜 칩 클릭 → 해당 날짜만 표시, `전체` → 전부. JS 에러 0.

---

## 항목 3 — 후보 목록(그리드)에서 바로 담기 (장바구니식)

### 요구
후보카드 그리드에서 카드 사진 **우상단에 "담기" 버튼**. 상세 안 들어가고 옵션(날짜/시각) 선택해 바로 담기. (쇼핑몰 목록 장바구니 패턴)

### 구현
- `renderCandidates()`(index.html ~3245~)의 `.cand-card` 마크업, `.cand-img` 안에 버튼 추가:
  `<button class="cand-add" data-cid="${card.id}" title="내 일정에 담기">＋ 담기</button>` (CSS: `position:absolute; top:6px; right:6px;` — `.cand-img`는 이미 `position:relative` 계열인지 확인, `.cand-pin`이 absolute로 들어가 있으니 OK).
- 클릭 핸들러: `ev.stopPropagation()`(상세 안 열리게) → `openQuickAddSheet(card)`.
- `openQuickAddSheet(card)`: **화면 내 바텀시트**(in-page, 오버레이지만 브라우저 prompt 아님)로 같은 칩 피커(기준 프리셋 if 必 + 날짜 칩 + 시각 칩 + 담기/취소)를 띄움. 담기 시 항목 1의 공통 커밋 경로 사용 → 닫기.

### 권장 리팩터 (DRY)
현재 상세뷰 인라인 시트(`openAddToPlanPicker`)와 신규 바텀시트가 칩 UI·커밋 로직을 공유하도록 분리:
- `buildPickerMarkup(card)` → 프리셋(필요시)·날짜·시각 칩 + 액션 HTML 반환 (`data-role="presets|days|times|save|cancel|msg"`)
- `bindPicker(rootEl, card, {onCommit, onCancel})` → 칩 선택 상태 + save 시 `if(!myPlan)createMyPlanFrom(selPreset); activePlan='my'; addCardToMyPlan(...); renderPlanTabs();` (항목 1 수정 내장) + 성공 메시지 → `onCommit()`
- 상세 인라인 시트와 바텀시트가 둘 다 이 두 함수를 사용.
- 바텀시트 CSS: 하단 고정 패널 + 반투명 백드롭(탭하면 닫힘). 모바일 우선.

### 검증
그리드에서 ＋담기 → 바텀시트 → 날짜·시각 칩 → 담기 → myPlan 반영 + activePlan='my', 상세 안 열림, native 팝업 0, JS 에러 0. 데스크톱/모바일.

---

## 항목 4 — 중복/일반 사진 → 실제 사진 소싱

### 현황 (전수 스캔, CANDIDATE_DATA 107장 기준)
- **33개 카드가 12개 이미지를 공유**(실제 그 장소 사진 아님, Wikimedia 범용 커피/풍경 사진 돌려쓰기).
- 카테고리별 중복 카드 수: 카페·디저트 13, 숙소·스파 8, 쇼핑·시장 5, 자연·해변 3, 야간·엔터 3, 체험 1.
- 대표 중복 그룹(카페): `VN_drip_coffee...` 5장(XLIII·Cua Ngo·Wonderlust×2·43 Factory), `Long_Beach_Coffee_Bar...` 5장(Coconut House·34 Tropical·Nóc Rooftop·Roots·Kem Bo).

### 방향 (사용자 결정: 실제 사진 소싱)
- 각 카드별로 **실제 그 장소 사진**을 찾아 `card.image` 교체. 우선순위: ① 공식/관광청 ② Wikimedia Commons(라이선스 명확) ③ 라이선스 표기된 출처. **라이선스 불명 이미지 금지.**
- 실제 사진을 못 찾는 카드는 **범용 사진 재사용 대신 `image` 제거**(렌더러가 카테고리 아이콘 타일로 폴백) — "다른 곳 같은 사진"보다 정직.
- 권장 워크플로: 카테고리별로 진행(카페→숙소→쇼핑…). 카드별 `name`+지명으로 이미지 검색, 출처·라이선스 메모. 자산 정책상 외부 핫링크보다 `assets/img/`에 큐레이션 커밋이 더 안전(현 코드도 raw.githubusercontent 사용 중) — 저장소 용량/라이선스 고려해 결정.
- **주의**: 이미지 URL은 깨질 수 있으니 로드 실패 시 아이콘 폴백 처리 가드도 함께(현재 `onerror` 가드 여부 확인 후 보강).

### 검증
카테고리별 중복 0 확인(스캔 스크립트 재실행), 깨진 이미지 0(헤드리스에서 img naturalWidth 체크), JS 에러 0.

---

## 공통 검증 도구
로컬: `python3 -m http.server 4178 --bind 127.0.0.1`. 헤드리스: playwright 1.60 npx 캐시 + 캐시 chromium(경로는 `docs/RESUMING.md` 참조). 모든 항목 공통 게이트: **JS 에러 0**.

## 권장 실행 순서
1(버그, 소형) → 2(시간표 날짜) → 3(장바구니 버튼, 항목1 커밋경로 공유) → 4(사진, 분량 큼·카테고리별 분할).
