const categoryLabels = {
  activity: "놀거리",
  restaurant: "식사",
  cafe: "카페",
  market: "마켓",
  shopping: "쇼핑",
  attraction: "여행지"
};

const statusLabels = {
  candidate: "날씨 보고",
  shortlisted: "꼭 가볼 곳",
  confirmed: "확정",
  backup: "쉬운 일정",
  research: "더 알아보기",
  skip: "제외"
};

const statusOrder = {
  confirmed: 0,
  shortlisted: 1,
  candidate: 2,
  backup: 3,
  research: 4,
  skip: 5
};

const priorityOrder = {
  "높음": 0,
  "중상": 1,
  "중간": 2,
  "중하": 3,
  "낮음": 4,
  high: 0,
  medium: 2,
  low: 4
};

const placeSets = {
  core: {
    label: "핵심만",
    note: "이번 여행에서 먼저 볼 10곳입니다. 전체 장소는 아래 필터에서 확인할 수 있습니다.",
    filter: "shortlisted",
    ids: []
  },
  hyatt: {
    label: "하얏트 체류",
    note: "7/25-7/28 하얏트 안에서 쉬고 먹고 놀 때 보는 장소입니다.",
    filter: null,
    ids: ["hyatt-resort-time", "hyatt-camp-hyatt", "hyatt-xanh-house", "hyatt-osteria", "hyatt-junior-cafe", "marble-mountains"]
  },
  hoiAn: {
    label: "호이안 저녁",
    note: "7/28 저녁은 식사를 먼저 잡고 등불 산책을 짧게 붙이는 흐름입니다.",
    filter: null,
    ids: ["hoi-an-evening", "morning-glory-hoian", "cargo-club-hoian", "lim-dining-room-hoian", "madam-kieu-hoian"]
  },
  city: {
    label: "마지막 날 시내",
    note: "7/29 Happy Day 기준으로 쇼핑, 식사, 기념품을 짧게 묶는 장소입니다.",
    filter: null,
    ids: ["han-market", "an-thoi-danang", "madame-lan-danang", "pheva-chocolate", "maison-marou-danang", "go-danang-big-c", "lotte-mart-danang", "mm-mega-market-danang"]
  },
  shopping: {
    label: "쇼핑만",
    note: "흥정 시장, 정찰제 마트, 초콜릿 선물, 실내몰을 분리해서 봅니다.",
    filter: null,
    ids: [
      "han-market",
      "pheva-chocolate",
      "maison-marou-danang",
      "langfarm-danang",
      "go-danang-big-c",
      "lotte-mart-danang",
      "mm-mega-market-danang",
      "vincom-plaza-ngo-quyen",
      "coopmart-danang",
      "danang-souvenirs-cafe",
      "alluvia-chocolate",
      "k-market-danang",
      "con-market",
      "bac-my-an-market",
      "helio-night-market",
      "son-tra-night-market"
    ]
  },
  easy: {
    label: "더위·비",
    note: "한낮 더위, 비, 아이 피로가 있을 때 무리하지 않는 선택입니다.",
    filter: null,
    ids: ["hyatt-resort-time", "hyatt-camp-hyatt", "hyatt-junior-cafe", "lotte-mart-danang", "mm-mega-market-danang", "museum-cham-sculpture", "pizza-4ps-danang"]
  }
};

const fallbackPlaces = [];
const checklistStorageKey = "danang-planbook-checklist";
const noteStorageKey = "danang-planbook-family-note";
const appConfig = window.DANANG_CONFIG || {};
const googlePlacesEnabled = Boolean(appConfig.ENABLE_GOOGLE_PLACES && appConfig.GOOGLE_MAPS_API_KEY);
const googlePlacesDailyLimit = Number(appConfig.GOOGLE_PLACES_DAILY_LIMIT || 80);
const googlePlacesSessionLimit = Number(appConfig.GOOGLE_PLACES_SESSION_LIMIT || 12);
const googlePlacesUsageKey = "danang-google-places-usage";

const cardsRoot = document.querySelector("#cards");
const nextDecisionCardRoot = document.querySelector("#next-decision-card");
const currentStateCardRoot = document.querySelector("#current-state-card");
const todayDayBoardRoot = document.querySelector("#today-day-board");
const placePreviewCardRoot = document.querySelector("#place-preview-card");
const fallbackListRoot = document.querySelector("#fallback-list");
const hotelFlowCompactRoot = document.querySelector("#hotel-flow-compact");
const hotelFlowRoot = document.querySelector("#hotel-flow");
const hyattProgramListRoot = document.querySelector("#hyatt-program-list");
const expertSummaryRoot = document.querySelector("#expert-summary");
const dayListRoot = document.querySelector("#day-list");
const checklistRoot = document.querySelector("#checklist");
const scenarioListRoot = document.querySelector("#scenario-list");
const decisionListRoot = document.querySelector("#decision-list");
const liveFeaturesRoot = document.querySelector("#live-features");
const koreanReviewsRoot = document.querySelector("#korean-reviews");
const airlineInfoListRoot = document.querySelector("#airline-info-list");
const transportListRoot = document.querySelector("#transport-list");
const mapRouteListRoot = document.querySelector("#map-route-list");
const budgetListRoot = document.querySelector("#budget-list");
const shoppingListRoot = document.querySelector("#shopping-list");
const packingListRoot = document.querySelector("#packing-list");
const emergencyListRoot = document.querySelector("#emergency-list");
const sheet = document.querySelector("#sheet");
const sheetContent = document.querySelector("#sheet-content");
const filters = Array.from(document.querySelectorAll(".filter"));
const placeSetButtons = Array.from(document.querySelectorAll("[data-place-set]"));
const tabButtons = Array.from(document.querySelectorAll("[data-tab]"));
const tabPanels = Array.from(document.querySelectorAll("[data-tab-panel]"));
const searchInput = document.querySelector("#place-search");
const resultNote = document.querySelector("#result-note");
const placesMapCardRoot = document.querySelector("#places-map-card");
const shortlistedCount = document.querySelector("#shortlisted-count");
const backupCount = document.querySelector("#backup-count");
const dateRange = document.querySelector("#date-range");
const tripTitle = document.querySelector("#trip-title");
const tripSubtitle = document.querySelector("#trip-subtitle");
const criteriaChips = document.querySelector("#criteria-chips");
const nextDecision = document.querySelector("#next-decision");
const familyNote = document.querySelector("#family-note");
const noteStatus = document.querySelector("#note-status");

let activeFilter = "shortlisted";
let activePlaceSet = "core";
let allPlaces = [];
let allReviews = [];
let allMapPoints = [];
let allDecisions = [];
let allDays = [];
let allMapRoutes = [];
let googlePlacesPromise = null;
let googlePlaceClass = null;
const googlePlaceState = new Map();
let googlePlacesSessionCount = 0;
let placesMap = null;
const mapMarkers = new Map();

