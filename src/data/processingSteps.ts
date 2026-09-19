import type { ProcessingSpeed, ProcessingSubState, ProcessingStep } from "../types";

export const PROCESSING_STEP_ORDER: ProcessingSubState[] = [
  "SCANNING",
  "DETECTING",
  "CHARACTERIZING",
  "HINDCASTING",
  "FORECASTING",
  "CORRELATING_AIS",
  "RANKING",
];

export const STEP_LABELS: Record<ProcessingSubState, { label: string; message: string }> = {
  SCANNING: { label: "Scanning Satellite Imagery", message: "Scanning satellite observation..." },
  DETECTING: { label: "Detecting Oil Slick", message: "Candidate slick identified." },
  CHARACTERIZING: { label: "Characterizing Slick", message: "Calculating slick geometry..." },
  HINDCASTING: { label: "Running Hindcast", message: "Running backward drift reconstruction..." },
  FORECASTING: { label: "Predicting Forward Drift", message: "Projecting future slick movement..." },
  CORRELATING_AIS: { label: "Correlating AIS", message: "Filtering historical AIS traffic..." },
  RANKING: { label: "Ranking Candidate Vessels", message: "Calculating vessel correlation..." },
  DONE: { label: "Analysis Complete", message: "Analysis complete." },
};

export function buildInitialSteps(): ProcessingStep[] {
  return PROCESSING_STEP_ORDER.map((id) => ({
    id,
    label: STEP_LABELS[id].label,
    message: STEP_LABELS[id].message,
    status: "pending" as const,
  }));
}

// Per-step latency range in ms, keyed by speed.
export const SPEED_RANGES: Record<ProcessingSpeed, [number, number]> = {
  Fast: [400, 800],
  Normal: [900, 1400],
  Slow: [1800, 2500],
};

export function randomStepDuration(speed: ProcessingSpeed): number {
  const [min, max] = SPEED_RANGES[speed];
  return Math.round(min + Math.random() * (max - min));
}
