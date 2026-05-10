# 세션 상태 저장

Updated: 2026-05-09

## 현재 상황

사용자는 다낭 가족여행을 위한 모바일 HTML 기반 플랜북을 원한다. 목적은 상업용 여행 에이전트가 아니라, 실제 가족여행 전후로 일정, 장소, 후기, 지도, 준비 정보를 한 번에 조회하고 참고하는 개인용 여행 계획 페이지다.

사용자는 이전 결과가 목업/UI 중심으로 흐르고 실제 여행 전문가 수준의 조사와 계획이 부족하다고 지적했다. 따라서 다음 작업의 우선순위는 디자인 확장보다 여행 리서치 품질, 일정 판단, 데이터 신뢰도 강화다.

## 여행 확정 정보

- 가족: 성인 2명, 아이 2명
- 아이: 초2 여아, 6세 남아
- 출국: 2026-07-24 금요일 23:00
- 귀국 입국: 2026-07-29 수요일 23:00
- 숙소:
  - 7/24 밤: New Orient Hotel Da Nang
  - 7/25 체크인 - 7/28 체크아웃: Hyatt Regency Danang Resort & Spa
  - 7/28 - 7/29: Happy Day Hotel Danang
- 페이지 방향:
  - 모바일 최적화
  - HTML/CSS/JS 정적 페이지
  - 나중에 GitHub Pages 배포
  - 커밋/배포는 마지막 단계

## 사용자 선호

- 답변은 한국어 우선.
- 짧은 주기로 계속 검증받을 필요 없음.
- 단순 목업보다 정확한 정보 검색과 데이터 기반 계획을 원함.
- 장소 카드에는 대표 이미지, 요약, 한국인 후기, 기타 정보가 필요.
- 일정은 타임라인식으로 확인 가능해야 함.
- 지도 정보가 필요하며, 나중에 Google API 연결 가능.
- 디자인은 나중에 별도 설계 가능하므로 현재는 구조와 콘텐츠 품질이 우선.

## 현재 프로젝트 상태

프로젝트 경로:

- `/Users/ijinhwan/danang-trip-plan`

주요 파일:

- `index.html`: 탭 기반 모바일 플랜북 구조
- `styles.css`: 모바일 중심 스타일
- `script.js`: JSON 데이터 로드 및 카드/일정/후기/준비 탭 렌더링
- `research-report.md`: 새로 만든 조사 리포트
- `danang-family-research-2026.md`: 2026 가족여행 심화 조사 리포트
- `expert-itinerary.md`: 기존 1차 플랜 문서
- `research-notes.md`: 기존 조사 메모
- `planning.md`: 초기 계획 문서
- `apis.md`: 추후 API 연결 후보

데이터 파일:

- `data/trip.json`
- `data/hotels.json`
- `data/days.json`
- `data/places.json`
- `data/scenarios.json`
- `data/korean-reviews.json`
- `data/map-points.json`
- `data/transport.json`
- `data/budget.json`
- `data/checklist.json`
- `data/packing.json`
- `data/emergency.json`
- `data/live-features.json`

## 최근 반영한 내용

