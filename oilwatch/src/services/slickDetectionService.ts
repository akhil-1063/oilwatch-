// Service interface for oil slick detection.
// PROTOTYPE: operates on deterministic local fixture data.
// FUTURE: swap the fixture branch for a call to a real SAR/EO ML inference API
// without changing the return contract (OilSlick).

import { FIXTURE_SLICK, DEMO_CASE_ID } from "../data/fixtures";
import type { CaseLocation, OilSlick } from "../types";
import { seededRangeFromString } from "../utils/seededRandom";
import { translatePolygon } from "../utils/geo";

export function detectOilSlick(caseId: string, location: CaseLocation): OilSlick {
  if (caseId === DEMO_CASE_ID) {
    return FIXTURE_SLICK;
  }

  // Deterministically derive a plausible slick anchored near the case's
  // reported incident location, reusing the fixture's shape/characteristics.
  const dLon = location.longitude - FIXTURE_SLICK.centroid.longitude + seededRangeFromString(caseId + "-lon", -0.01, 0.01);
  const dLat = location.latitude - FIXTURE_SLICK.centroid.latitude + seededRangeFromString(caseId + "-lat", -0.01, 0.01);

  const confidence = Math.round(seededRangeFromString(caseId + "-conf", 78, 97));
  const areaKm2 = Math.round(seededRangeFromString(caseId + "-area", 6, 24) * 10) / 10;
  const estimatedAgeHours = Math.round(seededRangeFromString(caseId + "-age", 3, 16));
  const perimeterKm = Math.round(seededRangeFromString(caseId + "-perim", 12, 28) * 10) / 10;

  return {
    confidence,
    areaKm2,
    estimatedAgeHours,
    perimeterKm,
    centroid: { latitude: location.latitude, longitude: location.longitude },
    detectionTimestamp: new Date().toISOString(),
    geometry: translatePolygon(FIXTURE_SLICK.geometry, dLon, dLat),
  };
}
