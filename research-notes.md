# Research Notes

Updated: 2026-05-09

## Freshness Rule

모든 운영 정보는 2026-05-09 기준으로 다시 정리한다.

- 1순위: 호텔/시설/관광청/공식 운영사 페이지.
- 2순위: Michelin, Tripadvisor, 항공사 여행 가이드, 현지 여행 플랫폼 등 보조 출처.
- 3순위: 한국어 블로그/후기는 실제 체감 신호로만 사용하고, 영업시간·가격의 확정 근거로 쓰지 않는다.
- 운영중단, 리노베이션, 요금, 키 제한, 영업시간은 페이지에 `주의` 또는 `방문 직전 재확인`으로 남긴다.
- 공식 출처가 불명확하거나 폐업/이전 신호가 있는 장소는 `research` 또는 `backup` 상태로 유지한다.

## Product Direction

이 프로젝트는 여행지 소개용 가이드북이 아니라 현장에서 쓰는 모바일 대시보드로 본다.

- 첫 화면의 우선순위는 긴 설명이 아니라 `오늘/다음 결정`, `항공·숙소 확정 정보`, `지도`, `체크리스트`, `대안`이다.
- TripIt은 항공·호텔·일정이 시간순으로 정리되는 구조를 참고한다.
- Wanderlog와 Google My Maps는 장소를 카테고리별로 묶고 지도 액션을 우선하는 구조를 참고한다.
- Notion 여행 템플릿은 예약정보, 체크리스트, 예산표 구조를 참고한다.
- Apple Wallet/boarding pass UI는 항공편명, 예약번호, 터미널, 체크인 마감처럼 즉시 보여야 하는 정보의 우선순위 참고용으로 사용한다.
- 이 레퍼런스들은 UI/정보구조 기준이며, 장소·운영 정보의 사실 근거는 공식 출처를 우선한다.

## Source Hierarchy

1. 공식/신뢰 정보
   - Da Nang International Airport: https://danangairport.vn/
   - UNESCO Hoi An Ancient Town: https://whc.unesco.org/en/list/948
   - Hoi An Ancient Town official: https://www.hoianancienttown.vn/
   - Hyatt, Eastar Jet, Ba Na Hills, Da Nang Fantasticity 등 공식 운영/관광청 페이지
2. 보조 정보
   - Michelin, Tripadvisor, 항공사 여행 가이드, 액티비티 플랫폼
3. 체감 정보
   - 한국어 블로그/후기. 단, 영업시간/가격/운영여부의 확정 근거로 쓰지 않는다.

## Planning Direction
The page is a family trip planbook, not the final itinerary yet. Current plan direction:

- Keep the first full day light because the family arrives after a late-night flight.
- Avoid Ba Na Hills on Sunday if possible because weekend crowds and cable-car queues can be harder with children.
- Put Ba Na Hills on Monday, July 27, if the weather is acceptable.
- Use Sunday night, July 26, as the better Dragon Bridge option because Saturday may be too tiring after arrival.
- Use Happy Day Hotel as a city rest base before doing Hoi An on Tuesday afternoon/evening.
- Keep Wednesday, July 29, low-intensity for shopping, shower, packing, and airport transfer.

## Primary Draft Plan

### Day 0 / 2026-07-24 Friday
- Night departure from Korea.
- No sightseeing plan.

### Day 1 / 2026-07-25 Saturday
- Arrive, sleep/recover at New Orient.
- Move to Hyatt.
- Resort pool/beach only.
- Dragon Bridge is optional, but likely too tiring.

### Day 2 / 2026-07-26 Sunday
- Morning: short Marble Mountains only if the family is rested.
- Afternoon: Hyatt pool, nap, resort time.
- Night: optional Dragon Bridge show at 21:00.

### Day 3 / 2026-07-27 Monday
- Ba Na Hills full-day candidate.
- Private round-trip car recommended.
- No extra city/night activity.

### Day 4 / 2026-07-28 Tuesday
- Hyatt checkout.
- Move to Happy Day Hotel.
- Rest/shower during the hottest hours.
- Late afternoon/evening Hoi An lantern route.

