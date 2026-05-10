# API And Live Data Roadmap

The first version can run without paid APIs, but live data is a strong direction for turning this from a static planbook into a more useful travel reference.

## Live Capabilities To Add

### Current Business Status
- Goal: Show whether a restaurant, market, attraction, or cafe is currently open.
- Best source: Google Places API or official site when available.
- UI idea: `Open now`, `Closes soon`, `Check before going`.
- Risk: Opening hours can be wrong during holidays or private events.

### Maps And Routes
- Goal: Show hotel-to-place route links, estimated transfer time, and map launch buttons.
- Candidate APIs:
  - Google Places API
  - Google Maps Directions API
- Lower-friction option:
  - Store Google Maps search links first without an API key.
- UI idea: `From Hyatt`, `From Happy Day`, `Open in Maps`.
- Data shape:
  - `data/map-points.json` stores display name, address, fallback Google Maps URL, future `googlePlaceId`, and future `coordinates`.
  - Version 1 uses search URLs.
  - Later versions can replace search URLs with Place Details, Directions, Distance Matrix, and Photos data.

### Weather
- Goal: Recommend outdoor, indoor, or rest-heavy plans based on heat and rain.
- Candidate APIs:
  - OpenWeather
  - WeatherAPI
  - Meteostat or similar historical weather source
- UI idea: `Outdoor OK`, `Heat caution`, `Rain backup`.
- Travel timing: Most useful from 7-10 days before departure.

### Exchange Rates
- Goal: Convert VND budget estimates into KRW for quick family decisions.
- Candidate APIs:
  - exchangerate.host
  - Open Exchange Rates
  - Wise public rate page as manual reference
- UI idea: Toggle `VND` / `KRW`.

### Live Or Recent Prices
- Goal: Show approximate activity ticket, transport, and meal cost ranges.
- Candidate sources:
  - Official attraction websites
  - Travel activity platforms
  - Manual curated data in `data/places.json`
- API caution: Real ticket prices often need partner APIs or scraping, which is brittle.
- Recommended approach: Keep manually curated price ranges first, add source links.

### Flight Status And Airport Timing
- Goal: Adjust airport arrival, transfer, and sleep plan if flights change.
- Candidate APIs:
  - FlightAware
  - Aviationstack
- Tradeoff: Useful near travel day, often paid, and not needed during early planning.

### Place Images
- Goal: Show representative photos for cards.
- Candidate sources:
  - User-provided photos
  - Licensed Wikimedia Commons images
  - Generated images for non-specific visual placeholders
  - Google Places photos only if API terms are followed
- Recommended approach: Use local assets with source notes.

## Recommended Approach
- Version 1: Static curated data in `data/places.json`.
- Version 2: Add coordinates, Google Maps links, and local representative images.
- Version 3: Add weather and exchange-rate APIs.
- Version 4: Add Google Places for current open status and place metadata.
- Version 5: Add flight status close to travel date if useful.

## Data We Can Store Without APIs
- Google Maps search URL or place URL
- Official website URL
- Source URL
- Area label
- Estimated transfer note
- Family fit
- Best time
- Heat/rain caution
- Decision status

## API Key Handling
- Do not commit API keys to GitHub.
- Use a local `.env` file for development if APIs are added.
- For GitHub Pages, prefer API-free data or a small backend/proxy if secret keys are required.
- Public client-side API keys need strict domain restrictions.
