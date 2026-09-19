import { useMemo, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import type { NewCaseInput } from "../../data/caseFactory";
import type { ImageryType, SatelliteSource } from "../../types";

interface CaseIntakeFormProps {
  onSubmit: (input: NewCaseInput) => void;
  onCancel: () => void;
}

const LATITUDE_PATTERN = /^-?(?:90(?:\.0+)?|(?:[0-8]?\d)(?:\.\d+)?)$/;
const LONGITUDE_PATTERN = /^-?(?:180(?:\.0+)?|(?:1[0-7]\d|[0-9]?\d)(?:\.\d+)?)$/;

const SATELLITE_SOURCES: SatelliteSource[] = ["SAR", "EO", "SAR + EO"];
const IMAGERY_TYPES: ImageryType[] = ["Sentinel-style SAR", "Optical EO", "Combined"];

const DEMO_ASSET_LABEL = "Sentinel-1 SAR Observation (demo asset)";

interface FormFields {
  name: string;
  incidentDate: string;
  incidentTime: string;
  region: string;
  latitude: string;
  longitude: string;
  satelliteSource: SatelliteSource;
  imageryType: ImageryType;
  analystNotes: string;
}

type TouchedFields = Partial<Record<keyof FormFields, boolean>>;

const INITIAL_FIELDS: FormFields = {
  name: "",
  incidentDate: "",
  incidentTime: "",
  region: "",
  latitude: "",
  longitude: "",
  satelliteSource: "SAR",
  imageryType: "Sentinel-style SAR",
  analystNotes: "",
};

export function CaseIntakeForm({ onSubmit, onCancel }: CaseIntakeFormProps) {
  const [fields, setFields] = useState<FormFields>(INITIAL_FIELDS);
  const [touched, setTouched] = useState<TouchedFields>({});
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const errors = useMemo(() => {
    const next: Partial<Record<keyof FormFields, string>> = {};
    if (fields.name.trim().length < 3) {
      next.name = "Case name must be at least 3 characters.";
    }
    if (!fields.incidentDate) {
      next.incidentDate = "Incident date is required.";
    }
    if (!fields.incidentTime) {
      next.incidentTime = "Incident time is required.";
    }
    if (!fields.region.trim()) {
      next.region = "Region is required.";
    }
    if (!LATITUDE_PATTERN.test(fields.latitude)) {
      next.latitude = "Enter a valid latitude between -90 and 90.";
    }
    if (!LONGITUDE_PATTERN.test(fields.longitude)) {
      next.longitude = "Enter a valid longitude between -180 and 180.";
    }
    return next;
  }, [fields]);

  const isValid = Object.keys(errors).length === 0;

  function markTouched(field: keyof FormFields) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function updateField<K extends keyof FormFields>(field: K, value: FormFields[K]) {
    setFields((prev) => ({ ...prev, [field]: value }));
  }

  function handleTextChange(field: keyof FormFields) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      updateField(field, e.target.value as FormFields[typeof field]);
    };
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const droppedName = e.dataTransfer.files[0]?.name;
    if (droppedName) {
      setSelectedAsset(droppedName);
    }
  }

  function handleUseDemoAsset() {
    setSelectedAsset(DEMO_ASSET_LABEL);
  }

  function handleClearAsset() {
    setSelectedAsset(null);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({
      name: true,
      incidentDate: true,
      incidentTime: true,
      region: true,
      latitude: true,
      longitude: true,
    });
    if (!isValid) return;

    onSubmit({
      name: fields.name,
      incidentDate: fields.incidentDate,
      incidentTime: fields.incidentTime,
      region: fields.region,
      latitude: Number(fields.latitude),
      longitude: Number(fields.longitude),
      satelliteSource: fields.satelliteSource,
      imageryType: fields.imageryType,
      analystNotes: fields.analystNotes,
    });
  }

  return (
    <form className="intake-form" onSubmit={handleSubmit} noValidate>
      <div className="field-group">
        <label htmlFor="case-name">Case name</label>
        <input
          id="case-name"
          type="text"
          value={fields.name}
          onChange={handleTextChange("name")}
          onBlur={() => markTouched("name")}
          aria-invalid={touched.name && errors.name ? "true" : "false"}
          aria-describedby={touched.name && errors.name ? "case-name-error" : undefined}
          required
        />
        {touched.name && errors.name && (
          <p id="case-name-error" className="field-error">
            {errors.name}
          </p>
        )}
      </div>

      <div className="field-row">
        <div className="field-group">
          <label htmlFor="incident-date">Incident date</label>
          <input
            id="incident-date"
            type="date"
            value={fields.incidentDate}
            onChange={handleTextChange("incidentDate")}
            onBlur={() => markTouched("incidentDate")}
            aria-invalid={touched.incidentDate && errors.incidentDate ? "true" : "false"}
            aria-describedby={touched.incidentDate && errors.incidentDate ? "incident-date-error" : undefined}
            required
          />
          {touched.incidentDate && errors.incidentDate && (
            <p id="incident-date-error" className="field-error">
              {errors.incidentDate}
            </p>
          )}
        </div>

        <div className="field-group">
          <label htmlFor="incident-time">Incident time</label>
          <input
            id="incident-time"
            type="time"
            value={fields.incidentTime}
            onChange={handleTextChange("incidentTime")}
            onBlur={() => markTouched("incidentTime")}
            aria-invalid={touched.incidentTime && errors.incidentTime ? "true" : "false"}
            aria-describedby={touched.incidentTime && errors.incidentTime ? "incident-time-error" : undefined}
            required
          />
          {touched.incidentTime && errors.incidentTime && (
            <p id="incident-time-error" className="field-error">
              {errors.incidentTime}
            </p>
          )}
        </div>
      </div>

      <div className="field-group">
        <label htmlFor="region">Region</label>
        <input
          id="region"
          type="text"
          value={fields.region}
          onChange={handleTextChange("region")}
          onBlur={() => markTouched("region")}
          aria-invalid={touched.region && errors.region ? "true" : "false"}
          aria-describedby={touched.region && errors.region ? "region-error" : undefined}
          required
        />
        {touched.region && errors.region && (
          <p id="region-error" className="field-error">
            {errors.region}
          </p>
        )}
      </div>

      <div className="field-row">
        <div className="field-group">
          <label htmlFor="latitude">Latitude</label>
          <input
            id="latitude"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 12.958"
            value={fields.latitude}
            onChange={handleTextChange("latitude")}
            onBlur={() => markTouched("latitude")}
            aria-invalid={touched.latitude && errors.latitude ? "true" : "false"}
            aria-describedby={touched.latitude && errors.latitude ? "latitude-error" : undefined}
            required
          />
          {touched.latitude && errors.latitude && (
            <p id="latitude-error" className="field-error">
              {errors.latitude}
            </p>
          )}
        </div>

        <div className="field-group">
          <label htmlFor="longitude">Longitude</label>
          <input
            id="longitude"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 72.268"
            value={fields.longitude}
            onChange={handleTextChange("longitude")}
            onBlur={() => markTouched("longitude")}
            aria-invalid={touched.longitude && errors.longitude ? "true" : "false"}
            aria-describedby={touched.longitude && errors.longitude ? "longitude-error" : undefined}
            required
          />
          {touched.longitude && errors.longitude && (
            <p id="longitude-error" className="field-error">
              {errors.longitude}
            </p>
          )}
        </div>
      </div>

      <div className="field-row">
        <div className="field-group">
          <label htmlFor="satellite-source">Satellite source</label>
          <select
            id="satellite-source"
            value={fields.satelliteSource}
            onChange={(e) => updateField("satelliteSource", e.target.value as SatelliteSource)}
          >
            {SATELLITE_SOURCES.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="imagery-type">Imagery type</label>
          <select
            id="imagery-type"
            value={fields.imageryType}
            onChange={(e) => updateField("imageryType", e.target.value as ImageryType)}
          >
            {IMAGERY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-group">
        <label htmlFor="analyst-notes">Analyst notes</label>
        <textarea
          id="analyst-notes"
          value={fields.analystNotes}
          onChange={handleTextChange("analystNotes")}
          rows={3}
        />
      </div>

      <div className="field-group">
        <span className="field-group-label">Satellite imagery simulator</span>
        <div
          className={`dropzone ${isDragOver ? "dropzone-active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p>Drag a file here to simulate an imagery upload, or use the demo asset below.</p>
          <button type="button" className="btn-secondary demo-asset-chip" onClick={handleUseDemoAsset}>
            Use Sentinel-1 SAR Observation (demo asset)
          </button>
        </div>
        {selectedAsset && (
          <span className="selected-asset-chip">
            {selectedAsset}
            <button
              type="button"
              className="icon-btn"
              onClick={handleClearAsset}
              aria-label="Clear selected asset"
            >
              ✕
            </button>
          </span>
        )}
      </div>

      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className={`btn-primary ${!isValid ? "btn-disabled" : ""}`}
          disabled={!isValid}
          aria-disabled={!isValid}
        >
          Create Case
        </button>
      </div>
    </form>
  );
}