function activateTab(tabId) {
  tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === tabId);
  });
  tabPanels.forEach((panel) => {
    const isActive = panel.dataset.tabPanel === tabId;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function normalizeLabel(value, map) {
  return map[value] || value;
}

function getUiStatus(value) {
  const map = {
    fixed: "확정",
    confirmed: "확정",
    recommended: "좋은 흐름",
    shortlisted: "꼭 가볼 곳",
    flexible: "가볍게 조정",
    candidate: "날씨 보고",
    planned: "가볍게 조정",
    research: "더 알아보기",
    backup: "쉬운 일정",
    skip: "제외"
  };
  return map[value] || value;
}

function getStatusClass(value) {
  const label = getUiStatus(value);
  if (label === "확정") return "status-confirmed";
  if (label === "꼭 가볼 곳" || label === "좋은 흐름") return "status-recommended";
  if (label === "날씨 보고" || label === "더 알아보기" || label === "가볍게 조정") return "status-conditional";
  if (label === "쉬운 일정") return "status-backup";
  return "status-muted";
}

function getSearchText(place) {
  return [
    place.name,
    place.category,
    place.status,
    place.priority,
    place.area,
    place.familyFit,
    place.kidPoint,
    place.summary,
    place.bestTime,
    place.duration,
    place.budgetLevel,
    place.caution,
    place.decisionNeeded,
    ...(place.suggestedSlots || [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getMapUrl(place) {
  const mapPoint = getMapPoint(place.id);
  return mapPoint?.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.area || ""} Da Nang Vietnam`)}`;
}

function getMapPoint(id) {
  return allMapPoints.find((point) => point.id === id);
}

function getReviewsForPlace(placeId) {
  return allReviews.filter((review) => review.relatedPlaceIds.includes(placeId));
}

function renderVisual(place, visualClass) {
  const visual = getPlaceVisual(place);
  if (visual?.url) {
    return `
      <div class="card-visual has-image ${visualClass}">
        <img src="${visual.url}" alt="${visual.alt || place.name}" loading="lazy" onload="this.closest('.card-visual').classList.add('is-loaded')" onerror="this.closest('.visual-slot').innerHTML=''">
        <div class="card-visual-inner">
          <span class="visual-label">${visual.label}</span>
          <span class="visual-area">${place.area}</span>
        </div>
        ${visual.attribution ? `<div class="visual-attribution">${visual.attribution}</div>` : ""}
      </div>
    `;
  }
  if (googlePlacesEnabled && !googlePlaceState.get(place.id)?.failed) {
    return `
      <div class="card-visual photo-pending ${visualClass}">
        <div class="card-visual-inner">
          <span class="visual-label">${normalizeLabel(place.category, categoryLabels)}</span>
          <span class="visual-area">Google 사진 불러오는 중</span>
        </div>
      </div>
    `;
  }
  return "";
}

function getPlaceVisual(place) {
  const live = googlePlaceState.get(place.id);
  if (live?.photoUrl) {
    return {
      url: live.photoUrl,
      alt: `${place.name} Google Places 사진`,
      label: "Google 사진",
      attribution: live.attribution || "Google Maps"
    };
  }
  if (place.image?.url) {
    return {
      url: place.image.url,
      alt: place.image.alt || place.name,
      label: normalizeLabel(place.category, categoryLabels),
      attribution: ""
    };
  }
  return null;
}

function updateCounts(places) {
  if (shortlistedCount) shortlistedCount.textContent = places.filter((place) => place.status === "shortlisted").length;
  if (backupCount) backupCount.textContent = places.filter((place) => place.status === "backup").length;
}

function getOneLineSummary(place) {
  const summary = (place.summary || "").trim();
  if (!summary) return "가족 일정에 맞춰 편하게 볼 수 있는 장소입니다.";
  const sentence = summary.split(".")[0].trim();
  return sentence ? `${sentence}.` : summary;
}

function getFilteredPlaces(places) {
  const query = searchInput.value.trim().toLowerCase();
  const set = placeSets[activePlaceSet];
  return places.filter((place) => {
    const matchesSet = set?.ids?.length ? set.ids.includes(place.id) : true;
    const setFilter = set?.filter || activeFilter;
    const matchesFilter =
      setFilter === "all" ||
      (setFilter === "backup" && place.status === "backup") ||
      (setFilter === "shortlisted" && place.status === "shortlisted") ||
      (setFilter === "research" && place.status === "research") ||
      place.category === setFilter;
    const matchesSearch = !query || getSearchText(place).includes(query);
    return matchesSet && matchesFilter && matchesSearch;
  });
}

function sortPlaces(places) {
  return [...places].sort((a, b) => {
    const statusDiff = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
    if (statusDiff) return statusDiff;
    const priorityDiff = (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9);
    if (priorityDiff) return priorityDiff;
    return a.name.localeCompare(b.name, "ko");
  });
}

function renderCards(places) {
  const visiblePlaces = sortPlaces(getFilteredPlaces(places));
  const set = placeSets[activePlaceSet];

  resultNote.textContent = set
    ? `${visiblePlaces.length}곳 표시 중 · ${set.note}`
    : `${visiblePlaces.length}곳 표시 중 · 가족과 가기 좋은 곳부터 정렬합니다.`;

  if (!visiblePlaces.length) {
    cardsRoot.innerHTML = '<div class="empty-state">조건에 맞는 장소가 없습니다. 필터를 바꾸거나 검색어를 줄여보세요.</div>';
    return;
  }

  cardsRoot.innerHTML = visiblePlaces
    .map((place) => {
      const visualClass = place.category || "activity";
      return `
        <article class="place-card">
          <div class="visual-slot" data-visual-place-id="${place.id}">
            ${renderVisual(place, visualClass)}
          </div>
          <div class="card-body">
            <div class="meta-row">
              <span class="pill">${normalizeLabel(place.category, categoryLabels)}</span>
              <span class="pill ${getStatusClass(place.status)}">${normalizeLabel(place.status, statusLabels)}</span>
            </div>
            <h3>${place.name}</h3>
            <p>${getOneLineSummary(place)}</p>
            <div class="compact-place-grid">
              <div>
                <span>좋은 시간</span>
                <strong>${place.bestTime}</strong>
              </div>
              <div>
                <span>아이와 좋은 점</span>
                <strong>${place.kidPoint}</strong>
              </div>
            </div>
            <div class="card-actions">
              <a class="primary" href="${getMapUrl(place)}" target="_blank" rel="noreferrer">지도</a>
              <button type="button" data-place-id="${place.id}">상세</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
  renderPlacesMapShell(visiblePlaces, set);
}

function renderPlacesMapShell(visiblePlaces, set) {
  if (!placesMapCardRoot) return;
  const hotelLinks = ["hyatt", "happy-day", "new-orient"]
    .map((id) => {
      const point = getMapPoint(id);
      return point ? `<a href="${point.mapsUrl}" target="_blank" rel="noreferrer">${point.name.replace(" Hotel Da Nang", "")}</a>` : "";
    })
    .join("");
  placesMapCardRoot.innerHTML = `
      <div class="places-map-head">
        <div>
          <span>숙소 기준 지도</span>
          <strong>${set?.label || "전체"} · ${visiblePlaces.length}곳</strong>
        </div>
        <button type="button" data-map-refresh>지도 새로고침</button>
      </div>
    <div id="places-map" class="places-map" role="img" aria-label="선택한 장소 지도">
      <div class="map-loading">Google 지도를 불러오는 중입니다.</div>
    </div>
    <div class="places-map-links">${hotelLinks}</div>
  `;
  hydratePlacesMap(visiblePlaces);
}

function loadGoogleMaps() {
  if (!googlePlacesEnabled) return Promise.reject(new Error("Google Places disabled"));
  if (window.google?.maps?.importLibrary) {
    return Promise.resolve(window.google.maps);
  }
  if (googlePlacesPromise) return googlePlacesPromise;
  googlePlacesPromise = new Promise((resolve, reject) => {
    const callbackName = "__danangGoogleMapsReady";
    window[callbackName] = () => {
      resolve(window.google.maps);
      delete window[callbackName];
    };
    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: appConfig.GOOGLE_MAPS_API_KEY,
      v: "weekly",
      libraries: "places",
      callback: callbackName,
      language: "ko",
      region: "VN"
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Google Maps JavaScript API failed to load"));
    document.head.appendChild(script);
  });
  return googlePlacesPromise;
}

async function getGooglePlaceClass() {
  await loadGoogleMaps();
  if (!googlePlaceClass) {
    const placesLibrary = await google.maps.importLibrary("places");
    googlePlaceClass = placesLibrary.Place;
  }
  return googlePlaceClass;
}

async function getGoogleMapsLibrary() {
  await loadGoogleMaps();
  return google.maps.importLibrary("maps");
}

function getGooglePlaceQuery(place) {
  const point = getMapPoint(place.id);
  return [point?.name || place.name, point?.address || place.area, "Vietnam"].filter(Boolean).join(" ");
}

function getPhotoAttribution(photo) {
  const names = (photo.authorAttributions || [])
    .map((author) => author.uri ? `<a href="${author.uri}" target="_blank" rel="noreferrer">${author.displayName}</a>` : author.displayName)
    .filter(Boolean);
  return names.length ? names.join(", ") : "Google Maps";
}

async function fetchGooglePlacePhoto(place) {
  const current = googlePlaceState.get(place.id);
  if (current?.loading || current?.photoUrl || current?.failed) return;
  if (!canUseGooglePlaces()) {
    return;
  }
  googlePlaceState.set(place.id, { loading: true });
  try {
    recordGooglePlacesUse();
    const Place = await getGooglePlaceClass();
    const { places } = await Place.searchByText({
      textQuery: getGooglePlaceQuery(place),
      fields: ["id", "displayName", "photos", "rating", "userRatingCount", "businessStatus", "googleMapsURI", "location"],
      language: "ko",
      region: "vn",
      maxResultCount: 1
    });
    const googlePlace = places?.[0];
    const photo = googlePlace?.photos?.[0];
    if (!googlePlace || !photo) {
      googlePlaceState.set(place.id, { failed: true });
      return;
    }
    googlePlaceState.set(place.id, {
      id: googlePlace.id,
      photoUrl: photo.getURI({ maxWidth: 900, maxHeight: 520 }),
      attribution: getPhotoAttribution(photo),
      displayName: googlePlace.displayName,
      rating: googlePlace.rating,
      userRatingCount: googlePlace.userRatingCount,
      businessStatus: googlePlace.businessStatus,
      googleMapsURI: googlePlace.googleMapsURI,
      location: googlePlace.location
    });
  } catch (error) {
    googlePlaceState.set(place.id, { failed: true });
  }
}

function getGooglePlacesUsage() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const usage = JSON.parse(localStorage.getItem(googlePlacesUsageKey)) || {};
    if (usage.date !== today) return { date: today, count: 0 };
    return usage;
  } catch (error) {
    return { date: new Date().toISOString().slice(0, 10), count: 0 };
  }
}

function canUseGooglePlaces() {
  const usage = getGooglePlacesUsage();
  return googlePlacesSessionCount < googlePlacesSessionLimit && usage.count < googlePlacesDailyLimit;
}

function recordGooglePlacesUse() {
  const usage = getGooglePlacesUsage();
  usage.count += 1;
  googlePlacesSessionCount += 1;
  localStorage.setItem(googlePlacesUsageKey, JSON.stringify(usage));
}

async function hydrateGooglePlaces(places) {
  if (!googlePlacesEnabled) return;
  const visiblePlaces = sortPlaces(getFilteredPlaces(places));
  for (const place of visiblePlaces) {
    if (!canUseGooglePlaces()) return;
    await fetchGooglePlacePhoto(place);
    updatePlaceVisual(place);
    await new Promise((resolve) => window.setTimeout(resolve, 120));
  }
}

function updatePlaceVisual(place) {
  const slot = document.querySelector(`[data-visual-place-id="${place.id}"]`);
  if (!slot) return;
  slot.innerHTML = renderVisual(place, place.category || "activity");
}

async function hydratePlacesMap(places) {
  if (!placesMapCardRoot) return;
  const mapElement = document.querySelector("#places-map");
  if (!mapElement) return;
  if (!googlePlacesEnabled) {
    mapElement.innerHTML = '<div class="map-loading">공개 설정에서 Google Maps 키를 연결하면 지도에 장소가 표시됩니다.</div>';
    return;
  }
  try {
    const { Map } = await getGoogleMapsLibrary();
    const center = { lat: 16.0471, lng: 108.2068 };
    placesMap = new Map(mapElement, {
      center,
      zoom: 11,
      disableDefaultUI: true,
      zoomControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      gestureHandling: "greedy"
    });
    mapMarkers.forEach((marker) => {
      marker.map = null;
    });
    mapMarkers.clear();
    const bounds = new google.maps.LatLngBounds();
    let markerCount = 0;
    const mapPlaces = places.slice(0, 18);
    for (const place of mapPlaces) {
      await fetchGooglePlacePhoto(place);
      const livePlace = googlePlaceState.get(place.id);
      const location = livePlace?.location;
      if (!location) continue;
      const marker = new google.maps.Marker({
        map: placesMap,
        position: location,
        title: place.name,
        label: {
          text: normalizeLabel(place.category, categoryLabels).slice(0, 2),
          color: "#ffffff",
          fontSize: "11px",
          fontWeight: "700"
        }
      });
      marker.addListener("click", () => openSheet(place));
      mapMarkers.set(place.id, marker);
      bounds.extend(location);
      markerCount += 1;
    }
    if (markerCount > 1) {
      placesMap.fitBounds(bounds, { top: 36, right: 36, bottom: 36, left: 36 });
    } else if (markerCount === 1) {
      placesMap.setCenter(bounds.getCenter());
      placesMap.setZoom(14);
    }
    if (!markerCount) {
      mapElement.innerHTML = '<div class="map-loading">표시할 지도 위치를 찾지 못했습니다. 아래 장소 카드의 지도 버튼을 사용하세요.</div>';
    }
    hydrateGooglePlaces(places);
  } catch (error) {
    mapElement.innerHTML = '<div class="map-loading">지도를 불러오지 못했습니다. API 키 제한과 Maps JavaScript API 상태를 확인하세요.</div>';
  }
}


function getEmbedMapUrl(place, livePlace) {
  if (!appConfig.GOOGLE_MAPS_API_KEY) return "";
  const params = new URLSearchParams({
    key: appConfig.GOOGLE_MAPS_API_KEY,
    q: livePlace?.id ? `place_id:${livePlace.id}` : getGooglePlaceQuery(place),
    language: "ko",
    region: "vn"
  });
  return `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
}

function getEmbedDirectionsUrl(route) {
  if (!appConfig.GOOGLE_MAPS_API_KEY) return "";
  const params = new URLSearchParams({
    key: appConfig.GOOGLE_MAPS_API_KEY,
    origin: route.origin,
    destination: route.destination,
    mode: route.mapsUrl.includes("travelmode=walking") ? "walking" : "driving",
    language: "ko",
    region: "vn"
  });
  if (route.waypoints?.length) {
    params.set("waypoints", route.waypoints.join("|"));
  }
  return `https://www.google.com/maps/embed/v1/directions?${params.toString()}`;
}

function openSheet(place) {
  const mapPoint = getMapPoint(place.id);
  const sourceLink = place.sourceUrl
    ? `<a href="${place.sourceUrl}" target="_blank" rel="noreferrer">출처 보기</a>`
    : '<a aria-disabled="true">출처 대기</a>';
  const relatedReviews = allReviews.filter((review) => review.relatedPlaceIds.includes(place.id));
  const visual = getPlaceVisual(place);
  const livePlace = googlePlaceState.get(place.id);
  const embedMapUrl = getEmbedMapUrl(place, livePlace);
  const itineraryUses = getItineraryUses(place.id);
  const imageCredit = livePlace?.photoUrl
    ? `<p class="image-credit">이미지: ${livePlace.attribution || "Google Maps"}</p>`
    : place.image?.credit
      ? `<p class="image-credit">이미지: <a href="${place.image.sourceUrl}" target="_blank" rel="noreferrer">${place.image.credit}</a></p>`
      : "";
  const livePlaceMarkup = livePlace?.displayName
    ? `
      <div class="sheet-detail">
        <span>Google 장소 정보</span>
        <p>${livePlace.displayName}${livePlace.rating ? ` · 평점 ${livePlace.rating}` : ""}${livePlace.userRatingCount ? ` · 리뷰 ${livePlace.userRatingCount.toLocaleString("ko-KR")}개` : ""}</p>
        ${livePlace.businessStatus ? `<p>${livePlace.businessStatus}</p>` : ""}
      </div>
    `
    : "";
  const reviewMarkup = relatedReviews.length
    ? `
      <div class="sheet-detail">
        <span>한국어 후기 신호</span>
        ${relatedReviews
          .map((review) => `
            <p><strong>${review.topic}</strong></p>
            <p>${review.signal}</p>
          `)
          .join("")}
      </div>
    `
    : "";
  const itineraryMarkup = itineraryUses.length
    ? `
      <div class="sheet-detail">
        <span>우리 일정에서 쓰는 법</span>
        ${itineraryUses
          .map((item) => `<p><strong>${item.day}</strong> · ${item.time} · ${item.title}</p>`)
          .join("")}
      </div>
    `
    : "";
  sheetContent.innerHTML = `
    <div class="sheet-title-block">
      ${visual?.url ? `<img class="sheet-image" src="${visual.url}" alt="${visual.alt || place.name}" onerror="this.remove()">` : ""}
      ${imageCredit}
      <div class="meta-row">
        <span class="pill">${normalizeLabel(place.category, categoryLabels)}</span>
        <span class="pill ${getStatusClass(place.status)}">${normalizeLabel(place.status, statusLabels)}</span>
        <span class="pill">${place.priority}</span>
      </div>
      <h2 id="sheet-title">${place.name}</h2>
      <p class="sheet-summary">${place.summary}</p>
    </div>
    <div class="sheet-details">
      <div class="sheet-detail">
        <span>아이 포인트</span>
        <p>${place.kidPoint}</p>
      </div>
      ${itineraryMarkup}
      <div class="sheet-detail">
        <span>좋은 시간 · 소요</span>
        <strong>${place.bestTime} · ${place.duration}</strong>
      </div>
      <div class="sheet-detail">
        <span>이동 메모</span>
        <p>하얏트: ${place.transfer?.fromHyatt || "추가 확인 필요"}</p>
        <p>Happy Day: ${place.transfer?.fromHappyDay || "추가 확인 필요"}</p>
      </div>
      ${
        mapPoint
          ? `<div class="sheet-detail">
              <span>지도 정보</span>
              <p>${mapPoint.address}</p>
            </div>`
          : ""
      }
      ${
        embedMapUrl
          ? `<div class="sheet-map">
              <iframe
                title="${place.name} 지도"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                src="${embedMapUrl}">
              </iframe>
            </div>`
          : ""
      }
      <div class="sheet-detail">
        <span>예산 레벨</span>
        <strong>${place.budgetLevel}</strong>
      </div>
      <div class="sheet-detail">
        <span>주의사항</span>
        <p>${place.caution}</p>
      </div>
      <div class="sheet-detail">
        <span>여행 메모</span>
        <p>${place.decisionNeeded}</p>
      </div>
      <div class="sheet-detail">
        <span>어울리는 시간</span>
        <p>${(place.suggestedSlots || []).join(" · ") || "추가 확인 필요"}</p>
      </div>
      ${reviewMarkup}
      ${livePlaceMarkup}
    </div>
    <div class="sheet-actions">
      <a class="primary" href="${getMapUrl(place)}" target="_blank" rel="noreferrer">지도 열기</a>
      ${sourceLink}
    </div>
  `;
  sheet.classList.add("is-open");
  sheet.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function getItineraryUses(placeId) {
  return allDays.flatMap((day) =>
    (day.blocks || [])
      .filter((block) => block.placeIds?.includes(placeId))
      .map((block) => ({
        day: `${day.date} ${day.theme}`,
        time: block.time,
        title: block.title
      }))
  );
}

function openDecisionSheet(decision) {
  const placeById = new Map(allPlaces.map((place) => [place.id, place]));
  sheetContent.innerHTML = `
    <div class="sheet-title-block">
      <div class="meta-row">
        <span class="pill">다음에 정할 일</span>
        <span class="pill status">${decision.when}</span>
      </div>
      <h2 id="sheet-title">${decision.title}</h2>
      <p class="sheet-summary">날씨와 아이 컨디션을 보고 현장에서 편하게 고를 수 있도록 정리했습니다.</p>
    </div>
    <div class="sheet-details">
      <div class="sheet-detail">
        <span>가기 좋은 날</span>
        <p>${decision.go}</p>
      </div>
      <div class="sheet-detail">
        <span>쉬는 게 나은 날</span>
        <p>${decision.skip}</p>
      </div>
      <div class="sheet-detail">
        <span>이렇게 바꾸기</span>
        <p>${decision.fallback}</p>
      </div>
      <div class="sheet-detail">
        <span>함께 볼 장소</span>
        <div class="slot-places">
          ${(decision.relatedPlaceIds || [])
            .map((id) => `<button class="place-chip" type="button" data-scenario-place-id="${id}">${placeById.get(id)?.name || id}</button>`)
            .join("")}
        </div>
      </div>
    </div>
  `;
  sheet.classList.add("is-open");
  sheet.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeSheet() {
  sheet.classList.remove("is-open");
  sheet.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

async function loadPlaces() {
  try {
    const response = await fetch("data/places.json");
    if (!response.ok) throw new Error("Failed to load places");
    return await response.json();
  } catch (error) {
    cardsRoot.innerHTML = "<p>장소 데이터를 불러오려면 로컬 서버 또는 GitHub Pages에서 열어주세요.</p>";
    return fallbackPlaces;
  }
}

async function loadJson(path, fallback) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    return await response.json();
  } catch (error) {
    return fallback;
  }
}

function renderTrip(trip) {
  dateRange.textContent = trip.dateRange;
  tripTitle.textContent = trip.title;
  if (tripSubtitle) {
    tripSubtitle.textContent = `성인 ${trip.family.adults} · 아이 ${trip.family.children.length} · ${trip.planningMode}`;
  }
  if (criteriaChips) {
    criteriaChips.innerHTML = [
      ...(trip.decisionCriteria || []),
      trip.dataAsOf ? `정보 기준 ${trip.dataAsOf}` : ""
    ]
      .filter(Boolean)
      .map((item) => `<span class="pill">${item}</span>`)
      .join("");
  }
  if (nextDecision) nextDecision.textContent = trip.nextDecision;
  if (expertSummaryRoot) {
    expertSummaryRoot.innerHTML = `
      <article>
        <span>핵심 결론</span>
        <strong>하얏트에서 쉬기 + 바나힐은 전날 정하기 + 호이안 저녁 + 마지막 날 시내 정리</strong>
      </article>
      <article>
        <span>정보 기준일</span>
        <strong>${trip.dataAsOf || "확인일 미기재"}</strong>
        <p>${trip.freshnessPolicy || "영업시간과 요금은 방문 직전 재확인합니다."}</p>
      </article>
      ${(trip.notes || [])
        .map((note) => `
          <article>
            <span>여행 팁</span>
            <p>${note}</p>
          </article>
        `)
        .join("")}
    `;
  }
}

function renderTodayPanel({ trip, days, decisions, hotels, places, checklist, mapRoutes }) {
  renderCurrentStateCard(trip, days, checklist);
  renderTodayDayBoard(days, places, null, mapRoutes);
  renderPlacePreviewCard(places);
  renderNextPlanCard(decisions, places);
  renderFallbackList(places);
  renderCompactHotelFlow(hotels);
}

function getFocusDay(days) {
  const now = new Date();
  const tripStart = new Date("2026-07-24T00:00:00+09:00");
  if (now < tripStart) return days[0] || null;
  const monthDay = `${now.getMonth() + 1}/${String(now.getDate()).padStart(2, "0")}`;
  return days.find((day) => day.date.startsWith(monthDay)) || days[0] || null;
}

function renderTodayDayBoard(days, places, selectedDayId, mapRoutes = allMapRoutes) {
  if (!todayDayBoardRoot) return;
  const activeDay = days.find((day) => day.id === selectedDayId) || getFocusDay(days);
  if (!activeDay) {
    todayDayBoardRoot.innerHTML = "";
    return;
  }
  const placeById = new Map(places.map((place) => [place.id, place]));
  const dayKey = activeDay.date.split(" ")[0];
  const dayRoutes = mapRoutes.filter((route) => route.day.startsWith(dayKey)).slice(0, 3);
  todayDayBoardRoot.innerHTML = `
    <article class="today-action-card">
      <div class="section-heading compact-heading">
        <p class="eyebrow">날짜별 바로 실행</p>
        <h2>${activeDay.date} · ${activeDay.theme}</h2>
      </div>
      <div class="today-day-strip" aria-label="여행 날짜">
        ${days
          .map((day) => `
            <button class="${day.id === activeDay.id ? "is-active" : ""}" type="button" data-today-day-id="${day.id}">
              <span>${day.label}</span>
              <strong>${day.date}</strong>
            </button>
          `)
          .join("")}
      </div>
      <p class="today-action-summary">${activeDay.theme} 기준으로 필요한 것만 봅니다.</p>
      ${
        activeDay.fatherCheck?.length
          ? `<div class="today-checks">
              ${activeDay.fatherCheck.map((item) => `<span>${item}</span>`).join("")}
            </div>`
          : ""
      }
      <div class="today-timeline">
        ${(activeDay.blocks || [])
          .map((block) => `
            <div class="today-timeline-row">
              <span>${block.time}</span>
              <div>
                <strong>${block.title}</strong>
                <p>${block.note}</p>
                ${
                  block.placeIds?.length
                    ? `<div class="slot-places">
                        ${block.placeIds
                          .slice(0, 4)
                          .map((id) => `<button class="place-chip" type="button" data-scenario-place-id="${id}">${placeById.get(id)?.name || id}</button>`)
                          .join("")}
                      </div>`
                    : ""
                }
              </div>
            </div>
          `)
          .join("")}
      </div>
      ${
        dayRoutes.length
          ? `<div class="today-route-links">
              <span>오늘 동선</span>
              ${dayRoutes.map((route) => `<a href="${route.mapsUrl}" target="_blank" rel="noreferrer">${route.title}</a>`).join("")}
            </div>`
          : ""
      }
      <div class="card-actions">
        <button type="button" data-jump-tab="schedule">전체 일정 보기</button>
      </div>
    </article>
  `;
}

function renderNextPlanCard(decisions, places) {
  if (!nextDecisionCardRoot) return;
  const decision = decisions.find((item) => item.title.includes("바나힐")) || decisions[0];
  if (!decision) {
    nextDecisionCardRoot.innerHTML = "";
    return;
  }
  nextDecisionCardRoot.innerHTML = `
    <div class="section-heading compact-heading">
      <p class="eyebrow">다음에 정할 일</p>
      <h2>바나힐은 전날 정하기</h2>
    </div>
    <p>7/26 밤 또는 7/27 아침에 날씨와 아이 컨디션을 보고 정하세요.</p>
    <div class="card-actions">
      <button type="button" data-decision-id="${decision.id}">자세히 보기</button>
    </div>
  `;
}

function renderCurrentStateCard(trip, days, checklist) {
  if (!currentStateCardRoot) return;
  const tripStart = new Date("2026-07-24T00:00:00+09:00");
  const tripEnd = new Date("2026-07-29T23:59:59+09:00");
  const now = new Date();
  const requiredItems = checklist.flatMap((group) => group.items || []).filter((item) => item.status === "필수");
  if (now < tripStart) {
    currentStateCardRoot.innerHTML = `
      <div class="section-heading compact-heading">
        <p class="eyebrow">출발 전에 이것만</p>
        <h2>항공·숙소·수하물부터 확인</h2>
      </div>
      <p>체크인·수하물·호텔 조건부터 확인합니다.</p>
      <div class="current-state-grid">
        <div>
          <span>남은 확인</span>
          <strong>${requiredItems.length}개</strong>
        </div>
        <div>
          <span>먼저 볼 것</span>
          <strong>항공 · 호텔 · 아이 음식</strong>
        </div>
      </div>
      <div class="card-actions">
        <button type="button" data-jump-tab="prep">준비 체크</button>
      </div>
    `;
    return;
  }
  if (now > tripEnd) {
    currentStateCardRoot.innerHTML = `
      <div class="section-heading compact-heading">
        <p class="eyebrow">여행 종료</p>
        <h2>기록과 정산 확인</h2>
      </div>
      <p>여행 메모, 실제 방문 장소, 영수증과 사진을 정리하는 상태입니다.</p>
    `;
    return;
  }
  const day = days.find((item) => item.date === now.toISOString().slice(0, 10)) || days[0];
  currentStateCardRoot.innerHTML = `
    <div class="section-heading compact-heading">
      <p class="eyebrow">오늘 일정</p>
      <h2>${day.theme}</h2>
    </div>
    <p>${day.summary}</p>
    <div class="card-actions">
      <button type="button" data-jump-tab="schedule">전체 일정</button>
      <button type="button" data-jump-tab="places">가볼 곳 보기</button>
    </div>
  `;
}

function renderPlacePreviewCard(places) {
  if (!placePreviewCardRoot) return;
  const previewPlaces = ["hoi-an-evening", "hyatt-resort-time", "ba-na-hills"]
    .map((id) => places.find((place) => place.id === id))
    .filter(Boolean);
  placePreviewCardRoot.innerHTML = `
    <div class="section-heading compact-heading">
      <p class="eyebrow">가볼 곳</p>
      <h2>아이들과 가기 좋은 곳만 모았어요</h2>
    </div>
    <p>호이안, 하얏트, 바나힐, 시내 쇼핑을 편하게 볼 수 있습니다.</p>
    <div class="slot-places">
      ${previewPlaces
        .map((place) => `<button class="place-chip" type="button" data-scenario-place-id="${place.id}">${place.name}</button>`)
        .join("")}
    </div>
    <div class="card-actions">
      <button type="button" data-jump-tab="places">가볼 곳 보기</button>
    </div>
  `;
}

function renderFallbackList(places) {
  if (!fallbackListRoot) return;
  const preferredIds = ["hyatt-resort-time", "hyatt-camp-hyatt", "lotte-mart-danang", "mm-mega-market-danang", "mikazuki-water-park"];
  const fallbackPlaces = preferredIds
    .map((id) => places.find((place) => place.id === id))
    .filter(Boolean)
    .concat(places.filter((place) => place.status === "backup"))
    .filter((place, index, list) => list.findIndex((item) => item.id === place.id) === index)
    .slice(0, 3);
  fallbackListRoot.innerHTML = `
    <article class="easy-summary-card">
      <div class="section-heading compact-heading">
        <p class="eyebrow">가볍게 보내기</p>
        <h2>더위·비·피곤한 날엔</h2>
      </div>
      <p class="soft-copy">리조트 안에서 쉬어도 좋은 일정입니다.</p>
      <div class="mini-place-list">
        ${fallbackPlaces
          .slice(0, 2)
          .map((place) => `
            <button class="mini-place-card" type="button" data-place-id="${place.id}">
              <strong>${place.name}</strong>
              <span>${place.bestTime}</span>
            </button>
          `)
          .join("")}
      </div>
      <div class="card-actions">
        <button type="button" data-jump-tab="places">쉬운 일정 보기</button>
      </div>
    </article>
  `;
}

function renderCompactHotelFlow(hotels) {
  if (!hotelFlowCompactRoot) return;
  hotelFlowCompactRoot.innerHTML = `
    <div class="section-heading compact-heading">
      <p class="eyebrow">확정 흐름</p>
      <h2>숙소 이동</h2>
    </div>
    ${hotels
      .map((hotel) => `
        <article>
          <span class="date">${hotel.dateLabel}</span>
          <h3>${hotel.name}</h3>
        </article>
      `)
      .join("")}
  `;
}

function renderHotels(hotels) {
  hotelFlowRoot.innerHTML = hotels
    .map((hotel) => `
      <article>
        <span class="date">${hotel.dateLabel}</span>
        <h3>${hotel.name}</h3>
        <p>${hotel.summary}</p>
      </article>
    `)
    .join("");
}

function renderHyattPrograms(programs) {
  if (!hyattProgramListRoot) return;
  hyattProgramListRoot.innerHTML = programs
    .map((program) => `
      <article class="hyatt-program">
        <div class="meta-row">
          <span class="pill">${program.category}</span>
          <span class="pill status">${program.recommendation}</span>
        </div>
        <h3>${program.name}</h3>
        <p>${program.summary}</p>
        <div class="hyatt-program-grid">
          <div>
            <span>대상</span>
            <strong>${program.bestFor}</strong>
          </div>
          <div>
            <span>운영/시간</span>
            <strong>${program.hours}</strong>
          </div>
          <div>
            <span>가족 활용</span>
            <strong>${program.familyUse}</strong>
          </div>
          <div>
            <span>확인</span>
            <strong>${program.caution}</strong>
          </div>
        </div>
        <div class="card-actions">
          <a class="primary" href="${program.sourceUrl}" target="_blank" rel="noreferrer">공식 정보</a>
        </div>
      </article>
    `)
    .join("");
}

function renderDays(days, places) {
  const placeById = new Map(places.map((place) => [place.id, place]));
  dayListRoot.innerHTML = days
    .map((day) => `
      <article class="day-card">
        <div class="day-top">
          <span>${day.label} · ${day.date}</span>
          <span class="pill ${getStatusClass(day.certainty)}">${getUiStatus(day.certainty)}</span>
        </div>
        <h3>${day.theme}</h3>
        <div class="day-base">${day.base}</div>
        <p>${day.summary}</p>
        ${
          day.fatherCheck?.length
            ? `<div class="day-parent-check">
                <span>오늘의 판단</span>
                <ul>
                  ${day.fatherCheck.map((item) => `<li>${item}</li>`).join("")}
                </ul>
              </div>`
            : ""
        }
        ${
          day.fallbacks?.length
            ? `<div class="day-fallbacks">
                ${day.fallbacks
                  .map((item) => `
                    <div>
                      <span>${item.if}</span>
                      <strong>${item.then}</strong>
                    </div>
                  `)
                  .join("")}
              </div>`
            : ""
        }
        ${
          day.mapPointIds?.length
            ? `<div class="day-map-row">
                ${day.mapPointIds
                  .map((id) => {
                    const point = getMapPoint(id);
                    return point ? `<a href="${point.mapsUrl}" target="_blank" rel="noreferrer">${point.name}</a>` : "";
                  })
                  .join("")}
              </div>`
            : ""
        }
        <div class="day-blocks">
          ${day.blocks
            .map((block) => `
              <div class="day-block">
                <div class="day-block-head">
                  <strong>${block.title}</strong>
                  <span>${block.time}</span>
                </div>
                <p>${block.note}</p>
                ${
                  block.placeIds
                    ? `<div class="slot-places">
                        ${block.placeIds
                          .map((id) => `<button class="place-chip" type="button" data-scenario-place-id="${id}">${placeById.get(id)?.name || id}</button>`)
                          .join("")}
                      </div>`
                    : ""
                }
              </div>
            `)
            .join("")}
        </div>
      </article>
    `)
    .join("");
}

function renderChecklist(groups) {
  const savedState = loadChecklistState();
  checklistRoot.innerHTML = groups
    .map((group) => `
      <article class="checklist-group">
        <h3>${group.group}</h3>
        <ul>
          ${group.items
            .map((item) => {
              const checked = savedState[item.id] || false;
              return `
              <li>
                <input class="check-input" type="checkbox" data-check-id="${item.id}" ${checked ? "checked" : ""}>
                <span class="check-label ${checked ? "is-done" : ""}">${item.label}</span>
                <span class="check-status">${item.status}</span>
              </li>
            `;
            })
            .join("")}
        </ul>
      </article>
    `)
    .join("");
}

function loadChecklistState() {
  try {
    return JSON.parse(localStorage.getItem(checklistStorageKey)) || {};
  } catch (error) {
    return {};
  }
}

function saveChecklistState(id, checked) {
  const state = loadChecklistState();
  state[id] = checked;
  localStorage.setItem(checklistStorageKey, JSON.stringify(state));
}

function renderScenarios(scenarios, places) {
  const placeById = new Map(places.map((place) => [place.id, place]));
  scenarioListRoot.innerHTML = scenarios
    .map((scenario) => `
      <article class="scenario-card">
        <div class="meta-row">
          <span class="pill">${scenario.label}</span>
          <span class="pill ${getStatusClass(scenario.status)}">${getUiStatus(scenario.status)}</span>
        </div>
        <h3>${scenario.name}</h3>
        <p>${scenario.bestFor}</p>
        <p class="tradeoff">${scenario.tradeoff}</p>
        <div class="scenario-slots">
          ${scenario.slots
            .map((slot) => `
              <div class="scenario-slot">
                <div class="slot-head">
                  <strong>${slot.day}</strong>
                  <span>${slot.date}</span>
                </div>
                <p class="slot-focus">${slot.focus}</p>
                <div class="slot-places">
                  ${slot.placeIds
                    .map((id) => `<button class="place-chip" type="button" data-scenario-place-id="${id}">${placeById.get(id)?.name || id}</button>`)
                    .join("")}
                </div>
              </div>
            `)
            .join("")}
        </div>
      </article>
    `)
    .join("");
}

function renderDecisions(decisions, places) {
  if (!decisionListRoot) return;
  const placeById = new Map(places.map((place) => [place.id, place]));
  decisionListRoot.innerHTML = decisions
    .map((decision) => `
      <article class="decision-item">
        <div class="meta-row">
          <span class="pill">현지에서</span>
          <span class="pill">${decision.when}</span>
        </div>
        <h3>${decision.title}</h3>
        <div class="decision-grid">
          <div>
            <span>가기 좋은 날</span>
            <strong>${decision.go}</strong>
          </div>
          <div>
            <span>쉬는 게 나은 날</span>
            <strong>${decision.skip}</strong>
          </div>
          <div>
            <span>이렇게 바꾸기</span>
            <strong>${decision.fallback}</strong>
          </div>
        </div>
        <div class="slot-places">
          ${decision.relatedPlaceIds
            .map((id) => `<button class="place-chip" type="button" data-scenario-place-id="${id}">${placeById.get(id)?.name || id}</button>`)
            .join("")}
        </div>
      </article>
    `)
    .join("");
}

function renderLiveFeatures(features) {
  liveFeaturesRoot.innerHTML = features
    .map((feature) => `
      <article class="live-feature">
        <div class="meta-row">
          <span class="pill">${feature.status}</span>
        </div>
        <h3>${feature.name}</h3>
        <p>${feature.useCase}</p>
        <dl>
          <div>
            <dt>현재 모드</dt>
            <dd>${feature.currentMode}</dd>
          </div>
          <div>
            <dt>정보 소스</dt>
            <dd>${feature.source}</dd>
          </div>
        </dl>
      </article>
    `)
    .join("");
}

function renderKoreanReviews(reviews, places) {
  const placeById = new Map(places.map((place) => [place.id, place]));
  koreanReviewsRoot.innerHTML = reviews
    .map((review) => `
      <article class="review-item">
        <div class="meta-row">
          <span class="pill">한국어 후기</span>
          <span class="pill status">${review.topic}</span>
        </div>
        <h3>${review.topic}</h3>
        <p>${review.signal}</p>
        <div class="decision-note">${review.watchFor}</div>
        <div class="slot-places">
          ${review.relatedPlaceIds
            .map((id) => `<button class="place-chip" type="button" data-scenario-place-id="${id}">${placeById.get(id)?.name || id}</button>`)
            .join("")}
        </div>
        <div class="card-actions">
          <a class="primary" href="${review.sourceUrl}" target="_blank" rel="noreferrer">${review.sourceName}</a>
        </div>
      </article>
    `)
    .join("");
}

function renderTransport(routes) {
  transportListRoot.innerHTML = routes
    .map((route) => `
      <article class="transport-item">
        <div class="meta-row">
          <span class="pill">${route.phase}</span>
          <span class="pill status">${route.status}</span>
        </div>
        <h3>${route.route}</h3>
        <p>${route.familyNote}</p>
        <div class="transport-grid">
          <div>
            <span>좋은 이동</span>
            <strong>${route.recommendedMode}</strong>
          </div>
          <div>
            <span>리스크</span>
            <strong>${route.risk}</strong>
          </div>
        </div>
      </article>
    `)
    .join("");
}

function renderAirlineInfo(items) {
  if (!airlineInfoListRoot) return;
  airlineInfoListRoot.innerHTML = items
    .map((item) => `
      <article class="airline-info-item">
        <div class="meta-row">
          <span class="pill">${item.category}</span>
          <span class="pill status">${item.priority}</span>
        </div>
        <h3>${item.title}</h3>
        <p>${item.summary}</p>
        <div class="shopping-grid">
          <div>
            <span>가족 적용</span>
            <strong>${item.familyAction}</strong>
          </div>
          <div>
            <span>주의</span>
            <strong>${item.caution}</strong>
          </div>
        </div>
        <div class="card-actions">
          <a class="primary" href="${item.sourceUrl}" target="_blank" rel="noreferrer">공식 정보</a>
        </div>
      </article>
    `)
    .join("");
}

function renderMapRoutes(routes) {
  if (!mapRouteListRoot) return;
  const priorityRouteIds = ["arrival-route", "hotel-transfer-hyatt", "hyatt-ba-na", "happy-day-hoi-an", "happy-day-city-food", "departure-route"];
  const orderedRoutes = [
    ...priorityRouteIds.map((id) => routes.find((route) => route.id === id)).filter(Boolean),
    ...routes.filter((route) => !priorityRouteIds.includes(route.id))
  ];
  mapRouteListRoot.innerHTML = orderedRoutes
    .map((route) => {
      const embedUrl = getEmbedDirectionsUrl(route);
      return `
        <article class="map-route-item">
          <div class="meta-row">
            <span class="pill">${route.day}</span>
            <span class="pill status">${route.mode}</span>
          </div>
          <h3>${route.title}</h3>
          <p>${route.summary}</p>
          ${embedUrl ? `<div class="route-map"><iframe title="${route.title} 동선 지도" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${embedUrl}"></iframe></div>` : ""}
          <div class="map-route-grid">
            <div>
              <span>출발</span>
              <strong>${route.origin}</strong>
            </div>
            <div>
              <span>도착</span>
              <strong>${route.destination}</strong>
            </div>
            ${
              route.waypoints?.length
                ? `<div>
                    <span>경유</span>
                    <strong>${route.waypoints.join(" · ")}</strong>
                  </div>`
                : ""
            }
            <div>
              <span>주의</span>
              <strong>${route.caution}</strong>
            </div>
          </div>
          <div class="card-actions">
            <a class="primary" href="${route.mapsUrl}" target="_blank" rel="noreferrer">Google Maps에서 열기</a>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderBudget(items) {
  budgetListRoot.innerHTML = items
    .map((item) => `
      <article class="budget-item">
        <div class="meta-row">
          <span class="pill">${item.level}</span>
        </div>
        <h3>${item.name}</h3>
        <p>${item.notes}</p>
        <div class="budget-grid">
          <div>
            <span>여행 메모</span>
            <strong>${item.decision}</strong>
          </div>
        </div>
      </article>
    `)
    .join("");
}

function renderShopping(items) {
  if (!shoppingListRoot) return;
  shoppingListRoot.innerHTML = `
    <article class="shopping-item shopping-summary">
      <div class="meta-row">
        <span class="pill">가족 쇼핑 결론</span>
        <span class="pill status">마지막 날</span>
      </div>
      <h3>한시장 60분 또는 정찰제 마트 1곳</h3>
      <p>아이 컨디션이 좋으면 한시장, 덥거나 피곤하면 GO!/Big C·롯데마트·MM Mega Market 중 동선 가까운 한 곳으로 단순화합니다.</p>
      <div class="shopping-grid">
        <div>
          <span>마트에서</span>
          <strong>커피, 건망고, 캐슈넛, 아이 간식, 물</strong>
        </div>
        <div>
          <span>한시장에서</span>
          <strong>옷, 작은 기념품, 과일은 짧게</strong>
        </div>
        <div>
          <span>초콜릿</span>
          <strong>Pheva·Marou·Alluvia, 마지막에 사고 바로 냉방</strong>
        </div>
        <div>
          <span>피할 것</span>
          <strong>여러 시장·마트 비교, 생과일 대량 구매, 긴 흥정</strong>
        </div>
      </div>
    </article>
    ${items
    .map((item) => `
      <article class="shopping-item">
        <div class="meta-row">
          <span class="pill">${item.category}</span>
          <span class="pill status">${item.priority}</span>
        </div>
        <h3>${item.title}</h3>
        <p>${item.familyNote}</p>
        <div class="shopping-grid">
          <div>
            <span>살 것</span>
            <strong>${item.buy}</strong>
          </div>
          <div>
            <span>피할 것</span>
            <strong>${item.avoid}</strong>
          </div>
          <div>
            <span>장소</span>
            <strong>${item.where}</strong>
          </div>
          <div>
            <span>다른 선택</span>
            <strong>${item.backup}</strong>
          </div>
        </div>
      </article>
    `)
    .join("")}
  `;
}

function renderPacking(groups) {
  packingListRoot.innerHTML = groups
    .map((group) => `
      <article class="packing-group">
        <h3>${group.group}</h3>
        <ul>
          ${group.items.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </article>
    `)
    .join("");
}

function renderEmergency(items) {
  emergencyListRoot.innerHTML = items
    .map((item) => `
      <article class="emergency-item">
        <div class="meta-row">
          <span class="pill status">${item.level}</span>
        </div>
        <h3>${item.title}</h3>
        <p>${item.note}</p>
      </article>
    `)
    .join("");
}

Promise.all([
  loadJson("data/trip.json", null),
  loadJson("data/hotels.json", []),
  loadJson("data/hyatt-programs.json", []),
  loadJson("data/days.json", []),
  loadJson("data/checklist.json", []),
  loadJson("data/scenarios.json", []),
  loadJson("data/decisions.json", []),
  loadJson("data/live-features.json", []),
  loadJson("data/korean-reviews.json", []),
  loadJson("data/airline-info.json", []),
  loadJson("data/transport.json", []),
  loadJson("data/map-routes.json", []),
  loadJson("data/budget.json", []),
  loadJson("data/shopping.json", []),
  loadJson("data/packing.json", []),
  loadJson("data/emergency.json", []),
  loadJson("data/map-points.json", []),
  loadPlaces()
]).then(([trip, hotels, hyattPrograms, days, checklist, scenarios, decisions, liveFeatures, koreanReviews, airlineInfo, transport, mapRoutes, budget, shopping, packing, emergency, mapPoints, places]) => {
  allPlaces = places;
  allReviews = koreanReviews;
  allMapPoints = mapPoints;
  allDecisions = decisions;
  allDays = days;
  allMapRoutes = mapRoutes;
  if (trip) renderTrip(trip);
  if (trip) renderTodayPanel({ trip, days, decisions, hotels, places, checklist, mapRoutes });
  renderHotels(hotels);
  renderHyattPrograms(hyattPrograms);
  renderDays(days, places);
  renderChecklist(checklist);
  renderScenarios(scenarios, places);
  renderDecisions(decisions, places);
  renderLiveFeatures(liveFeatures);
  renderKoreanReviews(koreanReviews, places);
  renderAirlineInfo(airlineInfo);
  renderTransport(transport);
  renderMapRoutes(mapRoutes);
  renderBudget(budget);
  renderShopping(shopping);
  renderPacking(packing);
  renderEmergency(emergency);
  updateCounts(places);
  renderCards(places);
  hydrateGooglePlaces(places);

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      filters.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      placeSetButtons.forEach((item) => item.classList.remove("is-active"));
      activePlaceSet = "";
      activeFilter = button.dataset.filter;
      renderCards(places);
      hydrateGooglePlaces(places);
    });
  });

  placeSetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      placeSetButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      activePlaceSet = button.dataset.placeSet;
      activeFilter = placeSets[activePlaceSet]?.filter || "all";
      filters.forEach((item) => {
        item.classList.toggle("is-active", item.dataset.filter === activeFilter);
      });
      renderCards(places);
      hydrateGooglePlaces(places);
    });
  });

  searchInput.addEventListener("input", () => renderCards(places));
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.tab));
  });
  activateInitialTabFromUrl();
  activateInitialPlaceSetFromUrl(places);
  openInitialPlaceFromUrl();
  hydrateFamilyNote();
});

