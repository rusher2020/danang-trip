# 다낭 가족여행 모바일 대시보드 디자인 진단 및 설계 핸드오프

작성일: 2026-05-09
대상: `http://127.0.0.1:4175/`
범위: 디자인 진단, UX 재설계 방향, UI 시스템, 구현 지시

## 1. 진단 요약

현재 화면은 자료 구조가 잘 정리된 모바일 우선 정적 플랜북이지만, 사용 맥락이 두 가지로 섞여 있다.

- 사전 기획용: 후보 비교, 후기 신호, 예산, 이동, 준비물 확인
- 여행 중 사용용: 오늘 일정, 지도 열기, 당일 진행/중단 결정, 메모

가족 여행 현장에서 실제로 필요한 것은 긴 설명을 읽는 화면보다 `오늘 무엇을 할지`, `지금 가도 되는지`, `대안은 무엇인지`, `지도와 연락/메모를 바로 열 수 있는지`다. 따라서 디자인은 여행 리포트형 페이지가 아니라 모바일 운영 도구에 가깝게 재정렬해야 한다.

가장 먼저 고쳐야 할 구현 이슈도 있다.

- `styles.css`의 `.bottom-nav`가 `grid-template-columns: repeat(3, 1fr)`로 되어 있는데 버튼은 4개다. 모바일 하단 내비게이션이 2줄로 깨질 수 있으므로 `repeat(4, 1fr)`로 수정해야 한다.
- 상단 `tab-bar`와 하단 `bottom-nav`가 같은 4개 탭을 중복 제공한다. 모바일에서는 하단 내비게이션을 주 탐색으로 두고, 상단 탭은 데스크톱/태블릿 또는 보조 탐색으로 역할을 분리하는 것이 좋다.
- 카드와 섹션이 모두 같은 흰색 박스/그림자 스타일이라 정보 우선순위가 약하다. 긴 읽기 카드와 즉시 행동 카드가 같은 시각 강도를 갖는다.
- Hero가 “플랜북 설명” 중심이라 첫 화면에서 오늘의 핵심 행동이 약하다.

## 2. 제품 방향

권장 포지셔닝은 `가족 여행 현장용 모바일 대시보드`다. 여행 가이드북처럼 많은 설명을 읽는 화면보다, 현장에서 바로 확인하고 결정하는 운영 화면에 가깝게 설계한다.

참고 레퍼런스:

- TripIt: 항공, 호텔, 일정이 시간순으로 정리되는 구조
- Wanderlog: 지도 기반 일정과 장소 묶음
- Google My Maps: 카테고리별 장소 핀과 지도 레이어
- Notion 여행 템플릿: 예약정보, 체크리스트, 예산표
- Apple Wallet / boarding pass UI: 항공편, 호텔, 예약번호처럼 즉시 보여야 하는 정보 카드

이 레퍼런스는 UI와 정보구조 참고용이다. 최신 운영 정보와 장소 판단은 공식 출처, 호텔/항공사/관광청, 검증 가능한 링크를 우선한다.

사용자가 첫 화면에서 바로 알아야 하는 것:

1. 여행 기간과 현재 플랜의 성격
2. 오늘 또는 다음 의사결정
3. 확정 일정과 조건부 일정의 차이
4. 아이 컨디션/날씨/더위에 따른 대안
5. 지도, 상세, 메모로 바로 이어지는 행동

톤은 여행 매거진보다 조용한 운영 도구가 맞다. 가족 여행이라는 정서가 있으므로 너무 건조하게 만들 필요는 없지만, 화면의 기본 목적은 “읽는 즐거움”이 아니라 “결정 피로 줄이기”다.

## 3. 정보 구조 재설계

현재 탭 구조는 유지하되 명칭과 첫 화면의 역할을 다듬는다.

권장 탭:

- `오늘`: 현재 일정, 다음 결정, 날씨형/컨디션형 대안
- `일정`: Day 0-5 전체 타임라인
- `장소`: 후보 카드, 검색, 필터, 지도
- `준비`: 이동, 예산, 쇼핑, 준비물, 긴급 메모

`후기`는 독립 탭으로 두기보다 장소 상세와 장소 카드 안에 통합하는 편이 좋다. 후기 신호는 사용자가 별도로 읽고 싶은 문서라기보다 후보 판단에 붙는 근거이기 때문이다. 독립 탭을 유지한다면 `후기`가 아니라 `근거` 또는 `리뷰 근거`처럼 의사결정 보조 역할을 분명히 해야 한다.

