# 다른 로컬 환경에서 세션 이어가기

작업이 진행되는 머신을 옮기거나, 새 Claude Code 세션에서 이어 작업할 때 따라할 절차.

---

## 진행 중 체크포인트 (2026-05-21)

- **main**: 하얏트 프로그램 탭·후보카드 + 모바일 개요패널 기본 열림 커밋 완료(`665300d`), 그 위에 설계 스펙·plan 문서 커밋(`30b3b38`).
- **feature/myplan-builder**: 내 일정 빌더 구현 완료(아래 ✅ 참조). 7개 구현 커밋 + 최종 리뷰 보강 커밋. **main 머지·배포 대기 중**(working tree clean).
- **자료**: `hyatt-materials/` 에 하얏트 공식 PDF 4종(untracked, gitignore 아님 — 커밋할지 결정 필요).

### ✅ 완료: 하얏트 PDF → 후보카드 + 전용 상위 탭 (2026-05-21)

- 새 카테고리 `10 하얏트 프로그램`(⭐) + 카드 4장(10.1~10.4) 추가 → 후보 카드 카테고리 바에 노출, 클릭 시 상세(md 표) 정상.
- 새 상위 mode-tab `하얏트` 신설 → 키즈 프로그램(2) / 하얏트 프로그램(2)으로 묶어 md 본문 직접 렌더. detail-view 의존 없음.
- 검증(헤드리스 데스크톱+모바일): 카테고리 10·카드 4·표 렌더·상세뷰·JS 에러 0. 카드 총 107→111.
- 구현 위치: 데이터 push 블록(`CAT_BY_ID` 정의 직전), mode-bar 버튼, `.hyatt-section` + CSS(`Hyatt Mode` 블록), `renderHyatt()` + mode 전환 분기.
- 잔여(사소): 하얏트 카드의 "GitHub 원본" 링크는 `cat.file=""`이라 404 — PDF 출처라 무해, 추후 숨김 처리 가능.

### ✅ 완료: 내 일정 빌더 (후보카드 → 일정 조립) (2026-05-21)

- **스펙/계획**: `docs/superpowers/specs/2026-05-21-myplan-builder-design.md` / `docs/superpowers/plans/2026-05-21-myplan-builder.md`
- **구현 방식**: `superpowers:subagent-driven-development`로 Task 1~7 태스크별 실행(각 태스크 = implementer + 스펙리뷰 + 코드품질리뷰 2단계). 브랜치 `feature/myplan-builder`.
- **기능**: 6번째 플랜 탭 **📝 내 일정** — 프리셋(A~E) 깊은 복사로 시작 → 후보카드 상세뷰의 "📅 내 일정에 담기"로 날짜+시각 지정해 추가(시간순 자동 정렬) → 타임라인 항목별 편집(시간변경/날짜이동/삭제, "내가 추가" 뱃지) → "내 일정 비우기"로 초기화.
- **재사용**: `myPlanToItinerary()`가 myPlan을 기존 ITINERARY 배열 형태로 변환 → `renderTimeline`/`renderMap`/`renderAll` 그대로 사용. 프리셋 `ITINERARIES`(A~E)는 **불변**(깊은 복사).
- **영속성**: localStorage 키 `danang-myplan` + URL 해시 `mp=`(준비물 `p=`와 공존, 양쪽 대칭 보존). 공유 링크(`mp=` 포함)로 열면 내 일정 뷰 자동 활성화.
- **핵심 함수**(index.html, `renderPlanTabs` 정의 직전 "내 일정" 모듈): `myPlan` 상태 / `createMyPlanFrom` / `myPlanToItinerary` / `addCardToMyPlan` / `openAddToPlanPicker` / `removeMyPlanItem`·`setMyPlanItemTime`·`moveMyPlanItem` / `resetMyPlan` / `_encodeMyPlanToHash`·`_decodeMyPlanFromHash`. `cardById`, `TRIP_DAYS`.
- **재렌더 관용구**(전 CRUD 일관): `ITINERARY = myPlanToItinerary(); applyDayColors(ITINERARY); renderAll();` (applyDayColors 누락 시 colorHex/tint undefined로 색 깨짐 — 반드시 함께).
- **검증**: 헤드리스 playwright(데스크톱+모바일) — 생성/담기/정렬/편집/삭제/초기화/새로고침·공유링크 복원/카드 좌표 핀/프리셋 불변, JS 에러 0. 카드 태그 라벨(`담기`)·공유링크 자동활성화·날짜검증 피드백 포함.
- **잔여(사소)**: 날짜+시각 피커는 현재 `prompt` 기반(동작 우선) — 추후 인라인 시트로 개선 가능(스펙 §6 NOTE).

