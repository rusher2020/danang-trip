# 🌴 다낭 가족여행 · 2026.07.24-29

부부(43·41) + 딸 9세 + 아들 6세 · 5박 6일

✈️ ZE593 인천 → 다낭 (7/24 20:35 → 23:25)
✈️ ZE594 다낭 → 인천 (7/29 00:25 → 06:55)
🏨 New Orient(7/24) → Hyatt Regency(7/25-28) → Happy Day(7/28 데이유즈)

---

## 🌐 라이브 사이트 (모바일 추천)

### 👉 [일정·지도 페이지 열기](https://rusher2020.github.io/danang-trip/)

좌측 메뉴(개요·항공·숙소·하얏트 프로그램·응급·기본정보·한↔베)
중앙 모드 바: **일정 · 시간표 · 후보 카드 · 준비물**
날짜 탭(7/24~29) · 한 줄 타임라인 · 날씨 카드 · Leaflet 지도(핀+이동시간)

---

## 🎯 일정 요약

**7/24 (금)** ✈️ 20:35 출국 → 23:25 다낭 도착 → New Orient 1박
**7/25 (토)** 시내 짧게 + Hyatt 이동·적응
**7/26 (일)** Hyatt 풀데이 (수영장 + Camp Hyatt) + 오행산 옵션
**7/27 (월)** 🎡 바나힐 풀데이 (주말 혼잡 피해 월요일 배치)
**7/28 (화)** Hyatt 체크아웃 → 시내 정리 → Happy Day 휴식 → 21:30 공항
**7/29 (수)** ✈️ 00:25 출국 → 06:55 인천

⛔ **호이안 패스** (시간 부족, 7/28 일정 무리)

---

## 📱 가족 공유 링크

```
https://rusher2020.github.io/danang-trip/
```

---

## 🛠️ (개발자용)

단일 파일 사이트. 일정 작업은 `index.html` 상단의 **3개 객체**만 수정하면 됨:

| 객체 | 내용 |
|---|---|
| `PLACES` | 장소 좌표·태그·이미지 |
| `ITINERARIES` | 5개 플랜(A~E)의 6일 일정 |
| `TRAVEL_TIMES` | 거점 간 이동시간 |

### 가끔 손대는 객체
| 객체 | 내용 |
|---|---|
| `WEATHER` | 일별 날씨 (출국 1주일 전 갱신) |
| `TRAVEL_COST` | 거점 간 비용 (그랩·단독차량) |
| `PLANS` | 플랜 메타정보(이름·요약) |
| `PREP_DATA` | 준비물 체크리스트 |

### 거의 안 손대는 객체 (set-and-forget)
| 객체 | 비고 |
|---|---|
| `CANDIDATE_DATA` | 후보 풀 107장 (확정됨) |
| `ROUTES_CACHE` | OSRM 도로 경로 — 거점 추가 시에만 재생성 |
| `DAY_COLORS` | 날짜별 색상 토큰 |

### 로컬 미리보기
```bash
python -m http.server 4177 --bind 127.0.0.1
# http://127.0.0.1:4177/
```

### 문서
- 설계 스펙: [`docs/superpowers/specs/2026-05-12-danang-trip-rebuild-design.md`](docs/superpowers/specs/2026-05-12-danang-trip-rebuild-design.md)
- 구현 계획: [`docs/superpowers/plans/2026-05-12-danang-trip-rebuild.md`](docs/superpowers/plans/2026-05-12-danang-trip-rebuild.md)
- 리서치 자료: [`docs/research/`](docs/research/)
- 최종 플랜: [`docs/plan/FINAL_TRIP_PLAN.md`](docs/plan/FINAL_TRIP_PLAN.md)
- 구버전 v1 백업: [`archive/v1/`](archive/v1/)

### GitHub Pages
- Source: `main` 브랜치 root
- 자동 배포

### 레퍼런스
디자인·구조 베이스: [first6/family-trip-2605](https://github.com/first6/family-trip-2605) (감사합니다 🙏)