첫 화면 구성:

1. Compact trip header
   - `다낭 가족여행`
   - `2026.07.24-07.29 · 성인 2 · 아이 2`
   - 상태 칩: `후보 선택형`, `7월 더위`, `아이 컨디션`

2. Next decision card
   - 제목: `다음 결정: 바나힐을 날씨형 일정으로 둘지`
   - 판단 기준 3개: `전날 날씨`, `아이 피로`, `왕복 차량`
   - 액션: `관련 후보 보기`, `대안 보기`

3. Today/selected day card
   - 기본값은 날짜가 여행 전이면 `출발 전 체크`
   - 여행 기간 중이면 날짜 기반으로 해당 Day 표시
   - 각 블록은 시간, 장소, 지도, 대안 버튼을 포함

4. Fixed flow
   - 숙소 이동은 작게 유지하되 확정 정보이므로 신뢰 앵커로 사용

5. Candidate highlights
   - 우선 후보 3-4개만 노출
   - 전체 후보는 `장소` 탭에서 탐색

## 4. UX 원칙

### 결정 상태를 색과 라벨로 분명히 나눈다

현재 `fixed`, `recommended`, `planned`, `flexible`, `candidate`, `shortlisted`, `backup` 등이 섞여 있다. UI에서는 다음 네 상태로 통합 표시한다.

- `확정`: 항공, 숙소, 반드시 지켜야 하는 이동
- `추천`: 기본안으로 잡아도 되는 일정
- `조건부`: 날씨/컨디션 보고 결정
- `대안`: 더위, 비, 피로 시 교체 카드

### 긴 설명은 접고, 판단 근거를 먼저 보인다

장소 카드의 우선 정보:

1. 이름
2. 상태
3. 추천 시간
4. 이동 부담
5. 아이 적합성
6. 주의/중단 조건
7. 액션

상세 설명, 후기 원문성 정보, 출처는 하단 시트에서 보조 정보로 둔다.

### 여행 중 한 손 사용을 고려한다

- 주요 액션은 하단 40-48px 높이 버튼
- 지도 열기, 상세, 대안 보기 순서
- 필터 칩은 가로 스크롤 가능하되 첫 화면에 너무 많이 노출하지 않음
- 하단 내비게이션은 4열 고정

## 5. UI 시스템 제안

### 색상

현재 팔레트는 베이지 배경과 청록 액센트 중심이다. 여행지의 온도감은 있으나 화면 전체가 약간 단조롭다. 유지하되 상태 색을 추가해 정보 구분을 강화한다.

권장 토큰:

- Background: `#F7F5EF`
- Surface: `#FFFFFF`
- Ink: `#202124`
- Muted: `#676B73`
- Line: `#E1DED6`
- Primary: `#0D6B68`
- Primary strong: `#074A48`
- Warning/conditional: `#D77A32`
- Confirmed: `#1D5F9F`
- Backup/soft: `#6F7D4A`
- Danger/caution: `#A33A2C`

사용 규칙:

- Primary는 주요 CTA와 활성 탭에만 사용
- Warning은 `조건부`, `주의`, `당일 결정`에 사용
- Confirmed는 확정 일정과 숙소 흐름에 사용
- Backup은 대안 카드와 실내/휴식 대안에 사용

### 타이포그래피

- H1: 26-30px, 첫 화면에서만 사용
- Section title: 20-22px
- Card title: 16-18px
- Metadata: 11-12px, 굵게
- Body: 14-15px, line-height 1.45-1.6

여행 중 모바일 사용성을 고려해 본문은 지금처럼 14px를 유지해도 되지만, 카드 내부 설명은 2-3줄까지만 노출하고 상세는 시트로 넘긴다.

### 레이아웃

- 모바일 기본 폭: 390px 기준 최적화
- 콘텐츠 최대 폭: 현재 `760px` 유지
- 데스크톱: 단순 확장보다 2컬럼 보드로 구성
  - 좌측: 일정/결정
  - 우측: 후보/지도/메모

### 컴포넌트

필수 컴포넌트:

- `StatusPill`: 확정, 추천, 조건부, 대안
- `DecisionCard`: 다음 결정, 진행 조건, 중단 조건, 대안
- `DayTimelineCard`: 날짜별 시간 블록
- `PlaceCardCompact`: 장소 목록용
- `PlaceSheet`: 상세 정보, 후기, 지도, 출처
- `QuickActionBar`: 지도, 상세, 대안
- `ChecklistItem`: 준비 탭용

## 6. 화면별 설계

