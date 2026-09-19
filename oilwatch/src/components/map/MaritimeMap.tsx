import { useMemo, useState, useCallback } from "react";
import type { InvestigationCase, Vessel } from "../../types";
import { createProjector, pathFromLineString, pathFromPolygon, type LonLatBounds } from "./projection";
import { getAllVesselsForCase, CANDIDATE_VESSEL_IDS } from "../../services/aisService";
import { useSettingsStore } from "../../stores/settingsStore";
import { MapLegend } from "./MapLegend";

export type LayerKey = "slick" | "hindcast" | "forecast" | "ais" | "candidates";

const LAYER_LABELS: Record<LayerKey, string> = {
  slick: "Detected Oil Slick",
  hindcast: "Hindcast / Probable Origin",
  forecast: "Projected Movement",
  ais: "AIS Vessel Traffic",
  candidates: "Candidate Vessel Markers",
};

const VIEW_W = 1000;
const VIEW_H = 640;

interface MaritimeMapProps {
  investigationCase: InvestigationCase;
  selectedVesselId: string | null;
  onSelectVessel: (vesselId: string | null) => void;
}

export function MaritimeMap({ investigationCase, selectedVesselId, onSelectVessel }: MaritimeMapProps) {
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    slick: true,
    hindcast: true,
    forecast: true,
    ais: true,
    candidates: true,
  });
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [dragging, setDragging] = useState<{ x: number; y: number } | null>(null);

  const { slick, hindcast, forecast, candidates } = investigationCase;

  const allVessels: Vessel[] = useMemo(() => {
    return getAllVesselsForCase(investigationCase.id, slick ?? { centroid: investigationCase.location } as any);
  }, [investigationCase.id, slick, investigationCase.location]);

  const bounds: LonLatBounds = useMemo(() => {
    // Frame the investigation itself (slick, origin, forecast, candidate
    // tracks) — background AIS traffic is allowed to run off-canvas rather
    // than stretching the whole scene out to fit every distant vessel.
    const lons: number[] = [investigationCase.location.longitude];
    const lats: number[] = [investigationCase.location.latitude];
    const relevantVessels = allVessels.filter((v) => CANDIDATE_VESSEL_IDS.includes(v.id));
    relevantVessels.forEach((v) => v.trajectory.forEach((p) => { lons.push(p.longitude); lats.push(p.latitude); }));
    if (slick) slick.geometry.coordinates[0].forEach(([lon, lat]) => { lons.push(lon); lats.push(lat); });
    if (hindcast) { lons.push(hindcast.originZone.longitude); lats.push(hindcast.originZone.latitude); }
    if (forecast) forecast.affectedArea.coordinates[0].forEach(([lon, lat]) => { lons.push(lon); lats.push(lat); });
    return {
      minLon: Math.min(...lons),
      maxLon: Math.max(...lons),
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
    };
  }, [allVessels, slick, hindcast, forecast, investigationCase.location]);

  const projector = useMemo(() => createProjector(bounds, VIEW_W, VIEW_H, 0.14), [bounds]);
  const project = projector.project;

  const aisRevealed = ["AIS_CORRELATION_COMPLETE", "CANDIDATES_READY", "VALIDATING", "CASE_COMPLETE"].includes(
    investigationCase.appState
  );
  const rankingComplete = ["CANDIDATES_READY", "VALIDATING", "CASE_COMPLETE"].includes(investigationCase.appState);

  const candidateIds = new Set(candidates.map((c) => c.vessel.id));

  const zoomBy = useCallback((factor: number) => {
    setScale((s) => Math.min(4, Math.max(0.5, s * factor)));
  }, []);

  const resetView = useCallback(() => {
    setScale(1);
    setTx(0);
    setTy(0);
  }, []);

  const fitToInvestigation = useCallback(() => {
    if (!slick) { resetView(); return; }
    const [cx, cy] = project(slick.centroid.longitude, slick.centroid.latitude);
    setScale(1.8);
    setTx(VIEW_W / 2 - cx * 1.8);
    setTy(VIEW_H / 2 - cy * 1.8);
  }, [slick, project, resetView]);

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    setDragging({ x: e.clientX - tx, y: e.clientY - ty });
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging) return;
    setTx(e.clientX - dragging.x);
    setTy(e.clientY - dragging.y);
  };
  const endDrag = () => setDragging(null);

  const onWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15);
  };

  return (
    <div className="map-shell" role="region" aria-label="Investigation map">
      <div className="map-toolbar" role="toolbar" aria-label="Map controls">
        <button type="button" className="map-btn" onClick={() => zoomBy(1.25)} aria-label="Zoom in">+</button>
        <button type="button" className="map-btn" onClick={() => zoomBy(1 / 1.25)} aria-label="Zoom out">−</button>
        <button type="button" className="map-btn" onClick={resetView} aria-label="Reset map view">Reset</button>
        <button type="button" className="map-btn" onClick={fitToInvestigation} aria-label="Fit to investigation">
          Fit
        </button>
        <div className="map-layer-menu-wrap">
          <button
            type="button"
            className="map-btn"
            onClick={() => setShowLayerMenu((v) => !v)}
            aria-expanded={showLayerMenu}
            aria-haspopup="true"
          >
            Layers
          </button>
          {showLayerMenu && (
            <div className="map-layer-menu" role="menu">
              {(Object.keys(LAYER_LABELS) as LayerKey[]).map((key) => (
                <label key={key} className="map-layer-item">
                  <input
                    type="checkbox"
                    checked={layers[key]}
                    onChange={() => setLayers((l) => ({ ...l, [key]: !l[key] }))}
                  />
                  <span>{LAYER_LABELS[key]}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="map-svg"
        role="img"
        aria-label={`Map showing investigation case ${investigationCase.id}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onWheel={onWheel}
      >
        <defs>
          <radialGradient id="ocean-grad" cx="50%" cy="35%" r="75%">
            <stop offset="0%" stopColor="#16202e" />
            <stop offset="100%" stopColor="#0b1320" />
          </radialGradient>
          <marker id="arrow-teal" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#2dd4bf" />
          </marker>
        </defs>

        <g transform={`translate(${tx},${ty}) scale(${scale})`}>
          <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="url(#ocean-grad)" />
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`gx${i}`} x1={0} y1={(VIEW_H / 8) * i} x2={VIEW_W} y2={(VIEW_H / 8) * i} stroke="#1f2937" strokeWidth={1} />
          ))}
          {Array.from({ length: 13 }).map((_, i) => (
            <line key={`gy${i}`} x1={(VIEW_W / 12) * i} y1={0} x2={(VIEW_W / 12) * i} y2={VIEW_H} stroke="#1f2937" strokeWidth={1} />
          ))}

          {/* AIS trajectories */}
          {layers.ais && aisRevealed && allVessels.map((vessel) => {
            const isCandidate = candidateIds.has(vessel.id);
            const isSelected = vessel.id === selectedVesselId;
            const isBackground = !CANDIDATE_VESSEL_IDS.includes(vessel.id);
            const d = pathFromLineString(vessel.trajectory.map((p) => [p.longitude, p.latitude]), project);
            const fadeOut = isBackground && rankingComplete;
            return (
              <path
                key={vessel.id}
                d={d}
                fill="none"
                stroke={isSelected ? "#0D9488" : isCandidate ? "#5eead4" : "#475569"}
                strokeWidth={isSelected ? 3.5 : isCandidate ? 2.2 : 1.3}
                strokeDasharray={isBackground ? "3 3" : undefined}
                opacity={fadeOut ? 0.08 : isBackground ? 0.55 : 0.9}
                style={{ transition: reducedMotion ? "none" : "opacity 900ms ease" }}
              />
            );
          })}

          {/* Forecast */}
          {layers.forecast && forecast && (
            <>
              <path
                d={pathFromPolygon(forecast.affectedArea.coordinates as [number, number][][], project)}
                fill="#D97706"
                opacity={0.12}
                stroke="#D97706"
                strokeOpacity={0.4}
              />
              <path
                d={pathFromLineString(forecast.path.coordinates as [number, number][], project)}
                fill="none"
                stroke="#D97706"
                strokeWidth={2}
                strokeDasharray="6 5"
                markerEnd="url(#arrow-teal)"
              />
            </>
          )}

          {/* Hindcast */}
          {layers.hindcast && hindcast && (
            <>
              {(() => {
                const [ox, oy] = project(hindcast.originZone.longitude, hindcast.originZone.latitude);
                const radiusPx = Math.max(10, hindcast.originUncertaintyRadiusKm * 3.2 * scale === 0 ? 10 : hindcast.originUncertaintyRadiusKm * 3.2);
                return (
                  <>
                    <path
                      d={pathFromLineString(hindcast.path.coordinates as [number, number][], project)}
                      fill="none"
                      stroke="#0D9488"
                      strokeWidth={2}
                      opacity={0.8}
                    />
                    <circle cx={ox} cy={oy} r={radiusPx} fill="#D97706" opacity={0.15} stroke="#D97706" strokeOpacity={0.5} strokeDasharray="4 3" />
                    <circle cx={ox} cy={oy} r={6} fill="#D97706" stroke="#111827" strokeWidth={1.5} />
                    <text x={ox + 10} y={oy - 8} fill="#FFFFFF" fontSize={12} fontWeight={600}>
                      Probable Origin
                    </text>
                  </>
                );
              })()}
            </>
          )}

          {/* Slick */}
          {layers.slick && slick && (
            <>
              <path
                d={pathFromPolygon(slick.geometry.coordinates as [number, number][][], project)}
                fill="#DC2626"
                fillOpacity={0.28}
                stroke="#f87171"
                strokeWidth={2}
                strokeDasharray="5 3"
              />
              {(() => {
                const [cx, cy] = project(slick.centroid.longitude, slick.centroid.latitude);
                return (
                  <>
                    <circle cx={cx} cy={cy} r={4} fill="#f87171" />
                    <text x={cx + 8} y={cy + 4} fill="#FFFFFF" fontSize={12} fontWeight={600}>
                      Detected Slick — {slick.confidence}% confidence
                    </text>
                  </>
                );
              })()}
            </>
          )}

          {/* Candidate markers */}
          {layers.candidates && rankingComplete && candidates.map((c) => {
            const last = c.vessel.trajectory[c.vessel.trajectory.length - 1];
            const [x, y] = project(last.longitude, last.latitude);
            const isSelected = c.vessel.id === selectedVesselId;
            const color = c.attributionScore >= 75 ? "#DC2626" : c.attributionScore >= 50 ? "#D97706" : "#94A3B8";
            return (
              <g
                key={c.vessel.id}
                role="button"
                tabIndex={0}
                aria-label={`${c.vessel.name}, candidate rank ${c.rank}, attribution score ${c.attributionScore} of 100`}
                onClick={() => onSelectVessel(c.vessel.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectVessel(c.vessel.id); } }}
                style={{ cursor: "pointer" }}
              >
                {isSelected && <circle cx={x} cy={y} r={14} fill="none" stroke="#0D9488" strokeWidth={2.5} />}
                <circle cx={x} cy={y} r={10} fill={color} stroke="#111827" strokeWidth={2} />
                <text x={x} y={y + 4} fill="#111827" fontSize={11} fontWeight={700} textAnchor="middle">
                  {c.rank}
                </text>
                <text x={x + 14} y={y - 10} fill="#FFFFFF" fontSize={11} fontWeight={600}>
                  {c.vessel.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <MapLegend />
    </div>
  );
}