function activateInitialTabFromUrl() {
  const tabId = new URLSearchParams(window.location.search).get("tab");
  if (!tabId || !tabButtons.some((button) => button.dataset.tab === tabId)) return;
  activateTab(tabId);
}

function openInitialPlaceFromUrl() {
  const placeId = new URLSearchParams(window.location.search).get("place");
  if (!placeId) return;
  window.setTimeout(() => openPlaceById(placeId), 700);
}

function activateInitialPlaceSetFromUrl(places) {
  const setId = new URLSearchParams(window.location.search).get("set");
  if (!setId || !placeSets[setId]) return;
  activePlaceSet = setId;
  activeFilter = placeSets[setId].filter || "all";
  placeSetButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.placeSet === setId);
    if (button.dataset.placeSet === setId) {
      button.scrollIntoView({ block: "nearest", inline: "center" });
    }
  });
  filters.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === activeFilter);
  });
  renderCards(places);
  hydrateGooglePlaces(places);
}

function hydrateFamilyNote() {
  familyNote.value = localStorage.getItem(noteStorageKey) || "";
  familyNote.addEventListener("input", () => {
    localStorage.setItem(noteStorageKey, familyNote.value);
    noteStatus.textContent = "저장됨";
    window.clearTimeout(hydrateFamilyNote.statusTimer);
    hydrateFamilyNote.statusTimer = window.setTimeout(() => {
      noteStatus.textContent = "로컬에 자동 저장됩니다.";
    }, 1200);
  });
}

