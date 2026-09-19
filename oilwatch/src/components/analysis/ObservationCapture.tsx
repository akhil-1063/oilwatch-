import { useEffect, useRef, useState } from "react";
import { useSettingsStore } from "../../stores/settingsStore";
import type { Observation } from "../../types";

interface ObservationCaptureProps {
  observations: Observation[];
  onSave: (notes: string, durationSeconds: number) => void;
  onDelete: (id: string) => void;
}

const BAR_COUNT = 24;
const BASE_HEIGHT = 6;
const AMPLITUDE = 18;

function staticBarHeights(): number[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => BASE_HEIGHT + AMPLITUDE * 0.5 * (1 + Math.sin(i)));
}

function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function ObservationCapture({ observations, onSave, onDelete }: ObservationCaptureProps) {
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);

  const [isCapturing, setIsCapturing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showNotesForm, setShowNotesForm] = useState(false);
  const [notes, setNotes] = useState("");
  const [barHeights, setBarHeights] = useState<number[]>(() => staticBarHeights());

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);
  const notesRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!isCapturing) return undefined;

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCapturing]);

  useEffect(() => {
    if (!isCapturing) return undefined;

    if (reducedMotion) {
      setBarHeights(staticBarHeights());
      return undefined;
    }

    let start = performance.now();
    function tick(now: number) {
      const t = (now - start) / 300;
      setBarHeights(
        Array.from({ length: BAR_COUNT }, (_, i) => BASE_HEIGHT + AMPLITUDE * (0.5 + 0.5 * Math.sin(t + i)))
      );
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isCapturing, reducedMotion]);

  useEffect(() => {
    if (showNotesForm) {
      notesRef.current?.focus();
    }
  }, [showNotesForm]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function handleStartCapture() {
    setIsCapturing(true);
    setShowNotesForm(false);
    setElapsedSeconds(0);
    setNotes("");
  }

  function handleStopCapture() {
    setIsCapturing(false);
    setShowNotesForm(true);
    setBarHeights(staticBarHeights());
  }

  function handleClear() {
    setIsCapturing(false);
    setShowNotesForm(false);
    setElapsedSeconds(0);
    setNotes("");
    setBarHeights(staticBarHeights());
  }

  function handleSaveObservation() {
    onSave(notes, elapsedSeconds);
    setShowNotesForm(false);
    setElapsedSeconds(0);
    setNotes("");
  }

  return (
    <div className="observation-capture">
      <div className="waveform-container">
        <svg
          className="waveform"
          viewBox={`0 0 ${BAR_COUNT * 4} 40`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {barHeights.map((height, i) => (
            <rect
              key={i}
              className="waveform-bar"
              x={i * 4}
              y={20 - height / 2}
              width={2.5}
              style={{ height }}
            />
          ))}
        </svg>
        <span className="capture-timer" aria-live="polite">
          {formatElapsed(elapsedSeconds)}
        </span>
      </div>

      <div className="capture-controls">
        <button
          type="button"
          className="btn-primary"
          onClick={handleStartCapture}
          disabled={isCapturing}
          aria-pressed={isCapturing}
        >
          Start Capture
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={handleStopCapture}
          disabled={!isCapturing}
          aria-pressed={!isCapturing && showNotesForm}
        >
          Stop Capture
        </button>
        <button type="button" className="btn-ghost" onClick={handleClear}>
          Clear
        </button>
      </div>

      {showNotesForm && (
        <div className="capture-notes-form">
          <label htmlFor="observation-notes">Describe the observation</label>
          <textarea
            id="observation-notes"
            ref={notesRef}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
          <button type="button" className="btn-primary" onClick={handleSaveObservation}>
            Save Observation
          </button>
        </div>
      )}

      <div className="observation-list">
        {observations.length === 0 ? (
          <p className="observation-empty">No analyst observations recorded.</p>
        ) : (
          observations.map((o) => (
            <div key={o.id} className="observation-item">
              <div className="observation-item-header">
                <span className="observation-timestamp">{new Date(o.createdAt).toLocaleString()}</span>
                <span className="observation-duration">{formatElapsed(o.durationSeconds)}</span>
              </div>
              <p className="observation-notes">{o.notes}</p>
              <button
                type="button"
                className="btn-danger"
                onClick={() => onDelete(o.id)}
                aria-label={`Delete observation from ${new Date(o.createdAt).toLocaleString()}`}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
