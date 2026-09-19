// Service interfaces for backward hindcast (probable origin reconstruction)
// and forward forecast (projected drift). PROTOTYPE: deterministic fixture
// data. FUTURE: swap for a real ocean-current / drift-model API call.

import { DEMO_CASE_ID, FIXTURE_FORECAST, FIXTURE_HINDCAST } from "../data/fixtures";
import type { CaseLocation, ForecastResult, HindcastResult, OilSlick } from "../types";
import { seededRangeFromString } from "../utils/seededRandom";
import { translateLine, translatePoint, translatePolygon } from "../utils/geo";

export function runHindcast(caseId: string, slick: OilSlick, _location: CaseLocation): HindcastResult {
  if (caseId === DEMO_CASE_ID) {
    return FIXTURE_HINDCAST;
  }

  const dLon = slick.centroid.longitude - FIXTURE_HINDCAST.path.coordinates[0][0];
  const dLat = slick.centroid.latitude - FIXTURE_HINDCAST.path.coordinates[0][1];

  return {
    originZone: translatePoint(FIXTURE_HINDCAST.originZone, dLon, dLat),
    originUncertaintyRadiusKm: Math.round(seededRangeFromString(caseId + "-unc", 1.5, 5.5) * 10) / 10,
    estimatedOriginTime: new Date(Date.parse(slick.detectionTimestamp) - slick.estimatedAgeHours * 3600_000).toISOString(),
    confidence: Math.round(seededRangeFromString(caseId + "-hc-conf", 62, 89)),
    path: translateLine(FIXTURE_HINDCAST.path, dLon, dLat),
  };
}

export function runForecast(caseId: string, slick: OilSlick): ForecastResult {
  if (caseId === DEMO_CASE_ID) {
    return FIXTURE_FORECAST;
  }

  const dLon = slick.centroid.longitude - FIXTURE_FORECAST.path.coordinates[0][0];
  const dLat = slick.centroid.latitude - FIXTURE_FORECAST.path.coordinates[0][1];

  return {
    horizonHours: 6,
    direction: FIXTURE_FORECAST.direction,
    confidence: Math.round(seededRangeFromString(caseId + "-fc-conf", 55, 82)),
    path: translateLine(FIXTURE_FORECAST.path, dLon, dLat),
    affectedArea: translatePolygon(FIXTURE_FORECAST.affectedArea, dLon, dLat),
  };
}