### Day 5 / 2026-07-29 Wednesday
- Han Market or Lotte Mart, depending on heat and shopping list.
- Rest/shower/packing at Happy Day.
- Airport transfer with buffer.

## Verified Facts To Use

### Hyatt Regency Danang
- Official Hyatt page describes the resort as family-friendly.
- It has five outdoor pools and direct beach access.
- Camp Hyatt is available for kids and is described as one of the biggest kids clubs in Southeast Asia.
- Official hotel page mentions complimentary two-hour Camp Hyatt access for kids ages 4-12, and waterslide restrictions.
- Family dining and kids menus are available at resort restaurants.

Sources:
- https://www.hyatt.com/hyatt-regency/en-US/danhr-hyatt-regency-danang-resort-and-spa/family-stay-and-activities
- https://www.hyatt.com/en-US/hotel/vietnam/hyatt-regency-danang-resort-and-spa/danhr

### Dragon Bridge
- Official Da Nang tourism page says the fire/water show starts at 21:00 every Friday, Saturday, Sunday, and major holidays.
- Family planning note: the show is late for young children, so keep it optional.

Source:
- https://danangfantasticity.com/en/the-dragon-show

### Marble Mountains
- Official Da Nang tourism page lists address and ticket information.
- Adult Thuy Son visit ticket: 40,000 VND.
- Elevator: 15,000 VND one-way.
- Children under 6: free.
- Family planning note: close to Hyatt, but steps and heat make it best as a short morning option.

Source:
- https://danangfantasticity.com/en/culture-en/the-marble-mountains

### Ba Na Hills
- Official Sun World page lists cable car business hours as 08:00-22:00 on the crawled page.
- Official price pages are inconsistent across older FAQ and newer policy pages. Use official online ticket site or latest booking platform before purchase.
- Family planning note: treat as a full-day activity and do not pair with another major stop.

Sources:
- https://banahills.sunworld.vn/en
- https://banahills.sunworld.vn/en/news-da-nang/update-sun-world-ba-na-hillss-new-price-policy.html

### Hoi An
- Night market references commonly place activity around evening hours.
- Family planning note: leave late afternoon, have dinner, walk lantern streets, and return before kids are overtired.

Working source:
- https://hoiandaytour.com/guide/hoi-an-night-market/

### Eastar Jet

- 공식 온라인 체크인 안내 기준 국제선 온라인 체크인은 출발 24시간 전부터 1시간 30분 전까지입니다.
- 이용 제한 대상에 베트남 노선 이용 승객 중 소아 동반 승객이 포함되어 있어, 이번 가족 여행은 공항 카운터 체크인을 기본값으로 둡니다.
- 귀국편은 베트남 출발 노선이라 온라인 체크인 제한 가능성이 더 큽니다.
- 휴대수하물은 1개, 10kg 이하, 20+55+40cm/세 변 합 115cm 이하 기준입니다.
- 국제선 특가운임은 위탁수하물이 불포함일 수 있으므로 예약 상세에서 운임 종류와 1인당 위탁수하물 포함 여부를 확인해야 합니다.
- 위탁수하물 사전구매는 출발 24시간 전까지 구매/취소/변경 가능하다고 안내됩니다.
- 국제선 위탁수하물 마감은 출발 1시간 전입니다.
- 즉석 발열 조리식품은 기내반입 및 위탁이 불가합니다.

Sources:
- https://www.eastarjet.com/newstar/PGWII00001
- https://www.eastarjet.com/newstar/PGWIK00002
- https://www.eastarjet.com/newstar/PGWIU00001
- https://www.eastarjet.com/newstar/PGWIK00005

## Open Items For User
- Exact Da Nang arrival time.
- Exact Da Nang departure time.
- Whether Hyatt breakfast is included.
- Whether Happy Day Hotel allows early check-in or day-use style rest.
- Whether Ba Na Hills is a must-do or optional.
- Whether the kids can comfortably stay awake for a 21:00 Dragon Bridge outing.