### Header

현재 설명문은 길다. 첫 화면에서는 다음처럼 줄인다.

- Title: `다낭 가족여행`
- Subtitle: `2026.07.24-07.29 · 성인 2 · 아이 2`
- Chips: `후보 선택형`, `7월 더위`, `숙소 기준 동선`, `한국인 후기`

긴 문장형 설명은 삭제하거나 `설계 기준` 섹션으로 내린다.

### 오늘 탭

가장 중요한 신규 화면이다.

구성:

- `다음 결정` 카드
- `출발 전 체크` 또는 `오늘 일정` 카드
- `날씨/컨디션 대안` 카드 2-3개
- `확정 숙소 흐름`

여행 전 현재 시점에서는 `오늘 일정`보다 `출발 전 체크`가 맞다.

### 일정 탭

현재 `Daily Plan`은 좋은 구조다. 다만 모든 설명을 펼쳐 놓으면 길다.

개선:

- Day 카드 상단에 상태, 숙소, 핵심 테마
- 시간 블록은 유지
- 장소 버튼은 `지도/상세`로 연결
- 확정/추천/조건부 상태 색상 구분

### 장소 탭

현재 검색과 필터는 좋지만 필터가 많다.

개선:

- 1차 필터: `전체`, `우선`, `조건부`, `대안`
- 2차 필터: 카테고리는 드롭다운 또는 접힌 칩 그룹
- 카드 첫 줄에 이동 부담과 추천 시간 표시
- CTA 순서: `지도`, `상세`, `출처`

### 준비 탭

현재 여러 섹션이 길게 이어진다.

개선:

- 상단에 `남은 확인 5개` 요약
- 이동/예산/쇼핑/준비물/긴급을 아코디언 또는 섹션 점프 형태로 구성
- 가족 메모는 하단 고정이 아니라 준비 탭 상단 근처에 두는 편이 실사용성이 좋다.

## 7. 구현 우선순위

1. 하단 내비게이션 4열 버그 수정
   - `.bottom-nav { grid-template-columns: repeat(4, 1fr); }`

2. `오늘` 탭 추가 또는 `일정` 탭의 첫 섹션을 오늘 중심으로 재구성
   - 여행 전에는 `출발 전 체크`
   - 여행 중에는 날짜 기반 Day 카드

3. 상태 라벨 통합
   - 데이터 원본 값은 유지해도 되지만 UI 표시용 매핑을 `확정/추천/조건부/대안`으로 정리

4. Header 축소
   - 긴 lead 제거
   - 판단 기준 칩화

5. 장소 카드 정보 압축
   - 카드 본문 노출 필드를 줄이고 상세 시트로 이동

6. 후기 탭 통합 여부 결정
   - 장소 상세 안에 후기 신호를 붙이는 방향 권장

7. 데스크톱 레이아웃 보강
   - 720px 이상에서 장소만 2컬럼이 아니라, 일정/결정 보드도 넓은 화면에 맞게 조정

## 8. 상세 와이어프레임

### 모바일 첫 화면: 390 x 844 기준

목표는 첫 화면 안에서 `여행 정체성`, `다음 결정`, `출발 전/오늘 카드`가 모두 보이는 것이다.

```text
┌──────────────────────────────┐
│ 2026.07.24-07.29             │
│ 다낭 가족여행                │
│ 성인 2 · 아이 2 · 후보 선택형 │
│ [7월 더위] [아이 컨디션]      │
└──────────────────────────────┘

┌──────────────────────────────┐
│ 다음 결정                     │
│ 바나힐을 날씨형 일정으로 둘지 │
│ 조건: 전날 날씨 · 아이 피로   │
│ [관련 후보] [대안 보기]       │
└──────────────────────────────┘

┌──────────────────────────────┐
│ 출발 전 체크                  │
│ 항공편 · 조식 · 체크인 확인   │
│ 남은 확인 5개                 │
│ [준비 보기]                   │
└──────────────────────────────┘

┌──────────────────────────────┐
│ 확정 흐름                     │
│ New Orient → Hyatt → Happy Day│
└──────────────────────────────┘

┌──────────────────────────────┐
│ 하단 내비: 오늘 일정 장소 준비│
└──────────────────────────────┘
```

첫 화면에서 제거하거나 아래로 내릴 것:

- 긴 lead 문장
- `Expert Summary`의 여러 판단 기준 카드
- 문서 바로가기 버튼
- 숙소 타임라인 전체 3개 카드

