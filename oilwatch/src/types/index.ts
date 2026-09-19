// ============================================================
// OilWatch Intelligence Console — Core Domain Types
// ============================================================

export type CaseStatus =
  | "Ready"
  | "Processing"
  | "Complete"
  | "Needs Review"
  | "Reviewed"
  | "Error";

export type SatelliteSource = "SAR" | "EO" | "SAR + EO";

export type ImageryType = "Sentinel-style SAR" | "Optical EO" | "Combined";

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

// ------------------------------------------------------------
// App state machine
// ------------------------------------------------------------

export type AppState =
  | "IDLE"
  | "CASE_CREATING"
  | "CASE_READY"
  | "PROCESSING"
  | "DETECTION_COMPLETE"
  | "HINDCAST_COMPLETE"
  | "AIS_CORRELATION_COMPLETE"
  | "CANDIDATES_READY"
  | "VALIDATING"
  | "CASE_COMPLETE"
  | "EXPORTING"
  | "ERROR";

export type ProcessingSubState =
  | "SCANNING"
  | "DETECTING"
  | "CHARACTERIZING"
  | "HINDCASTING"
  | "FORECASTING"
  | "CORRELATING_AIS"
  | "RANKING"
  | "DONE";

export type StepStatus = "pending" | "active" | "completed" | "error";

export interface ProcessingStep {
  id: ProcessingSubState;
  label: string;
  message: string;
  status: StepStatus;
}

export type ProcessingSpeed = "Fast" | "Normal" | "Slow";

// ------------------------------------------------------------
// Satellite observation
// ------------------------------------------------------------

export interface SatelliteObservation {
  id: string;
  source: SatelliteSource;
  imageryType: ImageryType;
  observationTime: string; // ISO
  assetLabel: string; // e.g. "Sentinel-1 SAR Observation"
  thumbnailSeed: string;
}

// ------------------------------------------------------------
// Oil slick detection
// ------------------------------------------------------------

export interface OilSlick {
  confidence: number; // 0-100
  areaKm2: number;
  estimatedAgeHours: number;
  perimeterKm: number;
  centroid: GeoPoint;
  detectionTimestamp: string;
  geometry: GeoJSON.Polygon;
}

// ------------------------------------------------------------
// Hindcast / origin reconstruction
// ------------------------------------------------------------

export interface HindcastResult {
  originZone: GeoPoint;
  originUncertaintyRadiusKm: number;
  estimatedOriginTime: string;
  confidence: number; // 0-100
  path: GeoJSON.LineString; // slick -> origin (historical reconstruction)
}

// ------------------------------------------------------------
// Forecast / forward drift
// ------------------------------------------------------------

export interface ForecastResult {
  horizonHours: number;
  direction: string; // compass description
  confidence: number;
  path: GeoJSON.LineString;
  affectedArea: GeoJSON.Polygon;
}

// ------------------------------------------------------------
// AIS / vessels
// ------------------------------------------------------------

export interface AISPoint {
  timestamp: string;
  latitude: number;
  longitude: number;
  speedKnots: number;
  headingDeg: number;
}

export interface Vessel {
  id: string;
  name: string;
  imo: string;
  vesselType: string;
  flag: string;
  trajectory: AISPoint[];
}

export interface AISAnalysis {
  vesselsAnalyzed: number;
  vesselsFiltered: number;
  windowStart: string;
  windowEnd: string;
}

// ------------------------------------------------------------
// Candidate scoring
// ------------------------------------------------------------

export interface ScoreBreakdown {
  spatial: number;
  temporal: number;
  trajectory: number;
  continuity: number;
}

export type CandidateStatus =
  | "High-Correlation"
  | "Moderate-Correlation"
  | "Low-Correlation";

export interface EvidenceItem {
  id: string;
  category: "spatial" | "temporal" | "trajectory" | "continuity";
  label: string;
  score: number;
  narrative: string;
}

export interface CandidateVessel {
  rank: number;
  vessel: Vessel;
  attributionScore: number;
  breakdown: ScoreBreakdown;
  status: CandidateStatus;
  evidence: EvidenceItem[];
}

// ------------------------------------------------------------
// Observations (analyst capture)
// ------------------------------------------------------------

export interface Observation {
  id: string;
  caseId: string;
  createdAt: string;
  durationSeconds: number;
  notes: string;
}

// ------------------------------------------------------------
// Analyst review / validation
// ------------------------------------------------------------

export interface AnalystReview {
  reviewedAt: string;
  reviewedBy: string;
  reviewNotes: string;
}

// ------------------------------------------------------------
// Investigation case (root aggregate)
// ------------------------------------------------------------

export interface CaseLocation extends GeoPoint {
  region: string;
}

export interface InvestigationCase {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  incidentDate: string;
  incidentTime: string;
  location: CaseLocation;
  satelliteSource: SatelliteSource;
  imageryType: ImageryType;
  analystNotes: string;
  status: CaseStatus;

  observation: SatelliteObservation | null;
  slick: OilSlick | null;
  hindcast: HindcastResult | null;
  forecast: ForecastResult | null;
  aisAnalysis: AISAnalysis | null;
  candidates: CandidateVessel[];
  selectedCandidateVesselId: string | null;

  appState: AppState;
  processingSpeed: ProcessingSpeed;

  review: AnalystReview | null;
}

// ------------------------------------------------------------
// Roles / settings
// ------------------------------------------------------------

export type Role = "Analyst" | "Supervisor" | "Viewer";

export interface AppSettings {
  role: Role;
  highContrast: boolean;
  reducedMotion: boolean;
  textScale: number; // 1 = default, 1.15, 1.3
  activeCaseId: string | null;
}

// ------------------------------------------------------------
// Export schema
// ------------------------------------------------------------

export interface CaseExportPayload {
  product: string;
  version: string;
  case: {
    id: string;
    name: string;
    createdAt: string;
    incidentDate: string;
    incidentTime: string;
    location: CaseLocation;
  };
  satellite: {
    source: SatelliteSource;
    imageryType: ImageryType;
    observationTime: string;
  } | null;
  slick: {
    confidence: number;
    areaKm2: number;
    estimatedAgeHours: number;
    geometry: GeoJSON.Polygon;
  } | null;
  hindcast: {
    originZone: GeoPoint;
    estimatedOriginTime: string;
    confidence: number;
  } | null;
  forecast: {
    horizonHours: number;
    path: GeoJSON.LineString;
  } | null;
  ais: {
    vesselsAnalyzed: number;
  } | null;
  candidates: CandidateVessel[];
  observations: Observation[];
  validation: AnalystReview | null;
  exportedAt: string;
}
