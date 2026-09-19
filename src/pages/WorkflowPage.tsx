import type { InvestigationCase } from "../types";
import { ATTRIBUTION_WEIGHTS } from "../services/attributionService";

interface WorkflowPageProps {
  investigationCase: InvestigationCase | null;
}

interface StepDef {
  key: string;
  number: number;
  title: string;
  icon: string;
  explanation: string;
  isComplete: (c: InvestigationCase) => boolean;
  renderResult: (c: InvestigationCase) => React.ReactNode;
}

function formatCoord(v: number): string {
  return v.toFixed(3);
}

const STEPS: StepDef[] = [
  {
    key: "observation",
    number: 1,
    title: "Satellite Observation",
    icon: "🛰",
    explanation:
      "A satellite passes over the ocean and captures an image of the sea surface, using radar (SAR) that works day or night through cloud cover, optical (EO) imagery, or both combined.",
    isComplete: (c) => !!c.observation,
    renderResult: (c) =>
      c.observation ? (
        <div className="workflow-result-grid">
          <div className="workflow-result-item">
            <span className="workflow-result-label">Asset</span>
            <span className="workflow-result-value">{c.observation.assetLabel}</span>
          </div>
          <div className="workflow-result-item">
            <span className="workflow-result-label">Source</span>
            <span className="workflow-result-value">{c.observation.source}</span>
          </div>
          <div className="workflow-result-item">
            <span className="workflow-result-label">Imagery Type</span>
            <span className="workflow-result-value">{c.observation.imageryType}</span>
          </div>
          <div className="workflow-result-item">
            <span className="workflow-result-label">Observation Time</span>
            <span className="workflow-result-value">{new Date(c.observation.observationTime).toLocaleString()}</span>
          </div>
        </div>
      ) : null,
  },
  {
    key: "detection",
    number: 2,
    title: "Oil Slick Detection",
    icon: "🛢",
    explanation:
      "The imagery is scanned for surface anomalies consistent with an oil slick — a dark, low-texture patch where wind-driven ripples are dampened by a surface film.",
    isComplete: (c) => !!c.slick,
    renderResult: (c) =>
      c.slick ? (
        <div className="workflow-result-grid">
          <div className="workflow-result-item">
            <span className="workflow-result-label">Detection Confidence</span>
            <span className="workflow-result-value workflow-highlight">{c.slick.confidence}%</span>
          </div>
          <div className="workflow-result-item">
            <span className="workflow-result-label">Detection Timestamp</span>
            <span className="workflow-result-value">{new Date(c.slick.detectionTimestamp).toLocaleString()}</span>
          </div>
        </div>
      ) : null,
  },
  {
    key: "characterization",
    number: 3,
    title: "Slick Characterization",
    icon: "📐",
    explanation:
      "The detected slick's geometry is measured directly from the imagery — its area, perimeter, centroid position, and an estimate of how long it has been on the surface based on how the slick has spread and thinned.",
    isComplete: (c) => !!c.slick,
    renderResult: (c) =>
      c.slick ? (
        <div className="workflow-result-grid">
          <div className="workflow-result-item">
            <span className="workflow-result-label">Slick Area</span>
            <span className="workflow-result-value">{c.slick.areaKm2} km²</span>
          </div>
          <div className="workflow-result-item">
            <span className="workflow-result-label">Perimeter</span>
            <span className="workflow-result-value">{c.slick.perimeterKm} km</span>
          </div>
          <div className="workflow-result-item">
            <span className="workflow-result-label">Centroid</span>
            <span className="workflow-result-value">
              {formatCoord(c.slick.centroid.latitude)}, {formatCoord(c.slick.centroid.longitude)}
            </span>
          </div>
          <div className="workflow-result-item">
            <span className="workflow-result-label">Estimated Age</span>
            <span className="workflow-result-value">~{c.slick.estimatedAgeHours} hrs</span>
          </div>
        </div>
      ) : null,
  },
  {
    key: "hindcast",
    number: 4,
    title: "Hindcast",
    icon: "⏪",
    explanation:
      "Ocean current and wind drift models are run backward in time from the slick's observed position, tracing its likely path in reverse to estimate where and when it was first released.",
    isComplete: (c) => !!c.hindcast,
    renderResult: (c) =>
      c.hindcast ? (
        <div className="workflow-result-grid">
          <div className="workflow-result-item">
            <span className="workflow-result-label">Hindcast Confidence</span>
            <span className="workflow-result-value workflow-highlight">{c.hindcast.confidence}%</span>
          </div>
          <div className="workflow-result-item">
            <span className="workflow-result-label">Estimated Release Window</span>
            <span className="workflow-result-value">{new Date(c.hindcast.estimatedOriginTime).toLocaleString()}</span>
          </div>
        </div>
      ) : null,
  },
  {
    key: "origin",
    number: 5,
    title: "Probable Origin",
    icon: "📍",
    explanation:
      "The backward reconstruction converges on a probable origin zone — deliberately an area, not a single exact point, reflecting the genuine uncertainty in current and drift modeling.",
    isComplete: (c) => !!c.hindcast,
    renderResult: (c) =>
      c.hindcast ? (
        <div className="workflow-result-grid">
          <div className="workflow-result-item">
            <span className="workflow-result-label">Probable Origin Zone</span>
            <span className="workflow-result-value">
              {formatCoord(c.hindcast.originZone.latitude)}, {formatCoord(c.hindcast.originZone.longitude)}
            </span>
          </div>
          <div className="workflow-result-item">
            <span className="workflow-result-label">Uncertainty Radius</span>
            <span className="workflow-result-value">{c.hindcast.originUncertaintyRadiusKm} km</span>
          </div>
        </div>
      ) : null,
  },
  {
    key: "forecast",
    number: 6,
    title: "Forward Forecast",
    icon: "⏩",
    explanation:
      "The same drift model is run forward from the current slick position to project where it is likely to move next, supporting response planning independent of the investigation.",
    isComplete: (c) => !!c.forecast,
    renderResult: (c) =>
      c.forecast ? (
        <div className="workflow-result-grid">
          <div className="workflow-result-item">
            <span className="workflow-result-label">Forecast Horizon</span>
            <span className="workflow-result-value">+{c.forecast.horizonHours} hrs</span>
          </div>
          <div className="workflow-result-item">
            <span className="workflow-result-label">Direction</span>
            <span className="workflow-result-value">{c.forecast.direction}</span>
          </div>
          <div className="workflow-result-item">
            <span className="workflow-result-label">Confidence</span>
            <span className="workflow-result-value">{c.forecast.confidence}%</span>
          </div>
        </div>
      ) : null,
  },
  {
    key: "ais",
    number: 7,
    title: "AIS Correlation",
    icon: "📡",
    explanation:
      "Historical AIS position reports for vessels in the area are pulled for the estimated release window, then cross-referenced against the probable origin corridor. Traffic with no plausible link is filtered out.",
    isComplete: (c) => !!c.aisAnalysis,
    renderResult: (c) =>
      c.aisAnalysis ? (
        <div className="workflow-result-grid">
          <div className="workflow-result-item">
            <span className="workflow-result-label">Vessels Analyzed</span>
            <span className="workflow-result-value">{c.aisAnalysis.vesselsAnalyzed}</span>
          </div>
          <div className="workflow-result-item">
            <span className="workflow-result-label">Filtered as Irrelevant</span>
            <span className="workflow-result-value">{c.aisAnalysis.vesselsFiltered}</span>
          </div>
          <div className="workflow-result-item">
            <span className="workflow-result-label">Remaining Candidates</span>
            <span className="workflow-result-value">
              {c.aisAnalysis.vesselsAnalyzed - c.aisAnalysis.vesselsFiltered}
            </span>
          </div>
        </div>
      ) : null,
  },
  {
    key: "ranking",
    number: 8,
    title: "Candidate Vessel Ranking",
    icon: "🏆",
    explanation:
      "Remaining vessels are scored with a transparent, deterministic weighted model — spatial correlation 40%, temporal correlation 30%, trajectory compatibility 20%, AIS continuity 10% — and ranked by Attribution Score.",
    isComplete: (c) => c.candidates.length > 0,
    renderResult: (c) => (
      <div>
        <div className="workflow-weight-row">
          <span className="workflow-weight-chip">Spatial {Math.round(ATTRIBUTION_WEIGHTS.spatial * 100)}%</span>
          <span className="workflow-weight-chip">Temporal {Math.round(ATTRIBUTION_WEIGHTS.temporal * 100)}%</span>
          <span className="workflow-weight-chip">Trajectory {Math.round(ATTRIBUTION_WEIGHTS.trajectory * 100)}%</span>
          <span className="workflow-weight-chip">Continuity {Math.round(ATTRIBUTION_WEIGHTS.continuity * 100)}%</span>
        </div>
        {c.candidates.length > 0 ? (
          <ol className="workflow-candidate-list">
            {c.candidates.map((cand) => (
              <li key={cand.vessel.id} className="workflow-candidate-item">
                <span className="rank-pill">{cand.rank}</span>
                <span className="workflow-candidate-name">{cand.vessel.name}</span>
                <span className="workflow-candidate-score">{cand.attributionScore} / 100</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="workflow-empty">No vessels met the correlation threshold for this case.</p>
        )}
      </div>
    ),
  },
  {
    key: "evidence",
    number: 9,
    title: "Evidence Review",
    icon: "🔎",
    explanation:
      "An investigator opens each candidate's evidence breakdown — the narrative behind every sub-score — and forms a judgment. The score supports investigation; it does not establish causal responsibility on its own.",
    isComplete: (c) => c.candidates.length > 0,
    renderResult: (c) =>
      c.candidates.length > 0 ? (
        <p className="workflow-empty">
          Select a candidate vessel in the Console view to open its full evidence drawer.
        </p>
      ) : null,
  },
  {
    key: "export",
    number: 10,
    title: "Case Export",
    icon: "📤",
    explanation:
      "Once reviewed, the complete case — imagery metadata, slick geometry, origin, forecast, ranked candidates, evidence, and the review record — is exported as structured JSON for the investigation file.",
    isComplete: (c) => c.status === "Reviewed",
    renderResult: (c) => (
      <div className="workflow-result-grid">
        <div className="workflow-result-item">
          <span className="workflow-result-label">Review Status</span>
          <span className="workflow-result-value">{c.review ? "Reviewed" : "Not yet reviewed"}</span>
        </div>
        {c.review && (
          <div className="workflow-result-item">
            <span className="workflow-result-label">Reviewed By</span>
            <span className="workflow-result-value">{c.review.reviewedBy}</span>
          </div>
        )}
      </div>
    ),
  },
];

export function WorkflowPage({ investigationCase }: WorkflowPageProps) {
  return (
    <div className="workflow-page">
      <div className="workflow-intro">
        <h2>How OilWatch Builds an Investigation</h2>
        <p>
          Every case moves through the same ten-stage pipeline, from raw satellite imagery to an exportable
          investigation file. Each stage below shows what happens in plain terms, alongside the actual result for{" "}
          {investigationCase ? <strong>{investigationCase.id}</strong> : "the open case"}.
        </p>
      </div>

      {!investigationCase && (
        <p className="empty-state">No case selected. Open the case manager to create or select one.</p>
      )}

      {investigationCase && (
        <ol className="workflow-timeline">
          {STEPS.map((step) => {
            const complete = step.isComplete(investigationCase);
            return (
              <li key={step.key} className={`workflow-step ${complete ? "workflow-step-complete" : ""}`}>
                <div className="workflow-step-marker">
                  <span className="workflow-step-icon" aria-hidden="true">
                    {step.icon}
                  </span>
                  <span className="workflow-step-connector" aria-hidden="true" />
                </div>
                <div className="workflow-step-body">
                  <div className="workflow-step-heading">
                    <span className="workflow-step-number">Step {step.number}</span>
                    <h3 className="workflow-step-title">{step.title}</h3>
                    <span className={`workflow-step-status ${complete ? "status-complete" : "status-pending"}`}>
                      {complete ? "✓ Complete" : "○ Pending"}
                    </span>
                  </div>
                  <p className="workflow-step-explanation">{step.explanation}</p>
                  {complete ? (
                    step.renderResult(investigationCase)
                  ) : (
                    <p className="workflow-empty">Run analysis to generate this result.</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