문서 바로가기는 푸터나 준비 탭 하단으로 이동한다. 여행 현장 UI에서 `.md` 문서 링크는 주 액션이 아니다.

### 데스크톱: 1280 x 900 기준

데스크톱에서는 모바일 컨텐츠를 단순 중앙 정렬하지 말고 운영 보드처럼 나눈다.

```text
┌──────────────────────────────────────────────┐
│ Compact Header                               │
└──────────────────────────────────────────────┘

┌───────────────────────┬──────────────────────┐
│ 좌측: 오늘/일정        │ 우측: 결정/후보       │
│ - 출발 전/오늘 카드    │ - 다음 결정 카드      │
│ - Day timeline         │ - 우선 후보 3개       │
│ - 숙소 흐름            │ - 가족 메모           │
└───────────────────────┴──────────────────────┘
```

권장 CSS 방향:

- `@media (min-width: 960px)`에서 `.dashboard-grid`를 `grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr)`로 구성
- 하단 내비게이션은 데스크톱에서 숨기거나 상단 탭만 유지
- 고정 하단바를 유지한다면 `max-width: 760px` 중앙 고정 대신 화면 하단 전체 또는 앱 컨테이너 내부에 명확히 고정

## 9. 탭별 상세 명세

### 오늘 탭

역할: 여행 전/여행 중 가장 먼저 보는 홈 화면.

필수 섹션:

- `NextDecisionCard`
- `CurrentTripStateCard`
- `RecommendedFallbacks`
- `FixedHotelFlowCompact`

여행 전 상태 문구:

- 제목: `출발 전 체크`
- 설명: `항공편, 호텔 조식, 체크인 가능 시간, 아이 음식 제한을 확정하면 현장 결정이 줄어듭니다.`
- 보조 정보: `남은 확인 5개`
- 액션: `준비 보기`

여행 중 상태 문구:

- 제목: `오늘 일정`
- 설명: 해당 날짜의 `theme`와 `summary`
- 시간 블록: 현재 시간 이후 블록을 우선 표시
- 액션: `지도 열기`, `대안 보기`

### 일정 탭

역할: 전체 여정을 읽고 순서를 확인하는 화면.

카드 구조:

```text
Day 2 · 7/26 일        [추천]
리조트 회복 + 근거리 + 드래곤브릿지 후보
Hyatt

08:30-10:30  선택: 오행산 짧게
주의: 계단/더위. 컨디션 좋을 때만.
[상세] [지도]

11:00-15:30  하얏트 수영장과 낮잠
[상세]
```

설계 규칙:

- 날짜와 상태는 카드 최상단에 둔다.
- 긴 `summary`는 2줄까지만 보이고 상세는 펼침 또는 시트로 이동한다.
- 장소 칩이 4개 이상이면 `+N개`로 접는다.
- Day 상태는 `확정/추천/조건부/계획`으로 한국어 표시한다.

### 장소 탭

역할: 후보를 빠르게 비교하고 지도/상세로 이동하는 화면.

상단 구조:

```text
후보 장소
[검색 입력]
[전체] [우선] [조건부] [대안]
카테고리: [액티비티 v]
```

카드 구조:

```text
[조건부] [높음] [오전 출발]
바나힐 & 골든브릿지
하루짜리 대표 액티비티. 날씨와 아이 피로가 핵심 변수.

이동: 전용차 왕복
아이: 케이블카/실내 Fantasy Park
주의: 안개/비/대기

[지도] [상세]
```

설계 규칙:

- 이미지는 있는 카드만 상단에 쓰고, 이미지 없는 카드에는 큰 그라디언트 블록을 만들지 않는다. 이미지 없음 상태에서는 텍스트 밀도와 비교성이 더 중요하다.
- `출처 보기`는 카드 기본 액션에서 빼고 상세 시트 하단으로 이동한다.
- 지도는 가장 오른쪽이 아니라 첫 번째 액션으로 둔다. 현장 사용성 기준으로 가장 빠른 행동이다.

### 준비 탭

역할: 여행 전 확인과 현장 운영 메모.

상단 구조:

```text
준비 보드
남은 확인 5개 · 자동 저장 메모 있음
[확인 항목] [이동] [예산] [쇼핑] [긴급]
```

섹션 규칙:

- `Need Input`은 준비 탭 최상단으로 올린다.
- 체크리스트는 상태 배지가 오른쪽에서 너무 많은 폭을 차지하지 않게 2행 구조를 허용한다.
- 가족 메모는 준비 탭 상단 2번째에 둔다.
- 긴급/현지 메모는 마지막이 아니라 상단 점프 메뉴에서 바로 접근 가능해야 한다.

