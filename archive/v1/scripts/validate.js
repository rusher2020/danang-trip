const fs = require("fs");
const { execFileSync } = require("child_process");

const jsonFiles = [
  "data/trip.json",
  "data/hotels.json",
  "data/hyatt-programs.json",
  "data/days.json",
  "data/checklist.json",
  "data/scenarios.json",
  "data/decisions.json",
  "data/live-features.json",
  "data/korean-reviews.json",
  "data/airline-info.json",
  "data/transport.json",
  "data/map-routes.json",
  "data/budget.json",
  "data/shopping.json",
  "data/packing.json",
  "data/emergency.json",
  "data/map-points.json",
  "data/places.json"
];

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`${path}: ${error.message}`);
  }
}

for (const file of jsonFiles) {
  readJson(file);
}

const places = readJson("data/places.json");
const placeIds = new Set(places.map((place) => place.id));

if (placeIds.size !== places.length) {
  throw new Error("data/places.json: duplicate place id detected");
}

for (const place of places) {
  for (const field of ["id", "name", "category", "status", "summary", "kidPoint", "sourceUrl"]) {
    if (!place[field]) {
      throw new Error(`data/places.json: ${place.id || "(missing id)"} missing ${field}`);
    }
  }
}

for (const file of ["data/days.json", "data/scenarios.json", "data/korean-reviews.json", "data/decisions.json"]) {
  const data = readJson(file);
  const refs = [];
  JSON.stringify(data, (key, value) => {
    if ((key === "placeIds" || key === "relatedPlaceIds") && Array.isArray(value)) {
      refs.push(...value);
    }
    return value;
  });
  const missing = [...new Set(refs.filter((id) => !placeIds.has(id)))];
  if (missing.length) {
    throw new Error(`${file}: missing place refs ${missing.join(", ")}`);
  }
}

const mapRoutes = readJson("data/map-routes.json");
for (const route of mapRoutes) {
  for (const field of ["id", "title", "origin", "destination", "mapsUrl"]) {
    if (!route[field]) {
      throw new Error(`data/map-routes.json: ${route.id || "(missing id)"} missing ${field}`);
    }
  }
  if (!route.mapsUrl.startsWith("https://www.google.com/maps/dir/?api=1")) {
    throw new Error(`data/map-routes.json: ${route.id} mapsUrl should be a Google directions URL`);
  }
}

execFileSync("node", ["--check", "script.js"], { stdio: "inherit" });

console.log(`validate ok: ${jsonFiles.length} json files, ${places.length} places`);
