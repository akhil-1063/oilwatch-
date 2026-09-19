import type { CaseExportPayload, InvestigationCase, Observation } from "../types";

export const OILWATCH_VERSION = "0.1.0";

export function buildExportPayload(
  investigationCase: InvestigationCase,
  observations: Observation[]
): CaseExportPayload {
  return {
    product: "OilWatch Intelligence Console",
    version: OILWATCH_VERSION,
    case: {
      id: investigationCase.id,
      name: investigationCase.name,
      createdAt: investigationCase.createdAt,
      incidentDate: investigationCase.incidentDate,
      incidentTime: investigationCase.incidentTime,
      location: investigationCase.location,
    },
    satellite: investigationCase.observation
      ? {
          source: investigationCase.observation.source,
          imageryType: investigationCase.observation.imageryType,
          observationTime: investigationCase.observation.observationTime,
        }
      : null,
    slick: investigationCase.slick
      ? {
          confidence: investigationCase.slick.confidence,
          areaKm2: investigationCase.slick.areaKm2,
          estimatedAgeHours: investigationCase.slick.estimatedAgeHours,
          geometry: investigationCase.slick.geometry,
        }
      : null,
    hindcast: investigationCase.hindcast
      ? {
          originZone: investigationCase.hindcast.originZone,
          estimatedOriginTime: investigationCase.hindcast.estimatedOriginTime,
          confidence: investigationCase.hindcast.confidence,
        }
      : null,
    forecast: investigationCase.forecast
      ? {
          horizonHours: investigationCase.forecast.horizonHours,
          path: investigationCase.forecast.path,
        }
      : null,
    ais: investigationCase.aisAnalysis
      ? { vesselsAnalyzed: investigationCase.aisAnalysis.vesselsAnalyzed }
      : null,
    candidates: investigationCase.candidates,
    observations,
    validation: investigationCase.review,
    exportedAt: new Date().toISOString(),
  };
}

export function downloadCaseExport(investigationCase: InvestigationCase, observations: Observation[]): void {
  const payload = buildExportPayload(investigationCase, observations);
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `oilwatch-case-${investigationCase.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