cardsRoot.addEventListener("click", (event) => {
  const button = event.target.closest("[data-place-id]");
  if (!button) return;
  openPlaceById(button.dataset.placeId);
});

function openPlaceById(placeId) {
  const place = allPlaces.find((item) => item.id === placeId);
  if (place) openSheet(place);
}

function openDecisionById(decisionId) {
  const decision = allDecisions.find((item) => item.id === decisionId);
  if (decision) openDecisionSheet(decision);
}

function jumpToTab(tabId) {
  const target = tabButtons.find((button) => button.dataset.tab === tabId);
  if (target) activateTab(tabId);
}

document.body.addEventListener("click", (event) => {
  const jumpButton = event.target.closest("[data-jump-tab]");
  if (jumpButton) {
    jumpToTab(jumpButton.dataset.jumpTab);
    return;
  }
  const decisionButton = event.target.closest("[data-decision-id]");
  if (decisionButton) {
    openDecisionById(decisionButton.dataset.decisionId);
    return;
  }
  const todayDayButton = event.target.closest("[data-today-day-id]");
  if (todayDayButton) {
    renderTodayDayBoard(allDays, allPlaces, todayDayButton.dataset.todayDayId, allMapRoutes);
    return;
  }
  const placeButton = event.target.closest("#tab-today [data-place-id]");
  if (placeButton) {
    openPlaceById(placeButton.dataset.placeId);
    return;
  }
  const scenarioButton = event.target.closest("#tab-today [data-scenario-place-id]");
  if (scenarioButton) {
    openPlaceById(scenarioButton.dataset.scenarioPlaceId);
    return;
  }
  const mapRefreshButton = event.target.closest("[data-map-refresh]");
  if (mapRefreshButton) {
    renderCards(allPlaces);
  }
});

