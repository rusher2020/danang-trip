# 다낭 가족여행 사이트 리빌드 설계

- 작성일: 2026-05-12
- 대상 저장소: `rusher2020/danang-trip`
- 작업 경로: `D:\2026\4.개인\danang-trip`
- 레퍼런스: `first6/family-trip-2605`

## 1. 배경 및 목표

현재 `danang-trip`은 5탭 모바일 대시보드(오늘/일정/숙소/가볼곳/준비) + JSON 18개 분산 + script.js 2,103줄로 구성돼 있고, 루트에 작업 부산물 MD가 다수 누적돼 있다. 레퍼런스 `family-trip-2605`는 단일 HTML 파일에 LNB+메인 2분할, 4개 모드(일정/시간표/후보/준비), Leaflet 지도 인라인이라는 명확하고 깔끔한 구조를 가진다.

**목표**: 레퍼런스의 골격·디자인·인터랙션을 100% 이식하고, 내용은 본인의 7/24~29 다낭 가족여행 일정으로 치환한다. 기존에 축적한 리서치/데이터(하얏트 프로그램·항공·한국어 후기·응급정보 등)는 +α로 흡수한다.

## 2. 원칙

- **레퍼런스가 베이스**: 레이아웃·디자인 토큰·인터랙션·데이터 구조 모두 차용
- **내 일정이 메인**: 7/24~29, 하얏트→Happy Day 동선, 가족 구성(성인 2 + 초2여 + 6세남), 7월 다낭 기준
- **기존 리서치는 +α**: 폐기 아닌 흡수. 사이트엔 LNB/후보/준비 영역으로 통합
- **단일 파일**: `index.html` 하나에 PLACES/ITINERARY/TRAVEL_TIMES inline (레퍼런스 패턴)
- **추가 의존성**: Leaflet CDN 한 개만
- **YAGNI**: 현재 사이트의 '오늘 자동 판단' 로직, fallback-list, 5탭 컨셉 폐기

## 3. 결과물 구조

```
/
  index.html                # 단일 파일 사이트 (PLACES/ITINERARY/TRAVEL_TIMES inline)
  README.md                 # 카톡 공유용 일정 요약 + 라이브 링크 중심
  assets/img/               # 장소 사진
  archive/
    v1/                     # 기존 index.html, script.js, styles.css 백업
    design-notes/           # DESIGN_HANDOFF.md, DESIGN_QA_NOTES*.md, DESIGN_APP_TONE_REVISION.md,
                            # TRAVELER_FRIENDLY_REDESIGN.md, SESSION_STATE.md
  docs/
    research/               # research-*.md, danang-family-research-2026.md, expert-itinerary.md
    plan/                   # FINAL_TRIP_PLAN.md, planning.md, questions.md, apis.md
    superpowers/specs/      # 본 설계 문서
  data/                     # 기존 JSON 백업 (참조용)
```

## 4. 사이트 골격 (레퍼런스 100% 이식)

### 4.1 레이아웃
- 좌측 **LNB** (240px, 접기 가능 `▾` 버튼) + 우측 **메인**
- LNB 접힘 상태에서 메인 풀화면, 모바일에서 지도 풀화면 활용

### 4.2 LNB 섹션
1. 여행 개요 — 제목, 기간, 가족 구성
2. 항공 — Eastar Jet 편명·시간·수하물 (`data/airline-info.json` 흡수)
3. 숙소 — 하얏트(2박+) + Happy Day, 체크인/아웃, 하얏트 키즈/시설 프로그램 카드 (`data/hotels.json`, `data/hyatt-programs.json` 흡수)
4. 핵심 결론 — 7월 더위/우천 대응, 일정 판단 기준
5. 응급정보 — 영사관·병원·SOS (`data/emergency.json` 흡수)
6. 기본정보 — 비자/매너/환전/eSIM/교통 (레퍼런스 1-basics + prep-* 흡수)

### 4.3 메인 모드 바 (4개)
- **일정** (`mode-itinerary`): 날짜 탭(6일, 색상 토큰 `--d24~--d29`) + 한 줄 타임라인 + Leaflet 지도(핀번호 + 이동시간 + 동선)
- **시간표** (`mode-timetable`): 6일 × 시간대 그리드, 한눈에 보기
- **후보** (`mode-candidates`): 카테고리 바(자연·해변/사찰·문화/체험/카페·디저트/식당/야간·엔터/쇼핑·시장/숙소·스파/공항·라운지) + 카드 그리드 + 상세 뷰 + ✅/⏭️/❓ 마킹(로컬스토리지)
- **준비** (`mode-prep`): 체크리스트, 기본정보, 짐 체크리스트 (`data/packing.json` + `data/shopping.json` 흡수)

