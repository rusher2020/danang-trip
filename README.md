# 다낭 가족여행 모바일 대시보드

2026년 7월 24일-29일 다낭 가족여행을 위한 모바일 우선 정적 HTML 대시보드입니다. 성인 2명, 초2 여아, 6세 남아 기준으로 항공, 숙소, 일정, 장소 후보, 한국어 후기 신호, 이동, 예산, 쇼핑, 준비 정보를 현장에서 바로 쓰기 좋게 모읍니다.

## 현재 방향

- 확정 정보와 후보 정보를 분리합니다.
- 정보 기준일은 `2026-05-09`이며, 공식 출처를 우선하고 영업시간·요금·운영중단은 방문 직전 재확인 대상으로 표시합니다.
- 여행 가이드북보다 현장용 모바일 대시보드에 가깝게 설계합니다.
- TripIt/Wanderlog/Google My Maps/Notion/Apple Wallet류의 구조는 UI 레퍼런스로만 참고하고, 실제 데이터는 공식 출처와 검증 가능한 링크를 우선합니다.
- 장소는 화면에서는 `꼭 가볼 곳`, `날씨 보고`, `쉬운 일정`처럼 여행자가 바로 이해하는 표현으로 보여줍니다.
- 무작위 맛집 나열보다 가족 적합성, 7월 더위, 숙소 기준 동선, 한국어 후기 신호를 우선합니다.
- 페이지 첫 화면에서 여행 판단 기준을 바로 확인할 수 있게 구성했습니다.
- GitHub Pages 배포를 전제로 정적 파일만 사용합니다.

## 핵심 결론

- 7/25: 도착 회복 + 하얏트 적응.
- 7/26: 하얏트 중심, 오전 오행산/밤 용다리 선택.
- 7/27: 바나힐 날씨형 풀데이 후보.
- 7/28: Happy Day 휴식 후 호이안 저녁.
- 7/29: 한시장/마트, 시내 식사, 샤워, 공항 이동.

최종 플랜 문서는 [FINAL_TRIP_PLAN.md](FINAL_TRIP_PLAN.md)에 정리했습니다.

## Files
- `index.html`: Mobile planbook page
- `styles.css`: Mobile-first styling
- `script.js`: Card filtering and JSON loading
- `data/places.json`: Place card data
- `data/trip.json`: Fixed trip profile and decision criteria
- `data/hotels.json`: Confirmed hotel flow
- `data/hyatt-programs.json`: Hyatt internal kids/adult/facility program board
- `data/days.json`: Day-by-day draft plan
- `data/scenarios.json`: Candidate itinerary scenarios
- `data/decisions.json`: 당일 진행/중단/대안 결정 보드
- `data/checklist.json`: Information still needed from the traveler
- `data/live-features.json`: Live-data roadmap for future travel info
- `data/korean-reviews.json`: Korean review signals and source links
- `data/airline-info.json`: Eastar Jet flight, check-in, baggage, restricted-item checklist
- `data/transport.json`: Family transport strategy
- `data/map-routes.json`: Google Maps route links by hotel/day
- `data/budget.json`: Budget decision board
- `data/shopping.json`: Han Market and mart shopping guide
- `data/packing.json`: Family packing list
- `data/emergency.json`: Important local notes and missing emergency info
- `FINAL_TRIP_PLAN.md`: Consolidated trip plan
- `danang-family-research-2026.md`: Deep research notes
- `research-matrix.md`: Candidate selection matrix
- `planning.md`: Trip planning direction
- `questions.md`: Information needed from the traveler
- `apis.md`: Optional future API plan

## Local Preview
Run a local server from this directory:

```bash
python3 -m http.server 4177 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:4177
```

## Validation

Run the local validation script before committing:

```bash
node scripts/validate.js
```

It checks JSON parsing, duplicate/missing place ids, referenced place ids in itinerary/review/decision data, and `script.js` syntax.

## GitHub Pages
This project is static and can be deployed from the repository root.

Recommended Pages settings:
- Source: Deploy from a branch
- Branch: `main`
- Folder: `/root`

Do not commit API keys. Live-data integrations should use API-free links first or a backend/proxy if secrets are required.
