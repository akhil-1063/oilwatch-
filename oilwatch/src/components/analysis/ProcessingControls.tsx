import type { ProcessingSpeed } from "../../types";

interface ProcessingControlsProps {
  speed: ProcessingSpeed;
  onChangeSpeed: (speed: ProcessingSpeed) => void;
  running: boolean;
  paused: boolean;
  canRun: boolean;
  onRun: () => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
}

const SPEEDS: ProcessingSpeed[] = ["Fast", "Normal", "Slow"];

export function ProcessingControls({
  speed,
  onChangeSpeed,
  running,
  paused,
  canRun,
  onRun,
  onPause,
  onResume,
  onRestart,
}: ProcessingControlsProps) {
  return (
    <div className="processing-controls">
      <div className="speed-toggle" role="group" aria-label="Processing speed">
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            className={`speed-btn ${speed === s ? "active" : ""}`}
            onClick={() => onChangeSpeed(s)}
            aria-pressed={speed === s}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="processing-actions">
        {!running && (
          <button type="button" className="btn-primary" onClick={onRun} disabled={!canRun}>
            Run Analysis
          </button>
        )}
        {running && !paused && (
          <button type="button" className="btn-secondary" onClick={onPause}>
            Pause
          </button>
        )}
        {running && paused && (
          <button type="button" className="btn-secondary" onClick={onResume}>
            Resume
          </button>
        )}
        {running && (
          <button type="button" className="btn-ghost" onClick={onRestart}>
            Restart Analysis
          </button>
        )}
      </div>
    </div>
  );
}
