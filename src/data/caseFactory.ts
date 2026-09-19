import { DEMO_CASE_ID, FIXTURE_AIS_ANALYSIS, FIXTURE_FORECAST, FIXTURE_HINDCAST, FIXTURE_OBSERVATION, FIXTURE_SLICK } from "./fixtures";
import { correlateAIS } from "../services/aisService";
import type { InvestigationCase } from "../types";

export function buildDemoCase(): InvestigationCase {
  const now = new Date().toISOString();
  const { candidates } = correlateAIS(DEMO_CASE_ID, FIXTURE_SLICK, FIXTURE_HINDCAST);

  return {
    id: DEMO_CASE_ID,
    name: "Arabian Sea Corridor Slick — OS-1042",
    createdAt: now,
    updatedAt: now,
    incidentDate: "2026-09-17",
    incidentTime: "02:14",
    location: { latitude: 12.958, longitude: 72.268, region: "Arabian Sea / Laccadive Corridor" },
    satelliteSource: "SAR",
    imageryType: "Sentinel-style SAR",
    analystNotes:
      "Slick detected in a high-traffic tanker corridor. Hindcast places probable origin near a known anchorage transit lane.",
    status: "Complete",

    observation: FIXTURE_OBSERVATION,
    slick: FIXTURE_SLICK,
    hindcast: FIXTURE_HINDCAST,
    forecast: FIXTURE_FORECAST,
    aisAnalysis: FIXTURE_AIS_ANALYSIS,
    candidates,
    selectedCandidateVesselId: null,

    appState: "CANDIDATES_READY",
    processingSpeed: "Normal",

    review: null,
  };
}

export interface NewCaseInput {
  name: string;
  incidentDate: string;
  incidentTime: string;
  region: string;
  latitude: number;
  longitude: number;
  satelliteSource: InvestigationCase["satelliteSource"];
  imageryType: InvestigationCase["imageryType"];
  analystNotes: string;
}

export function buildNewCase(input: NewCaseInput): InvestigationCase {
  const now = new Date().toISOString();
  const id = `OS-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    id,
    name: input.name,
    createdAt: now,
    updatedAt: now,
    incidentDate: input.incidentDate,
    incidentTime: input.incidentTime,
    location: { latitude: input.latitude, longitude: input.longitude, region: input.region },
    satelliteSource: input.satelliteSource,
    imageryType: input.imageryType,
    analystNotes: input.analystNotes,
    status: "Ready",

    observation: null,
    slick: null,
    hindcast: null,
    forecast: null,
    aisAnalysis: null,
    candidates: [],
    selectedCandidateVesselId: null,

    appState: "CASE_READY",
    processingSpeed: "Normal",

    review: null,
  };
}