- `research-report.md`를 새로 생성했다.
- `data/trip.json`을 "데이터 기반 후보 선택형" 방향으로 수정했다.
- `data/korean-reviews.json`을 한국어 후기 신호 중심으로 재작성했다.
- `data/scenarios.json`에서 바나힐을 7/27 월요일 배치로 정리하고, Pizza 4P's 중심 노출을 낮췄다.
- `data/places.json`에 Ăn Thôi, Madame Lân, Bếp Hên, Mì Quảng 1A, Morning Glory, Cargo Club, Lim Dining Room, Madam Kieu, MM Mega Market, Son Tra Night Market 후보를 보강했다.
- `data/korean-reviews.json`에 안토이, 마담란, 호이안 식당, 바나힐 아이 동반 조건 후기 신호를 추가했다.
- `data/transport.json`, `data/budget.json`을 한국어 중심으로 재작성했다.
- `data/places.json`의 주요 카드 문구를 한국어로 정리했다. 장소명/고유명사와 출처 URL을 제외하고 카드에 보이는 설명, 아이 포인트, 이동 메모, 주의사항, 결정 메모는 한국어로 맞췄다.
- `data/shopping.json`을 추가해 한시장/마트 쇼핑 품목별 운영표를 만들었다.
- `data/decisions.json`을 추가해 바나힐, 용다리, 호이안 저녁, 한시장 쇼핑, 현지식 피로도에 대한 진행/중단/대안 규칙을 만들었다.
- `data/map-routes.json`을 추가해 숙소 기준 Google Maps 동선 링크를 만들었다.
- `data/map-points.json`을 모든 장소 카드 id와 매칭되도록 보강했다.
- 바나힐, 호이안, 용다리, 오행산, 한시장, 손트라 야시장 등 주요 장소 카드에 Wikimedia Commons 대표 이미지를 보강했다.
- `FINAL_TRIP_PLAN.md`를 추가해 흩어진 리서치와 일정 판단을 하나의 최종 플랜 초안으로 통합했다.
- `index.html`, `script.js`, `styles.css`에 쇼핑 운영표, 당일 결정 보드, 숙소 기준 지도 동선, 전문가 요약 패널을 반영했다.
- 장소 카드는 우선 후보와 높은 우선순위가 먼저 보이도록 정렬한다.
- `script.js`는 현재 문법 검사 통과 상태다.
- 주요 JSON 파일도 `python3 -m json.tool` 기준 파싱 정상이다.

## 현재 핵심 일정 방향

### 7/24 금

- 23:00 한국 출국
- 관광 없음

### 7/25 토

- 새벽 다낭 도착 후 New Orient Hotel 이동
- 오전 수면 회복
- Hyatt 이동 및 체크인/짐 보관
- 오후/저녁은 하얏트 수영장, 해변, 쉬운 식사
- 용다리는 기본적으로 제외

### 7/26 일

- 오전 오행산은 컨디션 좋을 때만 짧게
- 낮에는 하얏트 수영장, 낮잠, Camp Hyatt
- 21:00 용다리 쇼는 아이 컨디션이 좋을 때만 선택

### 7/27 월

- 바나힐 후보일
- 전용차 왕복 권장
- 날씨가 나쁘면 취소/대체
- 저녁에는 하얏트 안에서 쉬운 식사

### 7/28 화

- 하얏트 체크아웃
- Happy Day Hotel로 이동 후 짐/샤워/낮잠/휴식
- 16:30 전후 호이안 이동
- 식사 먼저, 등불 산책/야시장 짧게, 20:30-21:00 복귀

### 7/29 수

- 한시장 또는 롯데마트
- 점심/카페/휴식
- Happy Day에서 샤워/짐 정리
- 공항 이동

## 검증된 공식 정보

- 하얏트 공식:
  - 가족 친화 시설, Camp Hyatt, Little Farm, The Arena, 수영장/해변, 키즈 메뉴
  - https://www.hyatt.com/hyatt-regency/en-US/danhr-hyatt-regency-danang-resort-and-spa/family-stay-and-activities
  - https://www.hyatt.com/hyatt-regency/en-US/danhr-hyatt-regency-danang-resort-and-spa/dining

- 용다리 공식:
  - 금/토/일/주요 공휴일 21:00 쇼
  - https://danangfantasticity.com/en/the-dragon-show

- 바나힐 공식:
  - 운영/티켓은 변동 가능. 구매 직전 공식 사이트 재확인 필요.
  - https://banahills.sunworld.vn/en
  - https://banahills.sunworld.vn/en/support

