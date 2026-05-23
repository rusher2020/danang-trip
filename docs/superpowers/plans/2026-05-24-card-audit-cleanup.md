# 후보카드 감사 정리 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans 또는 superpowers:subagent-driven-development 로 task별 실행. 단계는 `- [ ]` 체크박스.
> 스펙: `docs/superpowers/specs/2026-05-24-card-audit-cleanup-design.md` (이 플랜과 함께 읽을 것)

**Goal:** 후보카드 풀의 중복·오분류·지도이탈핀 정리 + **레퍼런스(first6) 의존 완전 제거(독립성)**. 정적 103→**94**장(라이브 98).

**Architecture:** `index.html`의 minified `CANDIDATE_DATA`를 Python으로 parse→수정→dump(비대상 불변). 일정↔카드 링크는 `placeId`→`PLACE_TO_CARD`(≈2814행)→타임라인 `📄{cardId}`(≈3066행)로 연결되므로 **제거 전 placeId를 유지본으로 이전**. 제거 카드는 `archive/`에 보존(하드삭제 X). 검증은 헤드리스 playwright + 데이터 무결성 스크립트(이 프로젝트 표준; 단위테스트 프레임워크 없음).

**Tech Stack:** 단일 파일 HTML/JS, Python3(데이터 편집), playwright headless(검증).

**환경:** 헤드리스 = RESUMING.md "헤드리스 렌더 도구"(npx playwright + chrome-headless-shell). 로컬서버 `python3 -m http.server <port> --bind 127.0.0.1`.

**확정 사실(2026-05-24 감사):**
- 제거 9장: `7.23 5.33 5.34 4.23 4.22 1.14 1.19 3.17 3.8`
- placeId 이전 8건: 7.23→7.5(han-market) · 5.33→5.1(madame-lan-danang) · 5.34→5.8(morning-glory-hoian) · 4.23→4.2(xliii-coffee) · 4.22→4.10(wonderlust-coffee) · 1.14→6.2(love-bridge) · 1.19→7.7(hoi-an-night-market) · 3.17→6.1(dragon-bridge-show). (3.8은 placeId 없음)
- 유지+보강 3장: 6.1(용다리쇼) · 6.12(메모리스쇼, 3.8 병합) · 1.18(호이안올드타운, placeId=hoi-an-old-town 보유→제거불가)
- 9.1 인천공항 coords 제거
- first6 의존 9곳: image필드 1.1·1.3·1.4 / md인라인 1.1·1.3·1.4·1.7·1.8 / "GitHub 원본" 링크(index.html 3948·3967행)

---

### Task 1: 브랜치 + 기준 카운트

- [ ] **Step 1:**
```bash
cd /Users/ijinhwan/danang-trip-plan && git checkout main && git pull
git checkout -b fix/card-audit-cleanup
cp index.html /tmp/index.before_cleanup.html
```
- [ ] **Step 2:** 기준 검증(정적 103, first6 9, dup id 0)
```bash
python3 - <<'PY'
import re,json
from collections import Counter
h=open('index.html',encoding='utf-8').read()
d=json.loads(re.search(r'const CANDIDATE_DATA\s*=\s*(\{.*?\});',h,re.DOTALL).group(1))
print('cards',len(d['cards']),'| first6',h.count('first6'),'| dup ids',{k:v for k,v in Counter(c['id'] for c in d['cards']).items() if v>1})
PY
```
Expected: `cards 103 | first6 9 | dup ids {}`

---

### Task 2: 제거대상 archive 보존 + placeId 이전 (제거 전 필수)

**Files:** Create `archive/removed-cards-2026-05-24.json`; Modify `index.html`

