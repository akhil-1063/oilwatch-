import type { ProcessingStep } from "../../types";
import { useSettingsStore } from "../../stores/settingsStore";

interface ProcessBarProps {
  steps: ProcessingStep[];
  liveMessage: string;
}

const ICONS: Record<ProcessingStep["status"], string> = {
  pending: "○",
  active: "●",
  completed: "✓",
  error: "✕",
};

export function ProcessBar({ steps, liveMessage }: ProcessBarProps) {
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);

  return (
    <footer className="process-bar" aria-label="Analysis pipeline progress">
      <ol className="process-steps">
        {steps.map((step) => (
          <li key={step.id} className={`process-step status-${step.status}`}>
            <span
              className={`process-step-icon ${step.status === "active" && !reducedMotion ? "pulse" : ""}`}
              aria-hidden="true"
            >
              {ICONS[step.status]}
            </span>
            <span className="process-step-label">{step.label}</span>
          </li>
        ))}
      </ol>
      <div className="sr-only" role="status" aria-live="polite">
        {liveMessage}
      </div>
    </footer>
  );
}