### 4.3.A 반응형 LNB 동작
- **데스크탑 (≥768px)**: LNB 240px 좌측 고정, 메인 가변. 토글 시 LNB 숨김 + 메인 풀폭
- **모바일 (<768px)**: LNB 기본 숨김. 햄버거(▾) 탭 시 좌측에서 슬라이드 오버레이로 등장 (반투명 backdrop). 메인은 항상 풀폭

### 4.4 디자인 토큰 (레퍼런스 차용)
```
--bg: #fafaf7
--panel: #ffffff
--ink: #1c1c1e
--ink-mute: #6b6b70
--line: #e8e6e0
--accent: #d4644a
--d24~--d29: 6일 색상 (레퍼런스 --d20~--d24 5색을 6색으로 확장)
폰트: Pretendard / Apple SD Gothic Neo / SF Pro Text
```

## 5. 데이터 모델 (inline 3객체)

### 5.1 PLACES
```js
const PLACES = {
  "hyatt": {
    name: "Hyatt Regency Danang",
    category: "stay",
    lat: 16.0173, lng: 108.2647,
    pinNumber: 1,
    images: ["assets/img/hyatt.jpg"],
    koreaReviewTag: "가족 / 키즈클럽 / 풀",
    seasonNote: "7월 우기 시작 — 실내 시설 비중↑",
    sourceUrls: [...]
  },
  ...
}
```
- 좌표 수집 방법: Google Maps 공유 URL의 `@lat,lng` 또는 `!3d{lat}!4d{lng}` 파라미터에서 파싱. 공식 사이트에 좌표가 있으면 우선. 정확도 ±50m 허용
- 좌표 검증: 모든 PLACES 입력 후 지도 핀 육안 확인 1회 (잘못된 위치 즉시 보정)
- 한국어 후기 태그는 `data/korean-reviews.json` 흡수

### 5.1.A 후보 풀 큐레이션 기준
다음 4개 중 **3개 이상** 충족 시 후보 풀에 채택:
- (a) 7월 우천 시 실내 대안 또는 우산·우비 OK 환경
- (b) 6세·9세 아이 입장·동선 OK (놀이/식사/관람 중 1)
- (c) 하얏트 또는 Happy Day 기준 편도 45분 이내
- (d) 한국어 후기 1건 이상 또는 공식 사이트 존재

탈락 항목은 폐기하지 않고 `seasonNote: "7월 부적합 — 사유"`로 표시만 하고 카드에 흐리게 표시(완전 제외 아님).

### 5.2 ITINERARY (6일)
```js
const ITINERARY = [
  {
    day: "7/24", weekday: "금", colorVar: "--d24", title: "도착·회복",
    blocks: [
      { time: "13:50", icon: "✈️", text: "다낭 도착 (ZE551)" },
      { time: "15:30", icon: "🏨", text: "하얏트 체크인", placeId: "hyatt" },
      ...
    ]
  },
  ...
]
```
- 6일치는 `data/days.json` + `FINAL_TRIP_PLAN.md` 기반

### 5.3 TRAVEL_TIMES
```js
const TRAVEL_TIMES = {
  "hyatt|hoian": { car: 35, note: "오후 정체 시 +15분" },
  "hyatt|marble": { car: 15 },
  "hyatt|airport": { car: 25 },
  ...
}
```

## 6. 데이터 매핑 표

| 영역 | 출처 (내 자산) | 흡수 (레퍼런스) |
|---|---|---|
| ITINERARY | `data/days.json`, `FINAL_TRIP_PLAN.md`, `expert-itinerary.md` | — |
| PLACES 좌표·기본 | `data/places.json` | — |
| PLACES 후보 풀 확장 | — | 4-candidates 1~9 카테고리 (7월 다낭 기준 큐레이션) |
| PLACES 한국어 후기 | `data/korean-reviews.json` | — |
| TRAVEL_TIMES | `data/map-routes.json`, `data/transport.json` | — |
| LNB 항공 | `data/airline-info.json` | — |
| LNB 숙소·키즈 | `data/hotels.json`, `data/hyatt-programs.json` | — |
| LNB 응급 | `data/emergency.json` | — |
| LNB 기본정보 | — | 1-basics (비자/매너/안전/환전), prep-esim, prep-transport, prep-hotels |
| 시간표 | `data/days.json` 재가공 | — |
| 후보 카테고리 정의 | — | 4-candidates 8+1 카테고리 구조 |
| 준비 — 짐 | `data/packing.json` | prep-* 보강 |
| 준비 — 쇼핑 | `data/shopping.json` | 3-food-shop 쇼핑·체험 |
| 음식 정체성 (후보/준비 보조) | — | 3-food-shop 맛집·카페·음식 |

## 7. 작업 단계