- 호이안 공식/관광 포털:
  - 올드타운, 야간 보행자 거리, 입장권 정보
  - https://danangfantasticity.com/en/see-and-do/hoi-an-ancient-town
  - https://danangfantasticity.com/en/discovery/hoi-an-ancient-town-entrance-tickets-2026

- 한시장 공식:
  - https://danangfantasticity.com/en/han-market

## 한국인 후기 신호

- 하얏트:
  - 수영장, 키즈클럽, 해변 접근성, 조식이 가족여행 장점으로 반복 언급됨.
  - 리조트가 시내 중심은 아니므로 외부 식사는 차량 이동 전제.

- 7월 다낭:
  - 한낮 더위가 강하므로 12:00-15:30 외부 활동을 줄이는 전략이 필요.

- 호이안:
  - 저녁 등불/야시장 코스는 좋지만, 아이 동반이면 식사를 먼저 하고 짧게 산책해야 함.
  - 에어컨/위생/아이 메뉴가 식당 선택 기준.

- 한시장:
  - 쇼핑 리스트가 있을 때 효율적.
  - 아이 동반이면 60-90분 제한 필요.

## 바로 다음 작업

1. 준비 탭 지도/동선 QA를 계속한다. 현재 `Map Routes`를 준비 탭 최상단으로 올렸고, Google Directions iframe이 첫 화면에 보이는 상태다.
2. 쇼핑/마켓 후보를 더 다듬는다. 현재 장소는 55곳, 쇼핑/마켓 선택지는 16곳이다.
3. Google Places 사진 매칭이 엉뚱한 장소로 붙는지 핵심 장소부터 QA한다.
4. 사용자가 만족하면 README/API 설정 문서 정리 후 커밋/배포 준비 단계로 이동한다.

## 2026-05-10 추가 진행 상태

- Google API 연결:
  - `config.js` 로컬 전용 키 설정.
  - `.gitignore`에 `config.js` 추가.
  - `config.example.js` 추가.
  - `Places API (New)` 기반 사진 로드 확인.
  - 상세 sheet에 Google 장소 지도 embed 추가.
  - 준비 탭 지도 동선에 Google Directions embed 추가.
  - 키 제한은 사용자가 Google Console에서 `Maps JavaScript API`, `Maps Embed API`, `Places API`, `Places API (New)`만 허용하도록 저장함.

- UI/UX:
  - `가볼 곳` 탭은 가족 일정 묶음 기준으로 재구성.
  - `준비` 탭은 `숙소 기준 지도 동선`을 최상단으로 이동.
  - `일정` 탭은 날짜별 `오늘의 판단`과 `상황별 전환`을 추가.

- 컨텐츠:
  - 쇼핑/마켓 후보 확장: GO!/Big C, Vincom Plaza, Co.opmart, Maison Marou, K-Market, Langfarm 추가.
  - 쇼핑 운영 가이드 확장: 로컬 시장, 야시장, 대형마트 1곳 선택 원칙, 마지막 날 쇼핑 순서까지 포함해 20개 항목으로 보강.
  - `data/places.json`: 55곳.
  - `data/map-points.json`: 신규 쇼핑 장소 기준점 추가.

## 확인된 정상 상태

- `node --check script.js`: 통과
- `python3 -m json.tool data/trip.json`: 통과
- `python3 -m json.tool data/korean-reviews.json`: 통과
- `python3 -m json.tool data/scenarios.json`: 통과
- `python3 -m json.tool data/places.json`: 통과
- `python3 -m json.tool data/map-points.json`: 통과
- `python3 -m json.tool data/transport.json`: 통과
- `python3 -m json.tool data/budget.json`: 통과
- 장소 참조 무결성 검사: `data/days.json`, `data/scenarios.json`, `data/korean-reviews.json` 모두 통과
- `data/places.json` 주요 노출 필드 영문 잔여 검사: 고유명사/브랜드명 제외 통과
- `data/shopping.json`: 통과
- `data/decisions.json`: 통과
- `data/map-routes.json`: 통과
- 모든 `data/places.json` 장소가 `data/map-points.json` 기준점과 매칭됨
- `script.js`에 `data/shopping.json`, `renderShopping`, 장소 정렬 로직 반영 확인
- `script.js`에 `data/decisions.json`, `renderDecisions`, 결정 보드 장소 칩 반영 확인
- `script.js`에 `data/map-routes.json`, `renderMapRoutes`, 지도 동선 링크 반영 확인

