// ============================================================
// Deterministic fixture data — demonstration case OS-1042
// Coordinates are synthetic, situated in the Arabian Sea off
// the west coast of India, near a busy shipping corridor.
// ============================================================

import type {
  AISAnalysis,
  ForecastResult,
  HindcastResult,
  OilSlick,
  SatelliteObservation,
  Vessel,
} from "../types";

export const DEMO_CASE_ID = "OS-1042";

export const FIXTURE_OBSERVATION: SatelliteObservation = {
  id: "obs-1042",
  source: "SAR",
  imageryType: "Sentinel-style SAR",
  observationTime: "2026-09-17T02:14:00Z",
  assetLabel: "Sentinel-1 SAR Observation",
  thumbnailSeed: "os1042",
};

// Slick polygon — irregular elongated shape typical of a surface slick
export const FIXTURE_SLICK: OilSlick = {
  confidence: 94,
  areaKm2: 18.4,
  estimatedAgeHours: 8,
  perimeterKm: 22.7,
  centroid: { latitude: 12.958, longitude: 72.268 },
  detectionTimestamp: "2026-09-17T02:14:00Z",
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [72.201, 12.981],
        [72.229, 12.992],
        [72.261, 12.986],
        [72.296, 12.971],
        [72.321, 12.958],
        [72.318, 12.941],
        [72.289, 12.933],
        [72.254, 12.929],
        [72.223, 12.936],
        [72.201, 12.952],
        [72.196, 12.968],
        [72.201, 12.981],
      ],
    ],
  },
};

export const FIXTURE_HINDCAST: HindcastResult = {
  originZone: { latitude: 12.941, longitude: 72.231 },
  originUncertaintyRadiusKm: 3.2,
  estimatedOriginTime: "2026-09-16T18:30:00Z",
  confidence: 81,
  path: {
    type: "LineString",
    coordinates: [
      [72.268, 12.958],
      [72.259, 12.951],
      [72.248, 12.946],
      [72.238, 12.939],
      [72.231, 12.941],
    ],
  },
};

export const FIXTURE_FORECAST: ForecastResult = {
  horizonHours: 6,
  direction: "East-northeast, driven by prevailing surface current",
  confidence: 68,
  path: {
    type: "LineString",
    coordinates: [
      [72.268, 12.958],
      [72.281, 12.967],
      [72.298, 12.979],
      [72.317, 12.993],
      [72.336, 13.006],
    ],
  },
  affectedArea: {
    type: "Polygon",
    coordinates: [
      [
        [72.29, 12.97],
        [72.31, 12.985],
        [72.345, 13.0],
        [72.35, 13.02],
        [72.33, 13.03],
        [72.3, 13.01],
        [72.278, 12.99],
        [72.29, 12.97],
      ],
    ],
  },
};

export const FIXTURE_AIS_ANALYSIS: AISAnalysis = {
  vesselsAnalyzed: 11,
  vesselsFiltered: 7,
  windowStart: "2026-09-16T12:00:00Z",
  windowEnd: "2026-09-17T02:14:00Z",
};

// 11 vessels total: 4 candidates (3 "serious" + 1 low), 7 background traffic
// that gets filtered out during AIS correlation. Trajectories are
// geographically coherent relative to the slick / origin above.

