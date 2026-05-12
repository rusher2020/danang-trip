# 다른 로컬 환경에서 세션 이어가기

작업이 진행되는 머신을 옮기거나, 새 Claude Code 세션에서 이어 작업할 때 따라할 절차.

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
