import { create } from "zustand";
import type { ProcessingSpeed, ProcessingStep, ProcessingSubState } from "../types";
import { PROCESSING_STEP_ORDER, buildInitialSteps, randomStepDuration } from "../data/processingSteps";
import { useCaseStore } from "./caseStore";
import { detectOilSlick } from "../services/slickDetectionService";
import { runForecast, runHindcast } from "../services/driftService";
import { correlateAIS } from "../services/aisService";

interface ProcessingStoreState {
  caseId: string | null;
  steps: ProcessingStep[];
  currentIndex: number;
  running: boolean;
  paused: boolean;
  speed: ProcessingSpeed;
  timeoutId: number | null;
  liveMessage: string;

  start: (caseId: string, speed?: ProcessingSpeed) => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  setSpeed: (speed: ProcessingSpeed) => void;
}

function clearActiveTimeout(id: number | null) {
  if (id !== null) window.clearTimeout(id);
}

export const useProcessingStore = create<ProcessingStoreState>((set, get) => {
  function applyStepOutcome(caseId: string, stepId: ProcessingSubState) {
    const investigationCase = useCaseStore.getState().cases[caseId];
    if (!investigationCase) return;
    const { updateCase } = useCaseStore.getState();

    switch (stepId) {
      case "DETECTING": {
        const slick = detectOilSlick(caseId, investigationCase.location);
        updateCase(caseId, { slick });
        break;
      }
      case "CHARACTERIZING": {
        updateCase(caseId, { appState: "DETECTION_COMPLETE" });
        break;
      }
      case "HINDCASTING": {
        const current = useCaseStore.getState().cases[caseId];
        if (current?.slick) {
          const hindcast = runHindcast(caseId, current.slick, current.location);
          updateCase(caseId, { hindcast });
        }
        break;
      }
      case "FORECASTING": {
        const current = useCaseStore.getState().cases[caseId];
        if (current?.slick) {
          const forecast = runForecast(caseId, current.slick);
          updateCase(caseId, { forecast, appState: "HINDCAST_COMPLETE" });
        }
        break;
      }
      case "CORRELATING_AIS": {
        const current = useCaseStore.getState().cases[caseId];
        if (current?.slick && current?.hindcast) {
          const { aisAnalysis } = correlateAIS(caseId, current.slick, current.hindcast);
          updateCase(caseId, { aisAnalysis, appState: "AIS_CORRELATION_COMPLETE" });
        }
        break;
      }
      case "RANKING": {
        const current = useCaseStore.getState().cases[caseId];
        if (current?.slick && current?.hindcast) {
          const { candidates } = correlateAIS(caseId, current.slick, current.hindcast);
          updateCase(caseId, { candidates, appState: "CANDIDATES_READY", status: "Complete" });
        }
        break;
      }
      default:
        break;
    }
  }

  function scheduleStep(index: number) {
    const { steps, caseId, speed, paused } = get();
    if (!caseId || paused) return;

    if (index >= steps.length) {
      set({ running: false, timeoutId: null, liveMessage: "Analysis complete." });
      return;
    }

    const nextSteps = steps.map((s, i) => (i === index ? { ...s, status: "active" as const } : s));
    set({ steps: nextSteps, currentIndex: index, liveMessage: `${nextSteps[index].message}` });

    const duration = randomStepDuration(speed);
    const timeoutId = window.setTimeout(() => {
      const state = get();
      if (state.paused || state.caseId !== caseId) return;

      applyStepOutcome(caseId, state.steps[index].id);

      const completedSteps = state.steps.map((s, i) => (i === index ? { ...s, status: "completed" as const } : s));
      set({ steps: completedSteps });
      scheduleStep(index + 1);
    }, duration);

    set({ timeoutId });
  }

  return {
    caseId: null,
    steps: buildInitialSteps(),
    currentIndex: -1,
    running: false,
    paused: false,
    speed: "Normal",
    timeoutId: null,
    liveMessage: "",

    start: (caseId, speed) => {
      clearActiveTimeout(get().timeoutId);
      const nextSpeed = speed ?? get().speed;
      useCaseStore.getState().updateCase(caseId, {
        appState: "PROCESSING",
        status: "Processing",
        slick: null,
        hindcast: null,
        forecast: null,
        aisAnalysis: null,
        candidates: [],
        selectedCandidateVesselId: null,
        review: null,
      });
      set({
        caseId,
        steps: buildInitialSteps(),
        currentIndex: -1,
        running: true,
        paused: false,
        speed: nextSpeed,
        timeoutId: null,
        liveMessage: "Scanning satellite observation...",
      });
      scheduleStep(0);
    },

    pause: () => {
      clearActiveTimeout(get().timeoutId);
      set({ paused: true, timeoutId: null });
    },

    resume: () => {
      const { paused, currentIndex } = get();
      if (!paused) return;
      set({ paused: false });
      scheduleStep(Math.max(currentIndex, 0));
    },

    restart: () => {
      const { caseId, speed } = get();
      if (!caseId) return;
      clearActiveTimeout(get().timeoutId);
      get().start(caseId, speed);
    },

    setSpeed: (speed) => set({ speed }),
  };
});

export { PROCESSING_STEP_ORDER };
