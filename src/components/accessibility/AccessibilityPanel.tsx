import { useSettingsStore } from "../../stores/settingsStore";

const TEXT_SCALE_OPTIONS: { label: string; scale: number }[] = [
  { label: "Default", scale: 1 },
  { label: "Large", scale: 1.15 },
  { label: "Larger", scale: 1.3 },
];

const SCALE_EPSILON = 0.01;

export function AccessibilityPanel() {
  const highContrast = useSettingsStore((s) => s.highContrast);
  const toggleHighContrast = useSettingsStore((s) => s.toggleHighContrast);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const toggleReducedMotion = useSettingsStore((s) => s.toggleReducedMotion);
  const textScale = useSettingsStore((s) => s.textScale);
  const setTextScale = useSettingsStore((s) => s.setTextScale);

  return (
    <div className="a11y-panel">
      <div className="a11y-toggle-row">
        <span className="a11y-toggle-label">High Contrast Mode</span>
        <button
          type="button"
          role="switch"
          aria-checked={highContrast}
          className={highContrast ? "a11y-switch a11y-switch-on" : "a11y-switch"}
          onClick={toggleHighContrast}
        >
          <span className="a11y-switch-track">
            <span className="a11y-switch-thumb" />
          </span>
          <span className="sr-only">Toggle high contrast mode</span>
        </button>
        <p>Increases contrast between text, panels, and borders for low-vision users.</p>
      </div>

      <div className="a11y-toggle-row">
        <span className="a11y-toggle-label">Reduced Motion</span>
        <button
          type="button"
          role="switch"
          aria-checked={reducedMotion}
          className={reducedMotion ? "a11y-switch a11y-switch-on" : "a11y-switch"}
          onClick={toggleReducedMotion}
        >
          <span className="a11y-switch-track">
            <span className="a11y-switch-thumb" />
          </span>
          <span className="sr-only">Toggle reduced motion</span>
        </button>
        <p>
          Disables non-essential animation across the console, including the processing stepper and
          waveform.
        </p>
      </div>

      <div className="a11y-toggle-row">
        <span className="a11y-toggle-label">Interface Text Size</span>
        <div className="a11y-text-scale-group" role="group" aria-label="Interface text size">
          {TEXT_SCALE_OPTIONS.map((option) => {
            const active = Math.abs(textScale - option.scale) < SCALE_EPSILON;
            return (
              <button
                key={option.label}
                type="button"
                className={active ? "chip chip-active" : "chip"}
                aria-pressed={active}
                onClick={() => setTextScale(option.scale)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <p>Scales interface text without breaking layout.</p>
      </div>
    </div>
  );
}
