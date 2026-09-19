import type { ForecastResult, HindcastResult } from "../../types";
import { Tooltip } from "../common/Tooltip";

interface OriginPanelProps {
  hindcast: HindcastResult | null;
  forecast: ForecastResult | null;
}

function formatCoord(value: number): string {
  return value.toFixed(3);
}

export function OriginPanel({ hindcast, forecast }: OriginPanelProps) {
  if (!hindcast && !forecast) {
    return (
      <section className="panel-section" aria-label="Origin Reconstruction">
        <h2 className="panel-section-title">Origin Reconstruction</h2>
        <p className="panel-empty-state">Run analysis to generate intelligence.</p>
      </section>
    );
  }

  return (
    <section className="panel-section" aria-label="Origin Reconstruction">
      <h2 className="panel-section-title">
        Origin Reconstruction
        <Tooltip label="Backward reconstruction of the slick's likely origin based on observed drift.">
          <span aria-hidden="true" className="info-glyph">
            ⓘ Hindcast
          </span>
        </Tooltip>
      </h2>

      {hindcast && (
        <dl className="intel-grid">
          <div className="intel-stat">
            <dt className="intel-stat-label">
              <Tooltip label="An estimated area, not a precise point — reflects modeling uncertainty.">
                <span>Probable Origin Zone</span>
              </Tooltip>
            </dt>
            <dd className="intel-stat-value">
              {formatCoord(hindcast.originZone.latitude)}, {formatCoord(hindcast.originZone.longitude)}
            </dd>
          </div>
          <div className="intel-stat">
            <dt className="intel-stat-label">Estimated Release Window</dt>
            <dd className="intel-stat-value">
              {new Date(hindcast.estimatedOriginTime).toLocaleString()}
            </dd>
          </div>
          <div className="intel-stat">
            <dt className="intel-stat-label">Hindcast Confidence</dt>
            <dd className="intel-stat-value">{Math.round(hindcast.confidence)}%</dd>
          </div>
        </dl>
      )}

      {forecast && (
        <div className="origin-forecast-block">
          <h3 className="panel-subsection-title">Projected Movement</h3>
          <dl className="intel-grid">
            <div className="intel-stat">
              <dt className="intel-stat-label">Horizon</dt>
              <dd className="intel-stat-value">{forecast.horizonHours} hrs</dd>
            </div>
            <div className="intel-stat">
              <dt className="intel-stat-label">Direction</dt>
              <dd className="intel-stat-value">{forecast.direction}</dd>
            </div>
            <div className="intel-stat">
              <dt className="intel-stat-label">Confidence</dt>
              <dd className="intel-stat-value">{Math.round(forecast.confidence)}%</dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  );
}