1. **베이스 이식**: 레퍼런스 `itinerary.html`을 `index.html`로 복사, 제목·meta·헤더 카피만 교체. 기능·CSS·JS 그대로
2. **루트 정리**: 기존 `index.html`/`script.js`/`styles.css` → `archive/v1/`. DESIGN_*/QA_*/SESSION_STATE → `archive/design-notes/`. 리서치 MD → `docs/research/`. 플랜 MD → `docs/plan/`
3. **ITINERARY 작성**: 7/24~29 6일, 시간 블록·아이콘·placeId
4. **PLACES 작성**: 좌표·이미지·태그·한국어 후기·시즌 노트
5. **TRAVEL_TIMES 작성**: 핵심 거점 매트릭스
6. **LNB 콘텐츠**: 6개 섹션 채우기
7. **후보 풀**: 8+1 카테고리에 7월 다낭 적합 장소 큐레이션, 상세 뷰·로컬스토리지 마킹
8. **시간표 탭**: 6일 × 시간대 그리드
9. **준비 탭**: 체크리스트·기본정보·짐·쇼핑
10. **README 재작성**: 카톡 공유용 일정 요약·라이브 링크·핵심 결론. 개발자 섹션은 맨 아래
11. **검증**: 모바일 뷰포트(iPhone 14 Pro 393px), 지도 핀, 탭 전환, LNB 토글, 로컬스토리지 마킹 동작

## 7-A. +α 추가 요소 (확정)

레퍼런스에 없는 보강 요소. 본 사이트의 차별적 가치.

### 7-A.1 날씨 카드 (7월 우기)
- 위치: LNB '핵심 결론' 아래 + 각 날짜 탭 상단
- 데이터: 정적 평년값(7월 다낭 평균 기온·강수확률·UV)을 코드에 inline, 출국 직전 수동 갱신
- 표시: 일별 강수확률·기온 high/low·UV·"실내 비중↑/야외 OK" 한 줄 판단
- 향후 확장: 출국 1주일 전 OpenWeatherMap 단발 fetch로 교체 가능 (현재는 미구현)

### 7-A.2 응급·원터치 행동 카드
- 위치: LNB 하단 '응급' 섹션
- 데이터: `data/emergency.json` 흡수 + 보강
- 항목: 한국 영사관(`tel:`+`maps:` 링크), 협력 병원, SOS 국제 / 분실 신고 절차(여권/카드) / 한국어 가능 약국
- UX: 각 항목 카드가 1탭으로 전화·지도 연결

### 7-A.3 사진 큐레이션
- 장소당 1~3장, `assets/img/` 하위 카테고리 폴더
- 출처: 공식 사이트, Unsplash, Pexels (저작권 OK만)
- 후보 카드 그리드에서 썸네일, 상세 뷰에서 캐러셀
- 파일명 규칙: `{place_id}-{n}.{ext}` (소문자, 케밥)
- **이미지 정책**:
  - 썸네일 600×400, 상세 1200×800 기준
  - WebP 우선, JPG 폴백 (`<picture>` 사용 또는 단일 WebP만)
  - 장소당 총 용량 ≤ 500KB
  - 전체 `assets/img/` ≤ 20MB (Pages·git clone 부담 한도)
  - 원본·임시 파일은 `assets/img/_raw/`에 두고 `.gitignore`

### 7-A.4 한↔베 즉시 표현 카드
- 위치: LNB '기본정보' 섹션 또는 별도 모드 추가는 안 함 → LNB에 콤팩트하게
- 항목 10~15개: 인사·감사·물·매워요·안 매워요·얼마예요·계산할게요·도와주세요·화장실·아이메뉴·얼음 빼고·아이스·핫·포장·맛있어요
- 표시: 한국어 / 베트남어 / 한글 발음 3열
- UX: 탭하면 큰 글씨로 확대 — 점원에게 화면 보여주기 용

## 8. Git 운영 및 단계별 커밋 (재배포 위생)

### 8.1 브랜치 전략
- 작업 브랜치: `v2-rebuild` (main에서 분기)
- main은 v1을 유지 — 작업 중에도 GitHub Pages 라이브 사이트 안 깨짐
- v2 완성·검증 후 main으로 머지하여 자동 재배포

### 8.2 신·구 코드 명확한 구분
- 첫 커밋에서 기존 자산을 즉시 분리:
  - 사이트 자산 → `archive/v1/`: `index.html`, `script.js`, `styles.css`, `config.example.js`, `config.public.js`, `scripts/`
  - 작업 부산물 → `archive/design-notes/`: `DESIGN_*.md`, `SESSION_STATE.md`, `TRAVELER_FRIENDLY_REDESIGN.md`
  - 리서치 → `docs/research/`: `research-*.md`, `danang-family-research-2026.md`, `apis.md`, `IMAGE_SOURCING.md`
  - 플랜 → `docs/plan/`: `FINAL_TRIP_PLAN.md`, `expert-itinerary.md`, `planning.md`, `questions.md`
  - 데이터 → `data/`는 우선 유지(참조용), v2가 안정되면 `archive/v1/data/`로 이동
