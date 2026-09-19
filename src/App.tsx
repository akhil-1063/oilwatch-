import { useEffect, useMemo, useState } from "react";
import "./App.css";

import { useCaseStore } from "./stores/caseStore";
import { useSettingsStore } from "./stores/settingsStore";
import { useProcessingStore } from "./stores/processingStore";

import { TopBar } from "./components/layout/TopBar";
import { ProcessBar } from "./components/layout/ProcessBar";
import { MaritimeMap } from "./components/map/MaritimeMap";
import { ProcessingControls } from "./components/analysis/ProcessingControls";
import { SpillDetectionPanel } from "./components/analysis/SpillDetectionPanel";
import { OriginPanel } from "./components/analysis/OriginPanel";
import { ObservationCapture } from "./components/analysis/ObservationCapture";
import { CandidateList } from "./components/candidates/CandidateList";
import { EvidenceDrawer } from "./components/evidence/EvidenceDrawer";
import { CaseIntakeForm } from "./components/cases/CaseIntakeForm";
import { CaseManagerModal } from "./components/cases/CaseManagerModal";
import { AdminView } from "./components/admin/AdminView";
import { WorkflowPage } from "./pages/WorkflowPage";
import { AccessibilityPanel } from "./components/accessibility/AccessibilityPanel";
import { Modal } from "./components/common/Modal";

import { downloadCaseExport } from "./services/exportService";
import type { NewCaseInput } from "./data/caseFactory";
import type { Role } from "./types";
import { buildInitialSteps } from "./data/processingSteps";

type ModalKind = "none" | "caseManager" | "caseIntake" | "accessibility";