## 10. 컴포넌트 명세

### StatusPill

입력값 매핑:

| 원본 값 | UI 라벨 | 색상 역할 |
| --- | --- | --- |
| `fixed`, `confirmed` | 확정 | Confirmed |
| `recommended`, `shortlisted` | 추천 | Primary |
| `flexible`, `candidate`, `planned`, `research` | 조건부 | Warning |
| `backup` | 대안 | Backup |
| `skip` | 제외 | Muted |

### NextDecisionCard

필드:

- `title`: `바나힐 진행 여부`
- `when`: `7/26 밤 또는 7/27 아침`
- `go`: 진행 조건
- `skip`: 중단 조건
- `fallback`: 대안
- `relatedPlaceIds`: 관련 장소

UI:

- 상단에 `다음 결정` eyebrow
- 제목은 18-20px
- 진행/중단/대안을 3개의 짧은 행으로 표시
- 액션은 `관련 후보`, `대안 보기`

### PlaceCardCompact

노출 필드:

- `status`
- `priority`
- `bestTime`
- `name`
- `summary`
- `transfer`
- `kidPoint`
- `caution`

숨김/상세 이동 필드:

- 전체 후기 신호
- 이미지 크레딧
- 긴 decisionNeeded
- sourceUrl
- suggestedSlots 전체

### BottomNav

구조:

- 4개 항목: `오늘`, `일정`, `장소`, `준비`
- CSS: `grid-template-columns: repeat(4, minmax(0, 1fr))`
- 높이: 56-64px
- `body/main` 하단 패딩: 하단바 높이 + safe area 고려해 최소 `96px`
- iOS 대응: `padding-bottom: calc(7px + env(safe-area-inset-bottom))`

데스크톱:

- `@media (min-width: 960px)`에서 숨기고 상단 탭 또는 좌측 보드 내 탐색 사용 권장

### DetailSheet

역할: 카드에서 접은 긴 정보를 제공.

구조:

- 이미지가 있으면 상단 이미지
- 제목/상태/요약
- 추천 시간, 이동, 아이 포인트, 주의, 후기 신호
- 하단 액션: `지도 열기`, `출처 보기`

주의:

- 시트 닫기 버튼은 텍스트 `닫기`보다 아이콘 또는 `×`가 적합하지만, 현재 아이콘 라이브러리가 없으면 텍스트 유지 가능
- 시트 내부 액션은 sticky bottom으로 두면 현장 사용성이 좋아진다.

## 11. 카피 가이드

문장은 짧고 결정 중심으로 쓴다.

권장:

- `비 예보가 약하고 아이들이 충분히 잤다면 진행`
- `더위가 강하면 롯데마트로 전환`
- `식사를 먼저 하고 20:30-21:00 복귀`

피할 것:

- `확정된 항공·숙소를 기준으로 맛집, 액티비티...`
- `한곳에서 확인하는 모바일 여행 플랜북입니다`
- 긴 조사 보고서형 문장

라벨 규칙:

- `Expert Summary` → `설계 기준`
- `Fixed Flow` → `확정 흐름`
- `Daily Plan` → `전체 일정`
- `Scenarios` → `대안 시나리오`
- `Decision Rules` → `당일 결정`
- `Need Input` → `남은 확인`

## 12. 구현 체크리스트

메인 세션이 작업 후 확인할 항목:

- 390px 폭에서 하단 내비게이션이 한 줄 4칸으로 유지된다.
- 하단 내비게이션이 어떤 카드 텍스트도 덮지 않는다.
- 첫 화면 844px 높이 안에 `다음 결정` 카드가 완전히 보인다.
- 첫 화면에 `.md` 문서 링크가 주 액션처럼 보이지 않는다.
- 장소 카드의 기본 액션은 `지도`, `상세` 중심이다.
- `후기` 정보가 장소 판단 근거로 연결된다.
- 상태 라벨이 한국어 4종 중심으로 정리된다.
- 1280px 데스크톱에서 콘텐츠가 한 줄 세로 문서처럼만 보이지 않는다.
- WebKit에서 스크롤, fixed nav, bottom sheet가 겹치지 않는다.

## 13. 통합 구현 청사진

이 섹션은 메인 세션이 바로 구현할 수 있는 파일 단위 지시다.

### 수정 대상 파일

- `index.html`
- `styles.css`
- `script.js`