- [ ] **Step 1:** 9장 archive 백업
```bash
python3 - <<'PY'
import re,json
d=json.loads(re.search(r'const CANDIDATE_DATA\s*=\s*(\{.*?\});',open('index.html',encoding='utf-8').read(),re.DOTALL).group(1))
rm={'7.23','5.33','5.34','4.23','4.22','1.14','1.19','3.17','3.8'}
json.dump([c for c in d['cards'] if c['id'] in rm],open('archive/removed-cards-2026-05-24.json','w'),ensure_ascii=False,indent=1)
print('archived',sum(1 for c in d['cards'] if c['id'] in rm))
PY
```
Expected: `archived 9`
- [ ] **Step 2:** placeId 8건 이전(thin→유지본). thin은 아직 제거 안 함(다음 태스크).
```bash
python3 - <<'PY'
import re,json
h=open('index.html',encoding='utf-8').read()
m=re.search(r'(const CANDIDATE_DATA\s*=\s*)(\{.*?\})(;)',h,re.DOTALL)
d=json.loads(m.group(2)); b={c['id']:c for c in d['cards']}
xfer={'7.5':('7.23','han-market'),'5.1':('5.33','madame-lan-danang'),'5.8':('5.34','morning-glory-hoian'),
      '4.2':('4.23','xliii-coffee'),'4.10':('4.22','wonderlust-coffee'),'6.2':('1.14','love-bridge'),
      '7.7':('1.19','hoi-an-night-market'),'6.1':('3.17','dragon-bridge-show')}
for keep,(thin,pid) in xfer.items():
    assert b[thin].get('placeId')==pid, f'{thin} placeId mismatch'
    b[keep]['placeId']=pid
    b[thin].pop('placeId',None)   # 이전 후 thin에서 제거(중복 매핑 방지)
h=h[:m.start()]+m.group(1)+json.dumps(d,ensure_ascii=False)+m.group(3)+h[m.end():]
open('index.html','w',encoding='utf-8').write(h)
print('placeId 이전 완료', len(xfer))
PY
```
Expected: `placeId 이전 완료 8`
- [ ] **Step 3:** 커밋 `git add archive index.html && git commit -m "chore(candidates): 제거대상 archive 보존 + placeId 유지본 이전"`

---

### Task 3: 보강 — 메모리스쇼(6.12←3.8) · 용다리쇼(6.1) · 호이안올드타운(1.18)

> 제거 전에 유지본 보강(내용 손실 방지). 6.2/7.5 등 8섹션 카드를 구조 템플릿으로. 날짜 7월·아이 딸7세/아들4세·숙소 New Orient/Hyatt/Vanda 기준.

- [ ] **Step 1:** 3.8·6.12 내용 출력 → 6.12에 3.8 고유정보(가격·후기·팁) 병합(parse→dump). 6.12를 표준 8섹션으로.
```bash
python3 -c "import re,json;b={c['id']:c for c in json.loads(re.search(r'const CANDIDATE_DATA\s*=\s*(\{.*?\});',open('index.html',encoding='utf-8').read(),re.DOTALL).group(1))['cards']};print('==3.8==');print(b['3.8']['md']);print('==6.12==');print(b['6.12']['md'])"
```
- [ ] **Step 2:** 6.1 용다리 불쇼(301자)를 8섹션 표준으로 보강. 토·일 21:00 불·물쇼, 명당=사랑의부두(6.2), 야간 아이 피로 주의, Hyatt/시내 이동.
- [ ] **Step 3:** 1.18 호이안 올드타운(180자)을 8섹션 표준으로 보강. (cat1 유지 또는 적절 카테고리; placeId=hoi-an-old-town 유지 필수 — 일정 ×3 링크)
- [ ] **Step 4(검증):** `python3 -c "..."`로 6.1·6.12·1.18 모두 1500자+ 확인.
- [ ] **Step 5:** 커밋 `git commit -am "feat(candidates): 메모리스쇼·용다리쇼·호이안올드타운 보강"`

---

### Task 4: 중복 9장 제거 + 9.1 좌표 제거

**Files:** Modify `index.html`

- [ ] **Step 1:**
```bash
python3 - <<'PY'
import re,json
h=open('index.html',encoding='utf-8').read()
m=re.search(r'(const CANDIDATE_DATA\s*=\s*)(\{.*?\})(;)',h,re.DOTALL)
d=json.loads(m.group(2))
rm={'7.23','5.33','5.34','4.23','4.22','1.14','1.19','3.17','3.8'}
d['cards']=[c for c in d['cards'] if c['id'] not in rm]
for c in d['cards']:
    if c['id']=='9.1': c.pop('coords',None)
h=h[:m.start()]+m.group(1)+json.dumps(d,ensure_ascii=False)+m.group(3)+h[m.end():]
open('index.html','w',encoding='utf-8').write(h)
print('cards now',len(d['cards']))
PY
```
Expected: `cards now 94`
- [ ] **Step 2:** 무결성 + placeId 링크 보존 확인
```bash
python3 - <<'PY'
import re,json
h=open('index.html',encoding='utf-8').read()
s=re.search(r'<script>(.*?)</script>\s*</body>',h,re.DOTALL).group(1)
for n,o,c in[('{','{','}'),('(','(',')'),('[','[',']')]: print(n,'OK' if s.count(o)==s.count(c) else 'FAIL')
d=json.loads(re.search(r'const CANDIDATE_DATA\s*=\s*(\{.*?\});',h,re.DOTALL).group(1))
ids={c['id'] for c in d['cards']}; p2c={c['placeId']:c['id'] for c in d['cards'] if c.get('placeId')}
need=['han-market','madame-lan-danang','morning-glory-hoian','xliii-coffee','wonderlust-coffee','love-bridge','hoi-an-night-market','dragon-bridge-show','hoi-an-old-town']
for k in need: assert k in p2c and p2c[k] in ids, f'placeId link broken: {k}'
b={c['id']:c for c in d['cards']}
assert 'coords' not in b['9.1']
print('cards',len(d['cards']),'| placeId links OK | 9.1 coords removed OK')
PY
```
Expected: 괄호 OK, `cards 94`, placeId links OK
- [ ] **Step 3:** 커밋 `git commit -am "fix(candidates): 중복 9장 제거 + 9.1 지도이탈핀 수정"`