## 2026-05-10 QA 루프 기록

- QA 1: `node --check script.js` 통과.
- QA 2: `node scripts/validate.js` 통과. `18 json files, 55 places`.
- QA 3: 쇼핑/마켓 장소 16곳, 쇼핑 가이드 16개, 지도 기준점 누락 0건 확인.
- QA 4: `?tab=places&set=shopping` 모바일 첫 화면 확인. 세트 버튼이 세로로 길어 쇼핑 진입이 늦는 문제 발견.
- QA 5: 장소 세트 버튼을 모바일 가로 스크롤 카드로 변경. 쇼핑 세트가 즉시 접근 가능해짐.
- QA 6: 쇼핑 전체 목록 full-page 캡처 확인. 일부 사진 미로드 시 큰 어두운 이미지 박스가 남는 문제 발견.
- QA 7: Google Places 세션 한도를 20으로 조정하고, 이미지 로드 실패 시 비주얼 슬롯을 제거하도록 수정.
- QA 8: 사진 로딩 완료 전에는 작은 정보형 비주얼로 보이게 조정. 큰 빈 그라디언트 박스 문제 완화.
- QA 9: 상세 sheet `?tab=places&place=han-market` 확인. 대표 이미지, 한국어 설명, 상세 지도 embed 정상.
- QA 10: 준비 탭 `?tab=prep` 확인. 숙소 기준 Google Directions 지도가 첫 화면에 노출됨.
- QA 11: 데스크톱 쇼핑 화면 확인. 6개 장소 세트, 필터, 쇼핑 카드 2열 배치 정상.
- QA 12: 쇼핑 운영 가이드 20개 항목으로 확장 후 `node scripts/validate.js` 재통과.
- QA 13: 준비 탭 재캡처. 지도 동선 첫 화면 노출 유지 확인.

캡처 파일:

- `output/playwright/qa02-shopping-set-compact.png`
- `output/playwright/qa03-places-default.png`
- `output/playwright/qa04-shopping-full.png`
- `output/playwright/qa05-prep-map-first.png`
- `output/playwright/qa06-schedule-mobile.png`
- `output/playwright/qa07-shopping-full-after-image-fix.png`
- `output/playwright/qa08-shopping-full-loaded-state.png`
- `output/playwright/qa09-place-sheet-map.png`
- `output/playwright/qa10-shopping-desktop.png`
- `output/playwright/qa11-place-sheet-map-full.png`
- `output/playwright/qa12-prep-map-repeat.png`
- `output/playwright/qa13-prep-after-shopping-guide.png`

## 2026-05-10 사용성 보강 기록

- `오늘` 탭에 `날짜별 바로 실행` 보드를 추가했다.
  - Day 0-5 날짜 버튼으로 그날 흐름을 바로 전환.
  - 그날의 판단 기준, 시간대별 실행 흐름, 관련 장소 칩을 함께 노출.
  - 그날과 연결된 지도 동선 링크를 함께 노출.
- 장소 상세 sheet에 `우리 일정에서 쓰는 법`을 추가했다.
  - 해당 장소가 어떤 날짜/시간 블록에 쓰이는지 바로 보이게 함.
- `준비` 탭 쇼핑 영역에 `가족 쇼핑 결론` 요약 카드를 추가했다.
  - 한시장 60분 또는 정찰제 마트 1곳.
  - 마트/한시장/초콜릿/피할 것 기준을 먼저 보여줌.