**(아래는 위 완료 작업의 원 설계 메모, 참고용)**

**확정 설계**:
1. 데이터: `index.html` 2548행 `const CANDIDATE_DATA = {...}`(단일 미니파이 라인) **직접 수정 금지**. 바로 다음 줄(2549 `CAT_BY_ID` 정의 전)에 push 블록 삽입:
   - 새 카테고리 `{id:"10", name:"하얏트 프로그램", icon:"⭐", color:"#2d2a55"}`
   - 카드 4장(cat "10", `group` 필드, `coords:[16.0245,108.2530]` Hyatt, image 생략→아이콘 폴백, `md`에 상세 표):
     - `10.1` Camp Hyatt 키즈 액티비티 (group:kids) — Kid Activities 주간표. 08:00–22:00, 4세 미만 보호자 동반, 일부 무료 1회/2시간·1일, Movie Night 19–21시, 베이비시팅 요청 가능, Camp Hyatt ext.8580
     - `10.2` 주니어 액티비티 6–15세 (group:kids) — Juniors 주간표. 가격: 25만동(Non La·티셔츠·토트백·랜턴·록아트), 60만동(보디보딩·머메이드), 150만동(키즈마사지·어드벤처캠프). ✦유료/✦✦F&B유료, Fitness ext.8570
     - `10.3` Distinctive Experiences (group:hyatt) — Sand & Sound Bath(35만동/18+/요청/Beach), Coconut Coffee Making(35만동/18+/15시/Terrasse Lounge), Le Petit Chef(264만동~/전연령/18–20시/Le Petit Chef Theater). Concierge ext.0
     - `10.4` 베트남 문화 탐험 (group:hyatt) — Discover/Create/Connect. 1일 2개 활동, 10:30–12 & 15:30–17. 그룹가: 2인 150만/3–4인 100만/5–10인 75만(인당, 2활동/1일). 요일별(월 Meditation/Pottery, 화 Non La/Blind Taste, 수 Massage/Mosaic, 목 Textured Art/Candle, 금 Clay/Hoi An Herbal Tea, 토 Sound Healing/Coconut Coffee, 일 Scalp Detox/Lantern). 24h 사전예약, Fitness ext.8570
2. 새 탭: mode-bar(1458–1466)에 `<button class="mode-tab" data-mode="hyatt">하얏트</button>` 추가. `<section class="hyatt-section"><div id="hyattWrap"></div></section>` 추가(candidates-section 옆).
3. CSS(676–700 영역): `.hyatt-section{display:none}` 기본 + `.main.mode-hyatt .hyatt-section{display:flex;flex-direction:column;overflow-y:auto}` + `.main.mode-hyatt .timeline-section,.candidates-section,.prep-section,.timetable-section{display:none}`. (hyatt-section은 기본 none이라 타 모드에선 자동 숨김)
4. JS: `renderHyatt()` 신설 — cat=="10" 카드를 group(kids/hyatt)으로 묶어 헤더(🧒 키즈 프로그램 / ✨ 하얏트 프로그램) + 각 카드 `marked.parse(card.md,{breaks:true,gfm:true})` 본문 렌더. mode 전환 JS(3487)의 배열에 `'hyatt'` 추가, 분기에 `else if(mode==='hyatt'){renderHyatt(); mapInfo 갱신;}` 추가. 지도 collapse는 건드리지 않음(버그 이력 회피).
5. 검증: 로컬 `python3 -m http.server 4178` + 헤드리스로 후보카드 cat10 노출 + 하얏트 탭 렌더 + JS 에러 0 확인.

**헤드리스 렌더 도구(이 환경)**: playwright 1.60 npx 캐시. `node` 스크립트에서 `import pkg from '/Users/ijinhwan/.npm/_npx/31e32ef8478fbf80/node_modules/playwright/index.js'; const {chromium}=pkg;` + `chromium.launch({executablePath:'/Users/ijinhwan/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell'})`.

---

## 마지막 체크포인트 (2026-05-12)

- **배포 상태**: main 브랜치 라이브 (`https://rusher2020.github.io/danang-trip/`)
- **마지막 커밋**: `ab1e4fd` (모바일 LNB 수정 + 가족 나이 39·39 수정)
- **확인된 동작**: 데스크탑·모바일 모두 정상 로드, 5 플랜 전환, OSRM 도로 라우팅, 후보 카드 107장
- **다음 작업 후보**:
  - 일정 세부 시간 확정 (호텔 응답·차량 확정 후)
  - 출국 1주일 전 WEATHER 실측값으로 갱신
  - 후보 ✅/⏭️ 마킹으로 부부 결정 사항 정리
  - 7/27 호이안 식당·시각 세부 확정

