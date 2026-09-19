import type { CandidateStatus, CandidateVessel } from "../../types";

interface EvidenceDrawerProps {
  candidate: CandidateVessel | null;
  onClose: () => void;
}

const ASSESSMENT_TEXT: Record<CandidateStatus, string> = {
  "High-Correlation": "HIGH-CORRELATION INVESTIGATION CANDIDATE",
  "Moderate-Correlation": "MODERATE-CORRELATION INVESTIGATION CANDIDATE",
  "Low-Correlation": "LOW-CORRELATION INVESTIGATION CANDIDATE",
};

export function EvidenceDrawer({ candidate, onClose }: EvidenceDrawerProps) {
  if (!candidate) return null;

  return (
    <div
      className="evidence-drawer"
      role="region"
      aria-label={`Evidence for ${candidate.vessel.name}`}
    >
      <div className="evidence-drawer-header">
        <div>
          <h2 className="evidence-vessel-name">{candidate.vessel.name}</h2>
          <p className="evidence-vessel-imo">IMO {candidate.vessel.imo}</p>
          <p className="evidence-score-headline">
            Candidate Attribution Score: {candidate.attributionScore} / 100
          </p>
        </div>
        <button
          type="button"
          className="evidence-drawer-close"
          onClick={onClose}
          aria-label="Close evidence panel"
        >
          ✕
        </button>
      </div>

      <div className="evidence-blocks">
        {candidate.evidence.map((item) => (
          <div className="evidence-score-block" key={item.id}>
            <div className="evidence-score-block-header">
              <span className="evidence-item-label">{item.label}</span>
              <span className="evidence-item-score">{item.score} / 100</span>
            </div>
            <p className="evidence-item-narrative">{item.narrative}</p>
          </div>
        ))}
      </div>

      <p className="evidence-assessment">{ASSESSMENT_TEXT[candidate.status]}</p>

      <p className="evidence-disclaimer">
        This score supports investigation and does not establish causal responsibility.
      </p>
    </div>
  );
}