데이터 파일은 가능하면 변경하지 않는다. 필요한 UI 라벨은 `script.js`에서 매핑한다.

### HTML 구조 변경

현재:

```html
<button data-tab="schedule">일정</button>
<button data-tab="places">장소</button>
<button data-tab="reviews">후기</button>
<button data-tab="prep">준비</button>
```

권장:

```html
<button data-tab="today">오늘</button>
<button data-tab="schedule">일정</button>
<button data-tab="places">장소</button>
<button data-tab="prep">준비</button>
```

`reviews` 패널은 제거하지 말고 숨겨진 독립 탭에서 제외한다. 후기 콘텐츠는 장소 상세와 장소 카드의 `review-snippet`에 통합한다. 기존 `tab-reviews` 섹션은 메인 세션에서 안정적으로 처리하기 어렵다면 DOM에 남겨도 되지만, 탭 버튼과 하단 내비게이션에서는 빼는 것을 권장한다.

새 `today` 패널을 `main`의 첫 번째 패널로 추가한다.

```html
<section class="tab-panel is-active" id="tab-today" data-tab-panel="today">
  <section class="section today-section">
    <div class="today-grid">
      <div class="today-main">
        <div id="next-decision-card" class="decision-hero"></div>
        <div id="current-state-card" class="current-state-card"></div>
      </div>
      <aside class="today-side">
        <div id="fallback-list" class="fallback-list"></div>
        <div id="hotel-flow-compact" class="hotel-flow compact"></div>
      </aside>
    </div>
  </section>
</section>
```

기존 `schedule` 패널은 `is-active`를 제거하고 hidden 상태로 시작한다.

### Header 변경

현재 `.lead`는 제거하거나 시각적으로 숨기지 말고 짧은 `.trip-subtitle`로 교체한다.

권장 마크업:

```html
<header class="app-header compact">
  <div class="header-top">
    <p id="date-range" class="eyebrow">2026.07.24 - 07.29</p>
    <h1 id="trip-title">다낭 가족여행</h1>
    <p class="trip-subtitle">성인 2 · 아이 2 · 데이터 기반 후보 선택형</p>
    <div id="criteria-chips" class="criteria-chips"></div>
  </div>
</header>
```

기존 `.summary-grid`는 첫 화면에서 제거한다. 정보를 잃지 않으려면 `criteria-chips`로 압축한다.

### JS 함수 추가

`script.js`에 다음 렌더 함수 개념을 추가한다.

```js
function getUiStatus(value) {
  const map = {
    fixed: "확정",
    confirmed: "확정",
    recommended: "추천",
    shortlisted: "추천",
    flexible: "조건부",
    candidate: "조건부",
    planned: "조건부",
    research: "조건부",
    backup: "대안",
    skip: "제외"
  };
  return map[value] || value;
}

function getCurrentTripState(days) {
  const today = new Date();
  const tripStart = new Date("2026-07-24T00:00:00+09:00");
  const tripEnd = new Date("2026-07-29T23:59:59+09:00");
  if (today < tripStart) return { mode: "pretrip" };
  if (today > tripEnd) return { mode: "posttrip" };
  return { mode: "intrip" };
}
```

날짜 기반 Day 매칭은 타임존/여행 현지 날짜 이슈가 있으므로 1차 구현에서는 `pretrip/intrip/posttrip` 정도만 써도 충분하다. 현재 날짜 2026-05-09 기준 첫 화면은 `출발 전 체크`가 맞다.

필수 추가 렌더 함수:

- `renderCriteriaChips(trip)`
- `renderTodayPanel({ trip, days, decisions, hotels, places })`
- `renderNextDecision(decisions, places)`
- `renderCurrentState(days, trip)`
- `renderFallbacks(places)`
- `renderCompactHotelFlow(hotels)`

### 데이터 매핑 규칙

`renderNextDecision`:

- 우선순위 1: `decisions`에서 `title`에 `바나힐`이 포함된 항목
- 없으면 첫 번째 decision
- `when`, `go`, `skip`, `fallback`을 표시
- `relatedPlaceIds`는 버튼으로 표시하되 3개까지만 노출

`renderCurrentState`:

- 여행 전: `questions.md`에 대응하는 남은 확인 항목을 `data/checklist.json`에서 요약
- 여행 중: 현재 날짜에 맞는 `days` 항목 표시
- 여행 후: `최종 플랜 문서`와 메모 중심으로 표시

`renderFallbacks`:

- `places.status === "backup"` 또는 `places.suggestedSlots`에 `더위 대안`이 포함된 장소
- 최대 3개 표시
- 우선순위: `하얏트 수영장·해변 시간`, `롯데마트 다낭`, `MM Mega Market`, `Camp Hyatt` 계열

`renderCompactHotelFlow`:

- 호텔명 전체가 길면 1줄에서 말줄임
- 날짜 라벨과 호텔명만 기본 노출
- 상세 설명은 일정 탭의 숙소 타임라인으로 넘긴다.

### CSS 변경 지시

즉시 필요한 수정:

```css
.bottom-nav {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  bottom: 0;
  left: 0;
  right: 0;
  max-width: none;
  border-radius: 0;
  padding: 7px 14px calc(7px + env(safe-area-inset-bottom));
}

main {
  padding-bottom: calc(96px + env(safe-area-inset-bottom));
}
```

Header:

```css
.app-header.compact {
  padding: 24px 18px 14px;
}

.trip-subtitle {
  margin-bottom: 12px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.45;
}

.criteria-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
```

Today panel:

```css
.today-grid {
  display: grid;
  gap: 12px;
}

.decision-hero {
  border: 1px solid rgba(215, 122, 50, 0.35);
  border-radius: 8px;
  padding: 16px;
  background: #fff8f0;
}

.current-state-card,
.fallback-card,
.hotel-flow.compact article {
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 14px;
  background: var(--surface);
  box-shadow: var(--shadow);
}

@media (min-width: 960px) {
  .today-grid {
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
    align-items: start;
  }

  .bottom-nav {
    display: none;
  }

  main {
    padding-bottom: 48px;
  }
}
```

상태 색:

```css
.pill.status-confirmed { background: #eaf2fb; color: #1d5f9f; }
.pill.status-recommended { background: #edf4f3; color: #074a48; }
.pill.status-conditional { background: #fff2e8; color: #974c17; }
.pill.status-backup { background: #f1f3e8; color: #586336; }
.pill.status-muted { background: #f1f1f1; color: #676b73; }
```

### 렌더링 순서

`init()` 또는 현재 데이터 로딩 완료 지점에서 순서를 다음처럼 정리한다.

```text
1. trip, hotels, days, places, decisions, reviews, etc. 로드
2. renderTrip(trip)
3. renderCriteriaChips(trip)
4. renderTodayPanel({ trip, days, decisions, hotels, places })
5. 기존 schedule/places/prep 렌더
6. 탭 이벤트 연결
```

기존 `renderTrip`이 `.summary-grid` 요소를 참조한다면 해당 DOM 제거 후 null 체크를 추가한다.

### 기존 기능 보존 기준

반드시 유지:

- 장소 검색
- 장소 필터
- 장소 상세 sheet
- 지도 링크
- 체크리스트 localStorage
- 가족 메모 localStorage
- JSON validation 통과

변경 가능:

- 탭 이름
- 첫 화면 섹션 순서
- 후기 탭의 독립 노출 여부
- 카드에 기본 노출되는 필드 수

삭제하지 말 것:

- 원본 데이터 JSON
- 출처 링크 데이터
- 기존 markdown 조사 문서

## 14. 바로 통합용 완료 기준

메인 세션이 구현 완료라고 판단할 수 있는 기준은 다음이다.

1. `http://127.0.0.1:4175/` 첫 화면이 `오늘` 중심으로 열린다.
2. 모바일 390px에서 첫 화면의 정보 순서가 `여행명 → 다음 결정 → 출발 전 체크 → 확정 흐름`이다.
3. 하단 내비게이션은 `오늘/일정/장소/준비` 4개이며 한 줄이다.
4. `후기`는 독립 탭 버튼에서 빠지거나, 남더라도 주 탐색의 우선순위를 차지하지 않는다.
5. 장소 카드는 현장 액션 중심으로 압축되어 스크롤 피로가 줄어든다.
6. 데스크톱은 960px 이상에서 2컬럼 today grid를 쓴다.
7. WebKit 모바일/데스크톱 스크린샷에서 하단바와 카드가 겹치지 않는다.
8. `node scripts/validate.js`가 통과한다.

## 15. 메인 세션 전달용 작업 지시

다음 내용을 메인 구현 세션에 전달하면 된다.