---

### Task 5: 레퍼런스(first6) 의존 완전 제거 — 독립성

**Files:** Create `assets/img/1.1.jpg`,`1.3.jpg`,`1.4.jpg`,`1.7.jpg`,`1.8.jpg`; Modify `index.html`, `assets/img/CREDITS.md`

- [ ] **Step 1:** 5개 카드의 first6 이미지 URL 확인
```bash
python3 -c "import re,json;[print(c['id'],[u for u in re.findall(r'https://raw\.githubusercontent\.com/first6[^\s)\"]+',c.get('image','')+' '+c.get('md',''))]) for c in json.loads(re.search(r'const CANDIDATE_DATA\s*=\s*(\{.*?\});',open('index.html',encoding='utf-8').read(),re.DOTALL).group(1))['cards'] if c['id'] in('1.1','1.3','1.4','1.7','1.8')]"
```
- [ ] **Step 2:** 각 이미지 다운로드(≤800px)→`assets/img/<id>.jpg`. 라이선스 불명확하면 위키미디어 등 자유 라이선스 대체. 스테이징→육안 검증.
- [ ] **Step 3:** `image` 필드와 md 인라인 `![...](first6 url)`을 모두 `assets/img/<id>.jpg`로 교체(parse→dump). `assets/img/CREDITS.md`에 출처·라이선스 기록.
- [ ] **Step 4:** "GitHub 원본" 링크 제거 — index.html에서 `const githubUrl = ...first6...`(≈3948행)과 이를 쓰는 `<a class="detail-action-btn" ...>📄 GitHub 원본</a>`(≈3967행) 삭제.
```bash
grep -n "githubUrl\|GitHub 원본" index.html
```
- [ ] **Step 5(검증):** first6 의존 0
```bash
grep -c "first6" index.html
```
Expected: `0`
- [ ] **Step 6:** 커밋 `git add assets/img index.html && git commit -m "feat(candidates): 레퍼런스(first6) 의존 완전 제거 — 독립성 확보"`

---

### Task 6: 최종 검증 + 머지

- [ ] **Step 1:** 헤드리스(데스크톱+모바일) — JS에러 0, 전 카드 marked.parse OK, 라이브 카드 98(정적94+하얏트4). 타임라인 `📄{cardId}` 링크 클릭 동작(끊김 0). (RESUMING.md 스니펫 사용)
Expected: JS_ERRORS 0, liveCards 98, allMdParse true, 카드링크 OK
- [ ] **Step 2:** 종합 스윕
```bash
python3 -c "import re,json;from collections import Counter;h=open('index.html',encoding='utf-8').read();d=json.loads(re.search(r'const CANDIDATE_DATA\s*=\s*(\{.*?\});',h,re.DOTALL).group(1));ids=[c['id'] for c in d['cards']];b='\n'.join(c.get('md','') for c in d['cards']);print('cards',len(ids),'dup',{k:v for k,v in Counter(ids).items() if v>1},'미카즈키',b.count('미카즈키'),'푸라마',b.count('푸라마'),'first6',h.count('first6'))"
```
Expected: `cards 94 dup {} 미카즈키 0 푸라마 0 first6 0`
- [ ] **Step 3:** main 머지+푸시 (로컬 확인·사용자 승인 후)
```bash
git checkout main && git merge fix/card-audit-cleanup && git push origin main
```

---

## Self-Review (작성자 점검)
- 스펙 커버: 중복7(T2 placeId→T4 제거)·판단3(T3 보강, 3.17 T2/T4)·9.1(T4)·독립성5+링크(T5)·archive(T2) — 전부 매핑.
- placeId 이전(T2)이 제거(T4)보다 먼저 — 링크 보존 순서 보장.
- 카운트 일관: 103→(T4)94→라이브98. first6 9→(T5)0.
- 명칭 일관: `PLACE_TO_CARD`, placeId 키 8종, 제거 9종 — 스펙과 동일.
