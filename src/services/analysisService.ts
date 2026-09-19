// Orchestrates the analysis pipeline by composing the individual services.
// This is the seam where fixture-backed logic would be replaced by real
// ML/ocean-model/AIS API calls in a production system.

import { FIXTURE_OBSERVATION, DEMO_CASE_ID } from "../data/fixtures";
import type { InvestigationCase, SatelliteObservation } from "../types";
import { detectOilSlick } from "./slickDetectionService";
import { runForecast, runHindcast } from "./driftService";
import { correlateAIS } from "./aisService";

export function getObservationForCase(investigationCase: InvestigationCase): SatelliteObservation {
  if (investigationCase.observation) return investigationCase.observation;
  if (investigationCase.id === DEMO_CASE_ID) return FIXTURE_OBSERVATION;
  return {
    id: `obs-${investigationCase.id}`,
    source: investigationCase.satelliteSource,
    imageryType: investigationCase.imageryType,
    observationTime: new Date().toISOString(),
    assetLabel:
      investigationCase.satelliteSource === "SAR"
        ? "Sentinel-1 SAR Observation"
        : investigationCase.satelliteSource === "EO"
        ? "Optical EO Observation"
        : "Combined SAR + EO Observation",
    thumbnailSeed: investigationCase.id,
  };
}

export interface FullAnalysisResult {
  observation: SatelliteObservation;
  slick: ReturnType<typeof detectOilSlick>;
  hindcast: ReturnType<typeof runHindcast>;
  forecast: ReturnType<typeof runForecast>;
  aisAnalysis: ReturnType<typeof correlateAIS>["aisAnalysis"];
  candidates: ReturnType<typeof correlateAIS>["candidates"];
}

// Runs the full deterministic pipeline synchronously; the processing UI
// layer is responsible for staging/animating this over the step timeline.
export function runFullAnalysis(investigationCase: InvestigationCase): FullAnalysisResult {
  const observation = getObservationForCase(investigationCase);
  const slick = detectOilSlick(investigationCase.id, investigationCase.location);
  const hindcast = runHindcast(investigationCase.id, slick, investigationCase.location);
  const forecast = runForecast(investigationCase.id, slick);
  const { candidates, aisAnalysis } = correlateAIS(investigationCase.id, slick, hindcast);

  return { observation, slick, hindcast, forecast, aisAnalysis, candidates };
}
