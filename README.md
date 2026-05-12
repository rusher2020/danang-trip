# Danang Trip Dashboard

> 2026.07.24 – 07.29 가족여행 현장용 모바일 대시보드
> 부부(43·41) · 딸 9세 · 아들 6세

---

## Quick Links

| 용도 | 링크 |
|---|---|
| 일정·지도 (가족 공유용 · 모바일) | <https://rusher2020.github.io/danang-trip/> |
| 전체 자료 (문서·리서치·구버전) | <https://github.com/rusher2020/danang-trip> |

---

## Trip at a Glance

```
INCHEON ──ZE593──> DANANG ──5박 6일──> DANANG ──ZE594──> INCHEON
 7/24 20:35       7/24 23:25                   7/29 00:25      7/29 06:55
```

```
[N] New Orient    7/24 밤 (도착 회복)
[H] Hyatt Regency 7/25 - 7/28 (메인 리조트, 3박)
[D] Happy Day     7/28 오후-밤 (데이유즈 · 공항 전 휴식)
```

---

## Itinerary Matrix

기본 안 = **Plan A 휴식**. 좌측 메뉴 "일정 안 선택"에서 B~E로 즉시 전환 가능.

| Day | A 휴식 (기본) | B 호이안 풀데이 | C 문화·사찰 | D 카페·트렌드 | E 균형 |
|---|---|---|---|---|---|
| 7/24 (금) | 도착 → New Orient | ← | ← | ← | ← |
| 7/25 (토) | 시내 짧게 → Hyatt | ← | ← | ← | ← |
| 7/26 (일) | Hyatt 풀데이 | ← | 오행산 + 린응사 | ← | 오행산 짧게 |
| 7/27 (월) | **호이안 등불 야경** | **호이안 풀데이** | 린응사·해변 | 시내 카페·헬리오 | 호이안 등불 |
| 7/28 (화) | 시내 → Happy Day → 공항 | ← | ← | ← | ← |
| 7/29 (수) | 출국 → 인천 | ← | ← | ← | ← |

⛔ **Skip**: 바나힐 (7월 안개·아이 피로) · 풀데이 호이안은 Plan B에서만

---

## Built-in Features

| 기능 | 상태 |
|---|---|
| 6일 타임라인 + 시간표 그리드 | ✓ |
| Leaflet 지도 + **OSRM 도로 라우팅** (직선 X) | ✓ |
| 후보 카드 107장 (9 카테고리) + 마킹(✅/⏭️/❓) | ✓ |
| 날씨 카드 (7월 우기 평년값) | ✓ |
| 응급 원터치 (전화·지도 1탭) | ✓ |
| 한↔베 즉시 표현 카드 (15개, 탭 확대) | ✓ |
| 준비물 체크리스트 (87개, 진행률) | ✓ |
| 모바일 LNB 오프캔버스 오버레이 | ✓ |

---

## 운영 (Edit Guide)

일정 작업은 `index.html` 상단의 **3개 객체**만:

| Tier 1 — 자주 손댐 | 내용 |
|---|---|
| `PLACES` | 장소 좌표·태그·이미지 |
| `ITINERARIES` | A~E 플랜의 6일 일정 |
| `TRAVEL_TIMES` | 거점 간 이동시간 |

| Tier 2 — 가끔 | 내용 |
|---|---|
| `WEATHER` · `TRAVEL_COST` · `PLANS` · `PREP_DATA` | 출국 전 갱신, 비용·플랜 메타 |

| Tier 3 — set-and-forget | 내용 |
|---|---|
| `CANDIDATE_DATA` · `ROUTES_CACHE` · `DAY_COLORS` | 후보 풀, OSRM 캐시, 색상 토큰 |

### Deploy
`main` 브랜치 root → GitHub Pages 자동 빌드.

---

## Repository Layout

```
.
├── index.html              # 단일 파일 사이트
├── README.md
├── archive/
│   ├── v1/                 # 구버전 5탭 대시보드
│   └── design-notes/       # 작업 부산물 MD
└── docs/
    ├── plan/               # FINAL_TRIP_PLAN, expert-itinerary
    ├── research/           # research-*, danang-family-research
    └── superpowers/
        ├── specs/          # 설계 스펙
        ├── plans/          # 구현 계획
        └── reviews/        # 코드 리뷰
```
