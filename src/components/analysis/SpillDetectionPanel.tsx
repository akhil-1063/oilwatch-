import type { OilSlick } from "../../types";

interface SpillDetectionPanelProps {
  slick: OilSlick | null;
}

function formatCoord(value: number): string {
  return value.toFixed(3);
}

export function SpillDetectionPanel({ slick }: SpillDetectionPanelProps) {
  if (!slick) {
    return (
      <section className="panel-section" aria-label="Spill Detection">
        <h2 className="panel-section-title">Spill Detection</h2>
        <p className="panel-empty-state">Run analysis to generate intelligence.</p>
      </section>
    );
  }

  const detectedAt = new Date(slick.detectionTimestamp).toLocaleString();

  return (
    <section className="panel-section" aria-label="Spill Detection">
      <h2 className="panel-section-title">Spill Detection</h2>
      <dl className="intel-grid">
        <div className="intel-stat">
          <dt className="intel-stat-label">Detection Confidence</dt>
          <dd className="intel-stat-value">{Math.round(slick.confidence)}%</dd>
        </div>
        <div className="intel-stat">
          <dt className="intel-stat-label">Slick Area</dt>
          <dd className="intel-stat-value">{slick.areaKm2.toFixed(1)} km²</dd>
        </div>
        <div className="intel-stat">
          <dt className="intel-stat-label">Estimated Age</dt>
          <dd className="intel-stat-value">{slick.estimatedAgeHours.toFixed(1)} hrs</dd>
        </div>
        <div className="intel-stat">
          <dt className="intel-stat-label">Perimeter</dt>
          <dd className="intel-stat-value">{slick.perimeterKm.toFixed(1)} km</dd>
        </div>
        <div className="intel-stat">
          <dt className="intel-stat-label">Centroid</dt>
          <dd className="intel-stat-value">
            {formatCoord(slick.centroid.latitude)}, {formatCoord(slick.centroid.longitude)}
          </dd>
        </div>
        <div className="intel-stat">
          <dt className="intel-stat-label">Detection Timestamp</dt>
          <dd className="intel-stat-value">{detectedAt}</dd>
        </div>
      </dl>
    </section>
  );
}