- 신규 사이트 자산: 루트 `index.html` 단일 파일 + `assets/img/`

### 8.3 단계별 커밋 체크포인트
각 단계 끝에서 커밋 1개. 메시지 형식: `v2: <단계 요약>`.

1. `v2: archive v1 site and reorganize docs`
2. `v2: import base structure from reference (LNB + main + 4 modes, empty content)`
3. `v2: add ITINERARY for 2026-07-24~29 (6 days)`
4. `v2: add PLACES with coordinates and Korean review tags`
5. `v2: add TRAVEL_TIMES matrix`
6. `v2: fill LNB (flight, hotels, hyatt programs)`
7. `v2: add emergency one-tap cards`
8. `v2: add basics + KR-VN expression cards`
9. `v2: add candidates pool with 8+1 categories and detail view`
10. `v2: add timetable mode (6-day grid)`
11. `v2: add prep mode (checklist, packing, shopping)`
12. `v2: add weather cards (July rainy season averages)`
13. `v2: curate photos for places`
14. `v2: rewrite README for KakaoTalk sharing`
15. `v2: mobile QA pass and final cleanup`

### 8.4 .gitignore 보강
- `.DS_Store`, `Thumbs.db`, `*.log`, 임시 사진 폴더 `assets/img/_raw/`

### 8.5 재배포
- Pages 설정: main 브랜치 root 폴더 (현재 설정 유지)
- v2 머지 시 자동 재배포
- 머지 직전 체크: 로컬 `python3 -m http.server 4177`로 풀 QA

### 8.6 로컬스토리지 키 네임스페이스
- 키 prefix: `danang-trip-v2:`
- 항목:
  - `danang-trip-v2:candidate:{place_id}` = `"yes" | "skip" | "maybe"`
  - `danang-trip-v2:lnb` = `"open" | "closed"` (마지막 상태 기억)
- 마이그레이션 정책: v1 키와 충돌 없음(prefix 다름). 일정 또는 placeId 변경 시 별도 마이그레이션 없이 빈 상태에서 다시 시작

## 9. 안 하는 것 (YAGNI)

- 기존 5탭 대시보드 유지/병행
- '오늘' 자동 판단 로직
- script.js 2,103줄 부분 재활용
- JSON 18개 분산 구조 유지
- 빌드 도구·번들러 도입
- 백엔드·API 키 사용
- 레퍼런스에 없는 신규 UI 컴포넌트 (날씨/응급/사진/한베만 예외 — 7-A에 정의)
- .ics 캘린더, QR, 환율, 부모/아이 필터, PWA, 인쇄용 PDF (이번 라운드에서 제외)

## 9-A. 첫 진입 UX (1차 사용자 = 아내)

사이트 첫 사용자는 본인이 아닌 아내. 카톡 링크로 접속 시 시각적·정보적 우선순위:

- **초기 상태**: '일정' 모드 + 첫째날(7/24) 탭 활성. 모바일은 LNB 닫힘 + 햄버거 노출
- **첫 화면 위에서 아래로 보여야 할 것**:
  1. 여행 제목 + 기간 + 가족 구성 (1줄)
  2. 항공 카드 (출발 시각) — LNB 또는 첫 블록
  3. 첫날 타임라인 (도착~체크인)
  4. 지도 핀(공항·하얏트)
- **2탭 이내 도달 가능해야 할 정보**: 숙소 주소, 응급 연락처, 항공편 번호
- **검증**: 아내에게 링크 보내고 "지금 사이트 보고 이번 여행 알려줘봐" 부탁 — 1분 안에 핵심 4개(언제·어디서 자고·뭐 하고·돌아오는 비행기) 말할 수 있어야 통과

## 10. 검증 기준 (완료 정의)

- [ ] `index.html` 단독으로 모든 모드 동작 (로컬 `python3 -m http.server`)
- [ ] 6일 날짜 탭 모두 핀+동선 정상 렌더
- [ ] LNB 토글로 메인 풀화면 가능
- [ ] 모바일 393px에서 가로 스크롤 없음
- [ ] 후보 카드 ✅/⏭️/❓ 마킹이 로컬스토리지에 저장·복원
- [ ] 시간표 탭에서 6일 한눈에 표시
- [ ] README가 카톡에 바로 붙일 수 있는 일정 요약 포함
- [ ] 루트에 작업 부산물 MD 없음 (archive/docs로 이동 완료)

## 11. 작업량 추정

- 약 1.5~2일
- 큰 비중: 좌표 수집, 후보 풀 큐레이션, 이미지 정리
- 작은 비중: 베이스 이식, 루트 정리, README