```text
다낭 가족여행 플랜북의 디자인 방향은 "가족 여행 현장용 의사결정 플랜북"으로 잡는다.

우선 작업:
1. styles.css의 .bottom-nav를 repeat(4, 1fr)로 수정한다.
2. 첫 화면을 긴 설명형 Hero가 아니라 compact trip header + next decision card + 출발 전/오늘 카드로 재구성한다.
3. UI 상태 라벨을 확정/추천/조건부/대안 4종으로 정리한다.
4. 장소 카드는 이름, 상태, 추천 시간, 이동 부담, 아이 적합성, 주의 조건, 지도/상세 액션만 먼저 보이게 압축한다.
5. 후기 정보는 독립적으로 읽히는 탭보다 장소 카드/상세의 판단 근거로 통합한다.
6. 준비 탭은 이동/예산/쇼핑/준비물/긴급을 섹션 점프 또는 아코디언으로 정리하고, 남은 확인 항목을 상단에 요약한다.

검수 기준:
- 390px 모바일에서 하단 내비게이션이 한 줄 4칸으로 보여야 한다.
- 첫 화면 844px 높이 안에서 여행명, 날짜, 다음 결정, 출발 전/오늘 카드 일부가 보여야 한다.
- 주요 액션 버튼은 40px 이상 높이를 유지한다.
- 카드 안 텍스트가 3줄 이상 길게 이어지면 상세 시트로 이동한다.
- 데스크톱 720px 이상에서는 정보가 지나치게 세로로만 늘어나지 않도록 2컬럼 보드를 적용한다.
```

## 16. 메인 세션용 구현 프롬프트

아래 프롬프트를 메인 구현 세션에 그대로 전달할 수 있다.

```text
DESIGN_HANDOFF.md를 기준으로 다낭 가족여행 플랜북 UI를 개선해줘.

목표:
- 여행 리포트형 화면이 아니라 가족 여행 현장용 의사결정 플랜북으로 만든다.
- 모바일 390 x 844 Safari/WebKit 기준으로 첫 화면에서 여행명, 다음 결정, 출발 전/오늘 카드가 보여야 한다.
- 다른 세션의 작업물이나 서버 프로세스에는 영향을 주지 말고, 기존 정적 HTML/CSS/JS 구조 안에서 구현한다.

우선순위:
1. bottom-nav 4열 버그와 콘텐츠 덮임을 고친다.
2. 현재 첫 탭을 "오늘" 중심으로 재구성하거나, 일정 탭 첫 섹션을 오늘/출발 전 중심으로 바꾼다.
3. Header를 compact하게 줄이고 긴 설명은 제거한다.
4. 상태 라벨을 확정/추천/조건부/대안 중심으로 매핑한다.
5. 장소 카드는 비교성과 현장 액션 중심으로 압축한다.
6. 후기 탭은 가능하면 장소 상세/카드의 판단 근거로 통합한다.
7. 데스크톱에서는 2컬럼 운영 보드 레이아웃을 적용한다.

검수:
- Playwright WebKit 모바일 390 x 844와 데스크톱 1280 x 900에서 스크린샷을 확인한다.
- 하단 내비게이션, bottom sheet, 카드 텍스트가 겹치지 않아야 한다.
- node scripts/validate.js를 실행해 데이터 참조가 깨지지 않았는지 확인한다.
```

## 17. WebKit 검수 메모

Safari 계열 렌더링 확인을 위해 Playwright 전용 WebKit을 설치한 뒤 `http://127.0.0.1:4175/`를 확인했다. 실제 Safari 앱은 열지 않았고, 서버 프로세스와 다른 세션 작업은 변경하지 않았다.

확인 환경:

- Browser: Playwright WebKit 26.4
- Mobile viewport: `390 x 844`
- Desktop viewport: `1280 x 900`
- Mobile screenshot: `.playwright-cli/page-2026-05-09T05-40-52-598Z.png`
- Desktop screenshot: `.playwright-cli/page-2026-05-09T05-41-05-109Z.png`

실제 확인된 문제:

- 모바일에서 하단 내비게이션이 4개 버튼인데 3열 그리드로 렌더링되어 `준비` 버튼이 두 번째 줄로 밀린다.
- 하단 고정 내비게이션이 본문 카드 위를 덮는다. 모바일 첫 화면에서는 `판단 기준` 카드 하단을 가리고, 데스크톱에서도 `숙소 타임라인` 영역을 덮는다.
- 첫 화면에서 여행 설명, 요약 카드, 상단 탭, 판단 기준 카드가 모두 노출되어 핵심 액션이 늦게 나온다.
- 데스크톱에서도 콘텐츠 최대폭만 넓어질 뿐 정보 구조가 모바일 세로 흐름 그대로라 넓은 화면의 장점이 거의 없다.

검수 후 브라우저 세션은 종료했다.