function App() {
  const hydrated = useCaseStore((s) => s.hydrated);
  const hydrate = useCaseStore((s) => s.hydrate);
  const cases = useCaseStore((s) => s.cases);
  const activeCaseId = useCaseStore((s) => s.activeCaseId);
  const setActiveCase = useCaseStore((s) => s.setActiveCase);
  const createCase = useCaseStore((s) => s.createCase);
  const renameCase = useCaseStore((s) => s.renameCase);
  const deleteCase = useCaseStore((s) => s.deleteCase);
  const updateCase = useCaseStore((s) => s.updateCase);
  const resetDemoCase = useCaseStore((s) => s.resetDemoCase);
  const storageError = useCaseStore((s) => s.storageError);
  const observationsByCase = useCaseStore((s) => s.observations);
  const addObservation = useCaseStore((s) => s.addObservation);
  const deleteObservation = useCaseStore((s) => s.deleteObservation);

  const role = useSettingsStore((s) => s.role);
  const setRole = useSettingsStore((s) => s.setRole);
  const highContrast = useSettingsStore((s) => s.highContrast);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const textScale = useSettingsStore((s) => s.textScale);

  const processing = useProcessingStore();

  const [view, setView] = useState<"console" | "admin" | "workflow">("console");
  const [modal, setModal] = useState<ModalKind>("none");
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    document.documentElement.setAttribute("data-high-contrast", String(highContrast));
    document.documentElement.style.setProperty("--text-scale", String(textScale));
    document.documentElement.style.setProperty("--motion", reducedMotion ? "0" : "1");
  }, [highContrast, reducedMotion, textScale]);

  useEffect(() => {
    setSelectedVesselId(null);
  }, [activeCaseId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const activeCase = activeCaseId ? cases[activeCaseId] ?? null : null;
  const caseList = useMemo(() => Object.values(cases), [cases]);
  const observations = activeCaseId ? observationsByCase[activeCaseId] ?? [] : [];

  const selectedCandidate = activeCase?.candidates.find((c) => c.vessel.id === selectedVesselId) ?? null;

  const isProcessingThisCase = processing.running && processing.caseId === activeCaseId;
  const steps = isProcessingThisCase ? processing.steps : buildInitialSteps();
  const liveMessage = isProcessingThisCase
    ? processing.liveMessage
    : activeCase?.appState === "CANDIDATES_READY" || activeCase?.status === "Complete" || activeCase?.status === "Reviewed"
    ? "Analysis complete."
    : "";

  function handleRunAnalysis() {
    if (!activeCase) return;
    processing.start(activeCase.id, processing.speed);
  }

  function handleCreateCase(input: NewCaseInput) {
    createCase(input).then(() => {
      setModal("none");
      setToast("Case created.");
    });
  }

  function handleExport() {
    if (!activeCase) return;
    try {
      downloadCaseExport(activeCase, observations);
      setToast("Case JSON exported.");
    } catch {
      setToast("Export failed. Please try again.");
    }
  }

  function handleReview() {
    if (!activeCase) return;
    updateCase(activeCase.id, {
      status: "Reviewed",
      appState: "CASE_COMPLETE",
      review: {
        reviewedAt: new Date().toISOString(),
        reviewedBy: role,
        reviewNotes: "Reviewed via investigator console.",
      },
    });
    setToast("Case marked reviewed.");
  }

  function handleReturnToAnalysis() {
    if (!activeCase) return;
    updateCase(activeCase.id, { status: "Complete", appState: "CANDIDATES_READY", review: null });
  }

  function handleDemoReset() {
    resetDemoCase().then(() => {
      setModal("none");
      setToast("Demo case reset.");
    });
  }

  if (!hydrated) {
    return (
      <div className="app-shell" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading OilWatch Intelligence Console…</p>
      </div>
    );
  }

  const canRunAnalysis = !!activeCase && role !== "Viewer";
  const canReview = !!activeCase && (role === "Analyst" || role === "Supervisor") && activeCase.candidates.length > 0;
  const isReadyToValidate =
    activeCase &&
    (activeCase.appState === "CANDIDATES_READY" || activeCase.status === "Complete") &&
    activeCase.status !== "Reviewed";

  return (
    <div className="app-shell">
      <TopBar
        activeCase={activeCase}
        view={view}
        onChangeView={setView}
        onOpenCaseManager={() => setModal("caseManager")}
        onOpenAccessibility={() => setModal("accessibility")}
        onExport={handleExport}
        onOpenDemo={handleDemoReset}
        role={role}
        onChangeRole={(r: Role) => setRole(r)}
        storageOk={!storageError}
      />

      {storageError && (
        <div className="error-banner" role="alert" style={{ margin: "8px 16px 0" }}>
          {storageError}
        </div>
      )}

      {view === "admin" ? (
        <AdminView cases={caseList} />
      ) : view === "workflow" ? (
        <WorkflowPage investigationCase={activeCase} />
      ) : (
        <main className="app-main">
          <section className="map-pane">
            {activeCase ? (
              <MaritimeMap
                investigationCase={activeCase}
                selectedVesselId={selectedVesselId}
                onSelectVessel={(id) => setSelectedVesselId(id)}
              />
            ) : (
              <div className="empty-state">No case selected. Open the case manager to create or select one.</div>
            )}
          </section>

          <aside className="intel-pane" aria-label="Intelligence panel">
            {activeCase && (
              <ProcessingControls
                speed={processing.speed}
                onChangeSpeed={processing.setSpeed}
                running={isProcessingThisCase}
                paused={processing.paused}
                canRun={canRunAnalysis}
                onRun={handleRunAnalysis}
                onPause={processing.pause}
                onResume={processing.resume}
                onRestart={processing.restart}
              />
            )}

            <SpillDetectionPanel slick={activeCase?.slick ?? null} />
            <OriginPanel hindcast={activeCase?.hindcast ?? null} forecast={activeCase?.forecast ?? null} />

            <section className="panel-section" aria-label="Candidate Vessels">
              <h2 className="panel-section-title">Candidate Vessels</h2>
              <CandidateList
                candidates={activeCase?.candidates ?? []}
                selectedVesselId={selectedVesselId}
                onSelect={(id) => setSelectedVesselId(id)}
                analysisStarted={!!activeCase?.slick}
              />
            </section>

            {selectedCandidate && (
              <EvidenceDrawer candidate={selectedCandidate} onClose={() => setSelectedVesselId(null)} />
            )}

            {isReadyToValidate && (
              <section className="panel-section" aria-label="Case Validation">
                <h2 className="panel-section-title">Validation</h2>
                <p className="panel-empty-state" style={{ marginBottom: 8 }}>
                  Review the evidence above, then record an analyst decision on this case.
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="btn-primary" onClick={handleReview} disabled={!canReview}>
                    Mark Case Reviewed
                  </button>
                  <button type="button" className="btn-ghost" onClick={handleReturnToAnalysis}>
                    Return to Analysis
                  </button>
                </div>
              </section>
            )}

            {activeCase?.review && (
              <section className="panel-section" aria-label="Review Record">
                <h2 className="panel-section-title">Review Record</h2>
                <p className="panel-empty-state">
                  Reviewed by {activeCase.review.reviewedBy} on {new Date(activeCase.review.reviewedAt).toLocaleString()}.
                </p>
              </section>
            )}

            {activeCase && (
              <section className="panel-section" aria-label="Analyst Observations">
                <h2 className="panel-section-title">Observation Capture</h2>
                <ObservationCapture
                  observations={observations}
                  onSave={(notes, duration) => addObservation(activeCase.id, notes, duration)}
                  onDelete={(id) => deleteObservation(id, activeCase.id)}
                />
              </section>
            )}
          </aside>
        </main>
      )}

      <ProcessBar steps={steps} liveMessage={liveMessage} />

      {modal === "caseManager" && (
        <Modal title="Case Manager" onClose={() => setModal("none")} wide>
          <CaseManagerModal
            cases={caseList}
            activeCaseId={activeCaseId}
            onOpen={(id) => {
              setActiveCase(id);
              setModal("none");
            }}
            onRename={(id, name) => renameCase(id, name)}
            onDelete={(id) => deleteCase(id)}
            onCreateNew={() => setModal("caseIntake")}
          />
        </Modal>
      )}

      {modal === "caseIntake" && (
        <Modal title="New Investigation Case" onClose={() => setModal("none")}>
          <CaseIntakeForm onSubmit={handleCreateCase} onCancel={() => setModal("none")} />
        </Modal>
      )}

      {modal === "accessibility" && (
        <Modal title="Accessibility Settings" onClose={() => setModal("none")}>
          <AccessibilityPanel />
        </Modal>
      )}

      {toast && (
        <div className="toast-banner" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
