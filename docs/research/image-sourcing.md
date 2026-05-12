# 이미지 소싱 노트 (v2)

## 현재 상태 (2026-05-12)

후보 카드의 이미지는 `data/places.json`의 `image.url` 필드를 그대로 사용합니다.

소스 분포 (65개):
- Wikimedia Commons: 57
- assets.hyatt.com (공식): 4
- phevaworld.com (공식): 3
- www.madamelan.vn (공식): 1

모두 저작권 안전한 출처.

## 향후 로컬화 (선택)

스펙 §7-A.3의 정책(WebP, ≤500KB/장소, 총 ≤20MB)을 따라 로컬화하려면:

1. `assets/img/_raw/`에 원본 다운로드 (gitignore됨)
2. WebP 1200×800, 품질 80으로 변환
3. `assets/img/{category}/{place_id}.webp`로 커밋
4. `data/places.json[].image.url` → 상대경로로 교체

지금은 외부 URL이 안정적이고 GitHub Pages·git repo가 가벼우므로 보류.