- 모바일 overflow 보정:
  - 오늘 탭 카드/그리드에 `min-width: 0`, `max-width: 100%` 적용.
  - 첫 화면 문구를 짧게 조정해 모바일에서 잘림 방지.

검증:

- `node --check script.js`: 통과.
- `node scripts/validate.js`: 통과.
- `output/playwright/improve-today-final-v2.png`: 오늘 탭 첫 화면 QA.
- `output/playwright/improve-sheet-itinerary-v2.png`: 장소 상세 일정 연결 QA.
- `output/playwright/improve-shopping-summary.png`: 쇼핑 실행표 QA.

## 2026-05-10 지도 우선 보기 배포 기록

- 공개 배포용 `config.public.js`에 Google Maps 제한 키를 연결했다.
  - 사용자가 Google Cloud에서 HTTP referrer 제한을 `https://rusher2020.github.io/danang-trip/*` 기준으로 설정했다고 확인함.
- `가볼 곳` 탭 상단에 `숙소 기준 지도` 카드를 추가했다.
  - 현재 장소 묶음/필터 기준으로 최대 18개 장소를 Google 지도에 표시.
  - 마커 클릭 시 장소 상세 sheet를 열도록 연결.
  - 하얏트, Happy Day, New Orient 숙소 지도 링크를 지도 아래 빠른 칩으로 노출.
- 배포:
  - commit `6dfa459` pushed to `rusher2020/danang-trip`.
  - GitHub Pages status `built` 확인.
  - 배포 URL: `https://rusher2020.github.io/danang-trip/`
- 원격 QA:
  - `output/playwright/github-pages-map-places-mobile.png`: `가볼 곳` 지도 마커 정상.
  - `output/playwright/github-pages-map-shopping-mobile.png`: `쇼핑만` 지도 마커 정상.

## 2026-05-10 항공/숙소/커피/식사 보강 기록

- 항공편 확정 정보 반영:
  - 출국 `ZE593` · 2026-07-24 20:35 출발 · 23:25 다낭 도착.
  - 귀국 `ZE594` · 2026-07-29 00:25 다낭 출발 · 06:55 인천 도착.
- 일정 구조 수정:
  - 7/28 밤 공항 이동이 필요하므로 7/29 현지 시내 일정 제거.
  - 시내 일정은 토요일 New Orient 체크아웃 후 Hyatt 이동 전, 그리고 7/28 Happy Day 대기 후 공항 전 구간으로 제한.
  - 호이안은 기본 플랜에서 제외 권장으로 낮춤.
- 숙소 탭 추가:
  - Happy Day는 확정 숙소가 아니라 재검토 후보로 표시.
  - HAIAN Riverfront, Avora, Val Soleil, Novotel, Courtyard by Marriott를 마지막 0.5박 대안으로 비교.
- 커피/음식점 보강:
  - 장소 수 55개에서 65개로 확장.
  - 카페 3개에서 9개, 음식점 16개에서 20개로 확장.
  - `커피`, `식사` 장소 세트 추가.
- 지도 모바일 보정:
  - 텍스트 마커를 제거하고 작은 색상 점 마커로 변경.
  - 숙소는 집 모양 마커로 항상 표시.
  - 지도 범례 추가.
- QA:
  - `output/playwright/hotel-tab-mobile.png`
  - `output/playwright/coffee-map-mobile.png`
  - `output/playwright/food-map-mobile.png`
  - `output/playwright/schedule-flight-fixed-mobile.png`
  - `output/playwright/today-flight-fixed-mobile.png`

## 주의할 점

- 사용자는 영어보다 한국어를 선호한다.
- 커밋/배포는 지금 하지 말고 마지막에 한다.
- 계속 진행 요청이 있으면 리서치와 데이터 품질 개선부터 이어간다.
- 사용자가 실망감을 표현했으므로, 다음 결과물은 "전문가 수준의 판단 근거"가 보여야 한다.