---

## 1. 코드 클론 (필수)

```bash
git clone git@github.com:rusher2020/danang-trip.git
cd danang-trip
```

HTTPS 버전:
```bash
git clone https://github.com/rusher2020/danang-trip.git
```

---

## 2. 프로젝트 컨텍스트 로드 (필수)

새 Claude Code 세션은 백지 상태입니다. 첫 메시지에 던지면 됩니다:

> "이 프로젝트 이어서 작업할 거야. `README.md`, `docs/superpowers/specs/`, `plans/`, `reviews/` 읽고 현재 상태 파악해줘."

문서 구조가 self-contained라 위 폴더만 읽으면 충분합니다.

| 위치 | 내용 |
|---|---|
| `README.md` | 프로젝트 요약·일정·운영 가이드 |
| `docs/superpowers/specs/` | 설계 의도 (왜 이런 구조인가) |
| `docs/superpowers/plans/` | 구현 단계 (무엇을 어떻게 만들었나) |
| `docs/superpowers/reviews/` | 코드 리뷰·수용/거부 판단 |
| `docs/research/` | 다낭·호텔·항공 리서치 자료 |
| `docs/plan/` | 최종 플랜·전문가 일정·기획서 |
| `index.html` | 현재 상태 자체 (단일 파일 사이트) |

---

## 3. 메모리·선호 이전 (선택)

Claude의 메모리는 머신 로컬입니다. 이어가려면 폴더 복사:

- 원본 위치 (Windows): `C:\Users\<유저>\.claude\projects\<프로젝트-키>\memory\`
- 새 머신의 같은 경로(OS별 동등 경로)에 복사

복사 안 해도 작업 가능 — 다만 "왜 이렇게 결정했는지"의 배경(예: 바나힐 패스, 호이안 야경 중심, 단일 플랜이 아닌 5플랜 채택 등)은 문서에서 자동으로 읽힙니다.

---

## 4. 권장 첫 메시지 템플릿

```
danang-trip 프로젝트 이어서 작업.
현재 v2 main 배포 완료 상태야.

README.md → docs/superpowers/specs/2026-05-12-* → docs/superpowers/reviews/2026-05-12-*
순으로 읽고 현재 상태 요약해줘.

그 다음 [구체적 작업]을 해줘.
```

이러면 새 세션이 ~5분 안에 따라잡습니다.

---

## 5. 자주 쓰는 명령

### 로컬 미리보기
```bash
python -m http.server 4177 --bind 127.0.0.1
# open http://127.0.0.1:4177/
```

### 작업 브랜치 (main 직접 수정 금지)
```bash
git checkout -b feature/<topic>
# ... edit index.html ...
git add index.html
git commit -m "<요약>"
```

### 배포 (PR 또는 직접 머지)
```bash
git checkout main
git merge feature/<topic>
git push origin main
# → GitHub Pages 1~3분 후 자동 재빌드
```

### 데이터 무결성 빠른 점검
```python
import re
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()
s = re.search(r'<script>(.*?)</script>\s*</body>', html, re.DOTALL).group(1)
for n, op, cl in [('{', '{', '}'), ('(', '(', ')'), ('[', '[', ']')]:
    d = s.count(op) - s.count(cl)
    print(f"{'OK' if d==0 else 'FAIL'}: {n} diff={d}")
```

---

## 6. 트러블슈팅

| 증상 | 원인 | 해결 |
|---|---|---|
| 페이지 안 뜸 | JS 크래시 | DevTools Console에서 첫 에러 확인 |
| 지도 마커 없음 | `PLACES[id].coords` 누락 | PLACES 객체 점검 |
| 후보 카드 클릭 무반응 | `card.coords` 없음 | CANDIDATE_DATA 카드 좌표 확인 |
| 도로 경로 직선으로 | 새 거점 페어가 `ROUTES_CACHE`에 없음 | OSRM 캐시 재생성 필요 |
| 모바일 LNB 깨짐 | breakpoint 일치 안 함 | CSS @media(768) ↔ JS isMobile(<=768) |

---

## 7. 핵심 객체 빠른 참조

`index.html` 상단의 **3개 객체**만으로 일정 작업 대부분 처리:

- `PLACES` — 장소 좌표·태그·이미지
- `ITINERARIES` — A~E 플랜의 6일 일정
- `TRAVEL_TIMES` — 거점 간 이동시간

자세한 편집 가이드는 [README.md](../README.md#운영-edit-guide) 참고.
