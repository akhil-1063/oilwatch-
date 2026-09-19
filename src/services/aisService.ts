// AIS correlation service: filters background maritime traffic and scores
// vessels against the reconstructed origin/time window.
// PROTOTYPE: deterministic fixture vessel set (see data/fixtures.ts).
// FUTURE: swap FIXTURE_VESSELS retrieval for a real AIS history API without
// changing the correlateAIS() contract.

import { DEMO_CASE_ID, FIXTURE_AIS_ANALYSIS, FIXTURE_SLICK, FIXTURE_VESSELS } from "../data/fixtures";
import type { AISAnalysis, CandidateVessel, HindcastResult, OilSlick, ScoreBreakdown, Vessel } from "../types";
import { buildEvidence, calculateAttributionScore, statusForScore } from "./attributionService";
import { haversineKm } from "../utils/geo";

// The four vessels considered as investigation candidates in the fixture set.
// The remaining vessels represent background traffic filtered during AIS
// correlation (outside the relevant spatial/temporal corridor).
export const CANDIDATE_VESSEL_IDS = ["v-ocean-star", "v-sea-trader", "v-pacific-wind", "v-northern-glory"];

// Hand-authored breakdown for the demonstration case, matching the fixture
// trajectories that were designed to be geographically/temporally coherent
// with the hindcast origin (see data/fixtures.ts commentary).
const DEMO_BREAKDOWNS: Record<string, ScoreBreakdown> = {
  "v-ocean-star": { spatial: 92, temporal: 88, trajectory: 81, continuity: 79 },
  "v-sea-trader": { spatial: 71, temporal: 65, trajectory: 55, continuity: 50 },
  "v-pacific-wind": { spatial: 42, temporal: 36, trajectory: 30, continuity: 40 },
  "v-northern-glory": { spatial: 18, temporal: 22, trajectory: 15, continuity: 30 },
};

// Primary candidate list only surfaces vessels meeting this correlation floor.
export const CANDIDATE_DISPLAY_THRESHOLD = 35;

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function scoreVesselGeneric(vessel: Vessel, hindcast: HindcastResult): ScoreBreakdown {
  const distances = vessel.trajectory.map((p) => haversineKm(p, hindcast.originZone));
  const minDistance = Math.min(...distances);
  const spatial = Math.round(Math.min(100, Math.max(0, 100 - minDistance * 8)));

  const originTime = Date.parse(hindcast.estimatedOriginTime);
  const hoursDiffs = vessel.trajectory.map((p) => Math.abs(Date.parse(p.timestamp) - originTime) / 3_600_000);
  const minHoursDiff = Math.min(...hoursDiffs);
  const temporal = Math.round(Math.min(100, Math.max(0, 100 - minHoursDiff * 15)));

  const headingChanges = vessel.trajectory.slice(1).map((p, i) => {
    const diff = Math.abs(p.headingDeg - vessel.trajectory[i].headingDeg);
    return Math.min(diff, 360 - diff);
  });
  const steadiness = stdDev(headingChanges.length ? headingChanges : [0]);
  const trajectory = Math.round(Math.min(100, Math.max(0, 100 - steadiness * 4)));

  const continuity = Math.round(Math.min(100, (vessel.trajectory.length / 8) * 100));

  return { spatial, temporal, trajectory, continuity };
}

function toCandidateVessel(vessel: Vessel, breakdown: ScoreBreakdown): CandidateVessel {
  const attributionScore = calculateAttributionScore(breakdown);
  return {
    rank: 0,
    vessel,
    attributionScore,
    breakdown,
    status: statusForScore(attributionScore),
    evidence: buildEvidence(vessel.name, breakdown),
  };
}

export interface AISCorrelationResult {
  candidates: CandidateVessel[]; // above display threshold, ranked
  belowThreshold: CandidateVessel[]; // scored but filtered from primary list
  aisAnalysis: AISAnalysis;
  backgroundVesselIds: string[];
}

export function correlateAIS(caseId: string, slick: OilSlick, hindcast: HindcastResult): AISCorrelationResult {
  const dLon = slick.centroid.longitude - FIXTURE_SLICK.centroid.longitude;
  const dLat = slick.centroid.latitude - FIXTURE_SLICK.centroid.latitude;

  const translatedVessels: Vessel[] = FIXTURE_VESSELS.map((v) => ({
    ...v,
    trajectory: v.trajectory.map((p) => ({
      ...p,
      latitude: p.latitude + dLat,
      longitude: p.longitude + dLon,
    })),
  }));

  const backgroundVesselIds = translatedVessels
    .filter((v) => !CANDIDATE_VESSEL_IDS.includes(v.id))
    .map((v) => v.id);

  const scored = translatedVessels
    .filter((v) => CANDIDATE_VESSEL_IDS.includes(v.id))
    .map((vessel) => {
      const breakdown = caseId === DEMO_CASE_ID ? DEMO_BREAKDOWNS[vessel.id] : scoreVesselGeneric(vessel, hindcast);
      return toCandidateVessel(vessel, breakdown);
    })
    .sort((a, b) => b.attributionScore - a.attributionScore);

  const candidates = scored.filter((c) => c.attributionScore >= CANDIDATE_DISPLAY_THRESHOLD);
  const belowThreshold = scored.filter((c) => c.attributionScore < CANDIDATE_DISPLAY_THRESHOLD);

  candidates.forEach((c, i) => {
    c.rank = i + 1;
  });

  const aisAnalysis: AISAnalysis =
    caseId === DEMO_CASE_ID
      ? FIXTURE_AIS_ANALYSIS
      : {
          vesselsAnalyzed: translatedVessels.length,
          vesselsFiltered: backgroundVesselIds.length,
          windowStart: new Date(Date.parse(hindcast.estimatedOriginTime) - 6 * 3_600_000).toISOString(),
          windowEnd: slick.detectionTimestamp,
        };

  return { candidates, belowThreshold, aisAnalysis, backgroundVesselIds };
}

export function getAllVesselsForCase(caseId: string, slick: OilSlick): Vessel[] {
  const dLon = slick.centroid.longitude - FIXTURE_SLICK.centroid.longitude;
  const dLat = slick.centroid.latitude - FIXTURE_SLICK.centroid.latitude;
  if (caseId === DEMO_CASE_ID) return FIXTURE_VESSELS;
  return FIXTURE_VESSELS.map((v) => ({
    ...v,
    trajectory: v.trajectory.map((p) => ({ ...p, latitude: p.latitude + dLat, longitude: p.longitude + dLon })),
  }));
}