scenarioListRoot.addEventListener("click", (event) => {
  const button = event.target.closest("[data-scenario-place-id]");
  if (!button) return;
  const place = allPlaces.find((item) => item.id === button.dataset.scenarioPlaceId);
  if (place) openSheet(place);
});

decisionListRoot.addEventListener("click", (event) => {
  const button = event.target.closest("[data-scenario-place-id]");
  if (!button) return;
  const place = allPlaces.find((item) => item.id === button.dataset.scenarioPlaceId);
  if (place) openSheet(place);
});

dayListRoot.addEventListener("click", (event) => {
  const button = event.target.closest("[data-scenario-place-id]");
  if (!button) return;
  const place = allPlaces.find((item) => item.id === button.dataset.scenarioPlaceId);
  if (place) openSheet(place);
});

checklistRoot.addEventListener("change", (event) => {
  const input = event.target.closest("[data-check-id]");
  if (!input) return;
  saveChecklistState(input.dataset.checkId, input.checked);
  input.parentElement.querySelector(".check-label").classList.toggle("is-done", input.checked);
});

sheet.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-sheet]")) {
    closeSheet();
    return;
  }
  const scenarioButton = event.target.closest("[data-scenario-place-id]");
  if (scenarioButton) {
    openPlaceById(scenarioButton.dataset.scenarioPlaceId);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && sheet.classList.contains("is-open")) {
    closeSheet();
  }
});