export const FIXTURE_VESSELS: Vessel[] = [
  {
    id: "v-ocean-star",
    name: "MV Ocean Star",
    imo: "IMO 9412337",
    vesselType: "Crude Oil Tanker",
    flag: "Panama",
    trajectory: [
      { timestamp: "2026-09-16T17:00:00Z", latitude: 12.902, longitude: 72.178, speedKnots: 13.2, headingDeg: 42 },
      { timestamp: "2026-09-16T18:00:00Z", latitude: 12.918, longitude: 72.198, speedKnots: 12.8, headingDeg: 44 },
      { timestamp: "2026-09-16T18:30:00Z", latitude: 12.933, longitude: 72.219, speedKnots: 11.4, headingDeg: 46 },
      { timestamp: "2026-09-16T19:00:00Z", latitude: 12.946, longitude: 72.236, speedKnots: 9.6, headingDeg: 51 },
      { timestamp: "2026-09-16T19:30:00Z", latitude: 12.951, longitude: 72.249, speedKnots: 10.1, headingDeg: 58 },
      { timestamp: "2026-09-16T20:15:00Z", latitude: 12.957, longitude: 72.266, speedKnots: 13.5, headingDeg: 63 },
      { timestamp: "2026-09-16T21:00:00Z", latitude: 12.968, longitude: 72.289, speedKnots: 14.1, headingDeg: 66 },
    ],
  },
  {
    id: "v-sea-trader",
    name: "Sea Trader",
    imo: "IMO 9256841",
    vesselType: "Product Tanker",
    flag: "Marshall Islands",
    trajectory: [
      { timestamp: "2026-09-16T16:30:00Z", latitude: 12.86, longitude: 72.31, speedKnots: 14.8, headingDeg: 288 },
      { timestamp: "2026-09-16T17:30:00Z", latitude: 12.89, longitude: 72.28, speedKnots: 14.2, headingDeg: 292 },
      { timestamp: "2026-09-16T18:30:00Z", latitude: 12.916, longitude: 72.259, speedKnots: 13.9, headingDeg: 289 },
      { timestamp: "2026-09-16T19:30:00Z", latitude: 12.939, longitude: 72.238, speedKnots: 13.1, headingDeg: 291 },
      { timestamp: "2026-09-16T20:30:00Z", latitude: 12.961, longitude: 72.214, speedKnots: 13.6, headingDeg: 287 },
      { timestamp: "2026-09-16T21:30:00Z", latitude: 12.984, longitude: 72.191, speedKnots: 14.4, headingDeg: 290 },
    ],
  },
  {
    id: "v-pacific-wind",
    name: "Pacific Wind",
    imo: "IMO 9188023",
    vesselType: "Bulk Carrier",
    flag: "Liberia",
    trajectory: [
      { timestamp: "2026-09-16T15:00:00Z", latitude: 13.05, longitude: 72.05, speedKnots: 15.6, headingDeg: 190 },
      { timestamp: "2026-09-16T16:30:00Z", latitude: 13.01, longitude: 72.09, speedKnots: 15.1, headingDeg: 195 },
      { timestamp: "2026-09-16T18:00:00Z", latitude: 12.97, longitude: 72.13, speedKnots: 14.7, headingDeg: 198 },
      { timestamp: "2026-09-16T19:30:00Z", latitude: 12.93, longitude: 72.17, speedKnots: 14.9, headingDeg: 201 },
      { timestamp: "2026-09-16T21:00:00Z", latitude: 12.9, longitude: 72.2, speedKnots: 15.3, headingDeg: 205 },
    ],
  },
  {
    id: "v-northern-glory",
    name: "Northern Glory",
    imo: "IMO 9331456",
    vesselType: "Container Ship",
    flag: "Singapore",
    trajectory: [
      { timestamp: "2026-09-16T14:00:00Z", latitude: 13.2, longitude: 72.4, speedKnots: 18.2, headingDeg: 250 },
      { timestamp: "2026-09-16T16:00:00Z", latitude: 13.12, longitude: 72.31, speedKnots: 18.0, headingDeg: 248 },
      { timestamp: "2026-09-16T18:00:00Z", latitude: 13.03, longitude: 72.23, speedKnots: 17.6, headingDeg: 252 },
      { timestamp: "2026-09-16T20:00:00Z", latitude: 12.95, longitude: 72.14, speedKnots: 17.9, headingDeg: 249 },
    ],
  },
  // Background traffic — filtered during AIS correlation (outside relevant window/corridor)
  {
    id: "v-horizon-trader",
    name: "Horizon Trader",
    imo: "IMO 9077213",
    vesselType: "General Cargo",
    flag: "Malta",
    trajectory: [
      { timestamp: "2026-09-16T09:00:00Z", latitude: 13.6, longitude: 71.6, speedKnots: 12.1, headingDeg: 120 },
      { timestamp: "2026-09-16T12:00:00Z", latitude: 13.4, longitude: 71.9, speedKnots: 12.4, headingDeg: 118 },
      { timestamp: "2026-09-16T15:00:00Z", latitude: 13.2, longitude: 72.2, speedKnots: 12.0, headingDeg: 121 },
    ],
  },
  {
    id: "v-star-mariner",
    name: "Star Mariner",
    imo: "IMO 9440198",
    vesselType: "LPG Carrier",
    flag: "Greece",
    trajectory: [
      { timestamp: "2026-09-16T20:00:00Z", latitude: 11.9, longitude: 72.9, speedKnots: 16.3, headingDeg: 305 },
      { timestamp: "2026-09-16T22:00:00Z", latitude: 12.05, longitude: 72.7, speedKnots: 16.0, headingDeg: 303 },
      { timestamp: "2026-09-17T00:00:00Z", latitude: 12.2, longitude: 72.5, speedKnots: 16.5, headingDeg: 306 },
    ],
  },
  {
    id: "v-coral-express",
    name: "Coral Express",
    imo: "IMO 9502217",
    vesselType: "Container Ship",
    flag: "Panama",
    trajectory: [
      { timestamp: "2026-09-16T05:00:00Z", latitude: 12.5, longitude: 71.4, speedKnots: 19.4, headingDeg: 60 },
      { timestamp: "2026-09-16T08:00:00Z", latitude: 12.7, longitude: 71.8, speedKnots: 19.1, headingDeg: 58 },
      { timestamp: "2026-09-16T11:00:00Z", latitude: 12.9, longitude: 72.2, speedKnots: 19.6, headingDeg: 61 },
    ],
  },
  {
    id: "v-amber-voyager",
    name: "Amber Voyager",
    imo: "IMO 9366721",
    vesselType: "Product Tanker",
    flag: "Marshall Islands",
    trajectory: [
      { timestamp: "2026-09-17T00:30:00Z", latitude: 13.3, longitude: 72.05, speedKnots: 11.8, headingDeg: 175 },
      { timestamp: "2026-09-17T01:30:00Z", latitude: 13.15, longitude: 72.08, speedKnots: 11.5, headingDeg: 178 },
      { timestamp: "2026-09-17T02:14:00Z", latitude: 13.02, longitude: 72.1, speedKnots: 11.9, headingDeg: 176 },
    ],
  },
  {
    id: "v-southern-cross",
    name: "Southern Cross",
    imo: "IMO 9218845",
    vesselType: "Bulk Carrier",
    flag: "Hong Kong",
    trajectory: [
      { timestamp: "2026-09-16T13:00:00Z", latitude: 12.1, longitude: 71.5, speedKnots: 13.7, headingDeg: 30 },
      { timestamp: "2026-09-16T16:00:00Z", latitude: 12.3, longitude: 71.75, speedKnots: 13.4, headingDeg: 32 },
      { timestamp: "2026-09-16T19:00:00Z", latitude: 12.5, longitude: 72.0, speedKnots: 13.9, headingDeg: 29 },
    ],
  },
  {
    id: "v-blue-falcon",
    name: "Blue Falcon",
    imo: "IMO 9145520",
    vesselType: "Fishing Vessel",
    flag: "India",
    trajectory: [
      { timestamp: "2026-09-16T18:00:00Z", latitude: 12.7, longitude: 72.6, speedKnots: 7.2, headingDeg: 15 },
      { timestamp: "2026-09-16T20:00:00Z", latitude: 12.78, longitude: 72.62, speedKnots: 6.8, headingDeg: 12 },
      { timestamp: "2026-09-16T22:00:00Z", latitude: 12.85, longitude: 72.65, speedKnots: 7.0, headingDeg: 14 },
    ],
  },
  {
    id: "v-golden-eagle",
    name: "Golden Eagle",
    imo: "IMO 9389012",
    vesselType: "Chemical Tanker",
    flag: "Cyprus",
    trajectory: [
      { timestamp: "2026-09-16T03:00:00Z", latitude: 14.1, longitude: 72.3, speedKnots: 14.5, headingDeg: 210 },
      { timestamp: "2026-09-16T06:00:00Z", latitude: 13.9, longitude: 72.15, speedKnots: 14.2, headingDeg: 208 },
      { timestamp: "2026-09-16T09:00:00Z", latitude: 13.7, longitude: 72.0, speedKnots: 14.6, headingDeg: 212 },
    ],
  },
];
