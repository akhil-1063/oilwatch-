// Transparent, deterministic candidate-vessel attribution scoring.
// weights: spatial 40%, temporal 30%, trajectory 20%, AIS continuity 10%.

import type { EvidenceItem, ScoreBreakdown } from "../types";

export const ATTRIBUTION_WEIGHTS = {
  spatial: 0.4,
  temporal: 0.3,
  trajectory: 0.2,
  continuity: 0.1,
} as const;

export function calculateAttributionScore(breakdown: ScoreBreakdown): number {
  const raw =
    breakdown.spatial * ATTRIBUTION_WEIGHTS.spatial +
    breakdown.temporal * ATTRIBUTION_WEIGHTS.temporal +
    breakdown.trajectory * ATTRIBUTION_WEIGHTS.trajectory +
    breakdown.continuity * ATTRIBUTION_WEIGHTS.continuity;
  return Math.round(Math.min(100, Math.max(0, raw)));
}

export function statusForScore(score: number): "High-Correlation" | "Moderate-Correlation" | "Low-Correlation" {
  if (score >= 75) return "High-Correlation";
  if (score >= 50) return "Moderate-Correlation";
  return "Low-Correlation";
}

export function buildEvidence(vesselName: string, breakdown: ScoreBreakdown): EvidenceItem[] {
  return [
    {
      id: "ev-spatial",
      category: "spatial",
      label: "Spatial Correlation",
      score: breakdown.spatial,
      narrative: `Vessel trajectory intersects the probable origin corridor identified by the hindcast reconstruction.`,
    },
    {
      id: "ev-temporal",
      category: "temporal",
      label: "Temporal Correlation",
      score: breakdown.temporal,
      narrative: `${vesselName} recorded AIS positions within the estimated release window.`,
    },
    {
      id: "ev-trajectory",
      category: "trajectory",
      label: "Trajectory Compatibility",
      score: breakdown.trajectory,
      narrative: `Observed heading and speed are compatible with the reconstructed slick evolution.`,
    },
    {
      id: "ev-continuity",
      category: "continuity",
      label: "AIS Continuity",
      score: breakdown.continuity,
      narrative: `AIS observations are available across the relevant period, supporting confidence in the trajectory.`,
    },
  ];
}
