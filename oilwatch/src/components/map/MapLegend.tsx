export function MapLegend() {
  return (
    <div className="map-legend" aria-label="Map legend">
      <div className="legend-title">Legend</div>
      <div className="legend-row"><span className="legend-swatch" style={{ background: "#DC2626" }} /> Detected Slick</div>
      <div className="legend-row"><span className="legend-swatch" style={{ background: "#D97706" }} /> Probable Origin / Forecast</div>
      <div className="legend-row"><span className="legend-line" style={{ background: "#0D9488" }} /> Hindcast Path</div>
      <div className="legend-row"><span className="legend-line dashed" style={{ borderColor: "#475569" }} /> Background AIS Traffic</div>
      <div className="legend-row"><span className="legend-line" style={{ background: "#5eead4" }} /> Candidate Vessel Track</div>
      <div className="legend-row"><span className="legend-dot" style={{ background: "#DC2626" }} /> High Correlation (75+)</div>
      <div className="legend-row"><span className="legend-dot" style={{ background: "#D97706" }} /> Moderate Correlation (50-74)</div>
      <div className="legend-row"><span className="legend-dot" style={{ background: "#94A3B8" }} /> Low Correlation (&lt;50)</div>
    </div>
  );
}
