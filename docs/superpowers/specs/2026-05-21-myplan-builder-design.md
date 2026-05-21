# 내 일정 빌더 (후보카드 선택 → 일정 조립) 설계

- 작성일: 2026-05-21
- 대상 저장소: `rusher2020/danang-trip` (배포: https://rusher2020.github.io/danang-trip/)
- 대상 파일: `index.html` (단일 파일, ~3,600줄)
- 선행 상태: 하얏트 프로그램 탭/카드 추가 + 모바일 개요패널 기본 열림 커밋 완료(`665300d`)

## 1. 배경 및 목표

현재 후보 카드(108장+, 카테고리 1~10)는 **정보 카탈로그 전용**이다. 클릭하면 상세뷰(`showCardDetail`)가 열릴 뿐, 선택해서 일정에 반영하는 기능은 없다. 일정은 사전 제작된 5개 프리셋 플랜(A~E, `PLANS`/`ITINERARIES`)을 탭으로 전환하는 구조이며, 후보 카드와 직접 연결돼 있지 않다.

**목표**: 후보 카드를 골라 **날짜 + 시각**으로 담아 사용자만의 일정을 조립하는 기능을 추가한다. 프리셋 플랜을 복사해 시작점으로 삼고, 카드를 추가/편집/삭제한다. 결과는 6번째 플랜 **📝 내 일정**으로 표시되며 기존 타임라인/지도 렌더링을 그대로 재사용한다. 저장·공유는 localStorage + URL 해시(준비물 탭과 동일 패턴).

## 2. 원칙

- **기존 코드 재사용 최대화**: myPlan을 기존 `ITINERARY` 배열 형태로 변환해 `renderTimeline`/`renderMap`을 그대로 사용. 새 렌더링 코드 최소화.
- **프리셋 불변**: `ITINERARIES`(A~E)는 절대 수정하지 않는다. 내 일정은 별도 객체.
- **카드는 참조**: 내 일정의 카드 항목은 `cardId`로 원본(이름·요약·coords)을 참조하고, 사용자가 지정한 시각/메모만 따로 저장.
- **저장·복원·공유**: 준비물 탭의 localStorage + URL 해시 백업 패턴(`_encodePrep`/`_decodePrep`)을 재사용한다.
- **YAGNI**: 부부 투표·동시편집, 드래그앤드롭, 다중 내일정은 제외.

## 3. 사용자가 내린 핵심 결정 (브레인스토밍 2026-05-21)

| 질문 | 결정 |
|---|---|
| 선택의 의미 | **일정 조립** (날짜에 담기) — 단순 마킹/하이브리드 아님 |
| 프리셋과의 관계 | **프리셋 복사 후 편집** — A~E는 참고용 유지, 복사본을 편집 |
| 배치 정밀도 | **시간대 지정** — 날짜 + 구체 시각, 시간순 자동 정렬 |

## 4. 데이터 모델

localStorage 키: `danang-myplan`. URL 해시 백업: 준비물과 동일 방식.

```js
myPlan = {
  basedOn: "A",                 // 복사 시작 프리셋 (참고 표시용)
  createdAt: "2026-05-21",
  days: {
    "7/24": [ item, ... ],      // key = ITINERARIES의 day 문자열과 동일
    "7/25": [ ... ],
    ...
  }
}

// item (두 종류, source로 구분)
preset 항목: { uid, source:"preset", time, icon, title, tag, desc, place? }
card  항목: { uid, source:"card", time, cardId:"3.2", note? }
```

- `uid`: 항목 고유 id(삭제·이동·시간변경 대상 식별). 예: `crypto.randomUUID()` 또는 `m${Date.now()}${rand}`.
- day 키는 `ITINERARIES[plan][n].day` 문자열(`'7/24'` 등)과 동일하게 맞춰 변환을 단순화.
- `time`은 문자열(`'14:00'`, `'09:00 전후'` 허용). 정렬은 앞 `HH:MM` 파싱, 파싱 불가/빈값은 맨 뒤.
- 내 일정 생성 시 `basedOn` 프리셋의 `ITINERARIES[basedOn]`를 깊은 복사하여 각 day의 items를 `source:"preset"` 항목으로 채운다(원본 필드 보존 + `uid` 부여).

## 5. 사용자 흐름

1. **생성**: 플랜 바(`renderPlanTabs`)에 항상 **📝 내 일정** 탭 노출. myPlan이 없으면 클릭 시 "어느 프리셋을 복사할까요?" 선택(A~E) → 복사 생성 후 내 일정 활성화. 있으면 바로 전환.
2. **담기**: 후보 카드 상세뷰(`showCardDetail`)의 `detail-actions`에 **📅 내 일정에 담기** 버튼 추가 → `openAddToPlanPicker(card)` 호출 → 날짜(7/24~7/29) 선택 + 시각 입력(간단 인풋) → 해당 day에 `source:"card"` 항목 추가 후 시간 정렬 → 저장. (myPlan 없으면 먼저 생성 유도.)
3. **편집**: 내 일정 타임라인에서 각 항목에 **시간 변경 / 삭제 / 날짜 이동** 컨트롤 노출. `source:"card"` 항목엔 "내가 추가" 뱃지. 프리셋 복사 항목도 삭제·시간변경 가능(복사본이므로 안전).
4. **저장·공유**: 변경 즉시 `saveMyPlan()`(localStorage) + URL 해시 인코딩. 링크 공유 시 `decodeMyPlan()`으로 복원.
5. **초기화**: "내 일정 비우기/다시 만들기" 버튼(확인 후 삭제).

## 6. 구성요소 (단일 index.html 내, 기존 패턴 따름)

| 단위 | 역할 | 비고 |
|---|---|---|
| `myPlan` 상태 + `loadMyPlan/saveMyPlan/encodeMyPlan/decodeMyPlan` | 저장·복원·공유 | `_encodePrep`/`_decodePrep`(준비물) 패턴 재사용 |
| `createMyPlanFrom(presetKey)` | 프리셋 깊은 복사 → myPlan 생성 | `ITINERARIES[presetKey]` 불변 보장 |
| `myPlanToItinerary(myPlan)` | myPlan → 기존 타임라인 배열로 변환 | card 항목은 `cardById`로 이름/coords/desc 채움. `renderTimeline`/`renderMap` 그대로 사용 |
| `addCardToMyPlan(cardId, day, time)` | 항목 추가 + 정렬 + 저장 | myPlan 없으면 생성 유도 |
| `editMyPlanItem(uid, ...)` / `removeMyPlanItem(uid)` / `moveMyPlanItem(uid, newDay)` | 편집 | 변경 후 재정렬·저장·리렌더 |
| `openAddToPlanPicker(card)` | 날짜+시각 선택 UI | 경량 인라인 패널/시트 |
| 플랜 탭 훅 | `renderPlanTabs`에 "📝 내 일정" 추가 + 생성 분기 | `activePlan === 'my'`일 때 `ITINERARY = myPlanToItinerary(myPlan)` |
| 타임라인 편집 컨트롤 | 내 일정 모드일 때만 항목별 편집 버튼 표시 | `renderTimeline`에 분기 추가 |

### 코드 연결 지점 (현 index.html 기준, 라인은 근사치)
- `PLANS`(1569~) / `ITINERARIES`(1620~) / `let activePlan='A'`(1548) / `let ITINERARY=ITINERARIES[activePlan]`(1910)
- `renderPlanTabs()` (플랜 탭 렌더, ~3245; `Object.entries(PLANS).map` ~3249) — "내 일정" 항목 추가
- 플랜 탭 클릭 핸들러(~3259~3261: `activePlan = el.dataset.plan; ITINERARY = ITINERARIES[activePlan]`) — `'my'` 분기 추가
- `renderTimeline`(2911~) / `renderMap`(3013~) — 변환된 배열로 동작(구조 동일하면 수정 최소). 편집 컨트롤만 조건부 추가
- `showCardDetail`(3282~) `detail-actions`(3304~) — "내 일정에 담기" 버튼 추가
- 준비물 저장 패턴: `_encodePrep`/`_decodePrep`(~2515) 참고
- `cardById` 헬퍼 필요 시: `CANDIDATE_DATA.cards`로 map 생성

## 7. 엣지 케이스 / 에러 처리

- myPlan 미생성 상태에서 "담기" → 먼저 생성(프리셋 선택) 유도, 취소 시 아무 동작 안 함.
- 카드에 `coords` 없음 → 지도 핀 생략, 타임라인엔 표시(현 `renderMap`이 place/coords 없는 항목을 건너뛰는지 확인 후 가드).
- 시각 미입력/형식 불일치 → 해당 항목 day 맨 뒤로 정렬(크래시 금지).
- localStorage 차단(사파리 ITP 등) → URL 해시 백업으로 복원(준비물과 동일).
- 같은 카드 중복 담기 허용(여러 날 가능). 중복 시 경고만 띄울지는 구현 시 결정(기본: 허용).
- 삭제/초기화는 확인 후 실행.

## 8. 테스트 / 검증 (헤드리스 playwright)

환경: playwright 1.60 npx 캐시 + chromium 직접 지정(아래 RESUMING.md 참조).

시나리오:
1. "내 일정" 생성(프리셋 A 복사) → 플랜 탭에 노출, 타임라인이 A 복사본으로 렌더
2. 후보 카드 상세 → "내 일정에 담기" → 7/26 14:00 추가 → 7/26 타임라인에 시간순 삽입 확인
3. 항목 삭제 / 시간 변경 / 날짜 이동 동작
4. 새로고침 후 localStorage 복원, URL 해시로도 복원
5. 지도: 담긴 카드(coords 有)가 핀으로 표시
6. JS 에러 0, 기존 5개 프리셋·다른 탭 정상

## 9. YAGNI (이번 범위 제외)

- 부부 투표/실시간 동시편집
- 드래그앤드롭 재정렬(시간 변경 + 위/아래 버튼으로 충분)
- 여러 개의 내 일정(슬롯 1개만)
- 카드 항목에 사진/리치 상세를 타임라인에 인라인(상세는 카드 상세뷰로)

## 10. 검증 도구 메모 (이 작업 환경)

헤드리스 렌더: playwright 1.60(npx 캐시) + 캐시 chromium 직접 지정.
`docs/RESUMING.md`의 "헤드리스 렌더 도구" 항목 참조(경로 포함). 로컬 서버: `python3 -m http.server 4178 --bind 127.0.0.1`.
