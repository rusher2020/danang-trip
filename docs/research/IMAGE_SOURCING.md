# 이미지 보강 원칙

Updated: 2026-05-10

이 프로젝트는 GitHub Pages 배포를 전제로 하므로, 블로그 이미지를 그대로 다운로드하거나 복사해서 넣지 않는다. 블로그와 후기 사이트는 장소 분위기와 후기 판단 근거로 참고하되, 화면에 직접 노출하는 이미지는 아래 우선순위로 사용한다.

## 우선순위

1. 공식 사이트 이미지
   - 호텔, 식당, 상점이 직접 공개한 이미지
   - 출처 URL과 credit을 함께 기록

2. Wikimedia Commons / Flickr Creative Commons
   - 라이선스가 확인되는 이미지
   - 파일 페이지를 `sourceUrl`에 기록

3. Google Places Photos API
   - 추후 API 키 연결 시 장소별 최신 사진을 API 약관에 맞춰 표시
   - place_id, attribution, photo_reference를 함께 저장

4. 직접 촬영 또는 사용자가 제공한 이미지
   - 여행 전/중 직접 찍은 사진을 `assets/`에 넣는 방식

## 블로그/후기 이미지를 쓰지 않는 이유

- 대부분 이미지 재사용 권한이 명시되어 있지 않다.
- GitHub Pages에 배포하면 개인 참고 수준을 넘어 공개 페이지가 된다.
- 원본 블로그가 이미지를 삭제하거나 CDN 경로를 바꾸면 페이지가 깨진다.

## 대신 수집할 것

- 블로그 이미지 자체가 아니라, 블로그 URL과 후기 요약
- 장소별 분위기 키워드
- 실제 방문 전 Google Maps/네이버 블로그에서 다시 확인할 체크포인트

## 다음 이미지 보강 대상

- Ăn Thôi Da Nang: 공식/라이선스 이미지 미확보. Google Places API 연결 권장.
- Xanh House / Osteria al Mare / Camp Hyatt: Hyatt 공식 페이지 이미지 사용 후보. 직접 URL 안정성 확인 필요.
- Cargo Club / Lim Dining Room / Madam Kieu: 공식 사이트 또는 라이선스 이미지 확인 필요.
- Lotte Mart / MM Mega Market: 지도 API 사진 또는 직접 방문 전 캡처 대신 API 연결 권장.
