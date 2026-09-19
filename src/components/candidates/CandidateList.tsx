import type { CandidateStatus, CandidateVessel } from "../../types";

interface CandidateListProps {
  candidates: CandidateVessel[];
  selectedVesselId: string | null;
  onSelect: (vesselId: string) => void;
  analysisStarted: boolean;
}

const STATUS_META: Record<CandidateStatus, { icon: string; text: string; className: string }> = {
  "High-Correlation": { icon: "⬤", text: "High Correlation", className: "status-high" },
  "Moderate-Correlation": { icon: "◐", text: "Moderate Correlation", className: "status-moderate" },
  "Low-Correlation": { icon: "○", text: "Low Correlation", className: "status-low" },
};

export function CandidateList({
  candidates,
  selectedVesselId,
  onSelect,
  analysisStarted,
}: CandidateListProps) {
  return (
    <section className="panel-section" aria-label="Candidate Vessels">
      <h2 className="panel-section-title">Candidate Vessels</h2>

      {!analysisStarted && <p className="panel-empty-state">Run analysis to generate intelligence.</p>}

      {analysisStarted && candidates.length === 0 && (
        <p className="panel-empty-state">No vessels meet the current correlation threshold.</p>
      )}

      {analysisStarted && candidates.length > 0 && (
        <div className="candidate-table-wrap">
          <table className="candidate-table">
            <caption className="sr-only">
              Ranked candidate vessels by attribution score, with spatial, temporal, and trajectory
              correlation and investigation status
            </caption>
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Vessel</th>
                <th scope="col">Attribution Score</th>
                <th scope="col">Spatial</th>
                <th scope="col">Temporal</th>
                <th scope="col">Trajectory</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => {
                const isSelected = candidate.vessel.id === selectedVesselId;
                const status = STATUS_META[candidate.status];
                return (
                  <tr
                    key={candidate.vessel.id}
                    className={isSelected ? "row-selected" : undefined}
                    aria-selected={isSelected}
                  >
                    <td>
                      <button
                        type="button"
                        className="candidate-row-btn"
                        onClick={() => onSelect(candidate.vessel.id)}
                        aria-label={`View evidence for ${candidate.vessel.name}, rank ${candidate.rank}`}
                        aria-pressed={isSelected}
                      >
                        {candidate.rank}
                      </button>
                    </td>
                    <td>
                      <span className="candidate-vessel-name">{candidate.vessel.name}</span>
                      <span className="candidate-vessel-imo">IMO {candidate.vessel.imo}</span>
                    </td>
                    <td>{candidate.attributionScore} / 100</td>
                    <td>{candidate.breakdown.spatial}</td>
                    <td>{candidate.breakdown.temporal}</td>
                    <td>{candidate.breakdown.trajectory}</td>
                    <td>
                      <span className={`candidate-status ${status.className}`}>
                        <span aria-hidden="true">{status.icon}</span> {status.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
