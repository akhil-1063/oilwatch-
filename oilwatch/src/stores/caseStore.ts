import { create } from "zustand";
import { db } from "../services/storageService";
import { buildDemoCase, buildNewCase, type NewCaseInput } from "../data/caseFactory";
import { DEMO_CASE_ID } from "../data/fixtures";
import type { InvestigationCase, Observation } from "../types";

interface CaseStoreState {
  cases: Record<string, InvestigationCase>;
  observations: Record<string, Observation[]>;
  activeCaseId: string | null;
  hydrated: boolean;
  storageError: string | null;

  hydrate: () => Promise<void>;
  createCase: (input: NewCaseInput) => Promise<InvestigationCase>;
  updateCase: (id: string, patch: Partial<InvestigationCase>) => Promise<void>;
  renameCase: (id: string, name: string) => Promise<void>;
  deleteCase: (id: string) => Promise<void>;
  setActiveCase: (id: string | null) => void;
  resetDemoCase: () => Promise<void>;

  addObservation: (caseId: string, notes: string, durationSeconds: number) => Promise<Observation>;
  updateObservation: (id: string, patch: Partial<Observation>) => Promise<void>;
  deleteObservation: (id: string, caseId: string) => Promise<void>;
}

export const useCaseStore = create<CaseStoreState>((set, get) => ({
  cases: {},
  observations: {},
  activeCaseId: null,
  hydrated: false,
  storageError: null,

  hydrate: async () => {
    try {
      await db.open();
      const storedCases = await db.cases.toArray();
      const storedObservations = await db.observations.toArray();

      let casesMap: Record<string, InvestigationCase> = {};
      storedCases.forEach((c) => (casesMap[c.id] = c));

      if (!casesMap[DEMO_CASE_ID]) {
        const demo = buildDemoCase();
        await db.cases.put(demo);
        casesMap[DEMO_CASE_ID] = demo;
      }

      const obsMap: Record<string, Observation[]> = {};
      storedObservations.forEach((o) => {
        obsMap[o.caseId] = obsMap[o.caseId] || [];
        obsMap[o.caseId].push(o);
      });

      set({
        cases: casesMap,
        observations: obsMap,
        activeCaseId: DEMO_CASE_ID,
        hydrated: true,
        storageError: null,
      });
    } catch {
      const demo = buildDemoCase();
      set({
        cases: { [DEMO_CASE_ID]: demo },
        observations: {},
        activeCaseId: DEMO_CASE_ID,
        hydrated: true,
        storageError: "Local storage is unavailable. Changes will not persist after this session.",
      });
    }
  },

  createCase: async (input) => {
    const newCase = buildNewCase(input);
    try {
      await db.cases.put(newCase);
    } catch {
      set({ storageError: "Could not save the case to local storage. It will not persist after refresh." });
    }
    set((state) => ({ cases: { ...state.cases, [newCase.id]: newCase }, activeCaseId: newCase.id }));
    return newCase;
  },

  updateCase: async (id, patch) => {
    const existing = get().cases[id];
    if (!existing) return;
    const updated: InvestigationCase = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    try {
      await db.cases.put(updated);
    } catch {
      set({ storageError: "Could not persist the latest change to local storage." });
    }
    set((state) => ({ cases: { ...state.cases, [id]: updated } }));
  },

  renameCase: async (id, name) => {
    await get().updateCase(id, { name });
  },

  deleteCase: async (id) => {
    try {
      await db.cases.delete(id);
      const obsToDelete = (get().observations[id] || []).map((o) => o.id);
      if (obsToDelete.length) await db.observations.bulkDelete(obsToDelete);
    } catch {
      set({ storageError: "Could not delete the case from local storage." });
    }
    set((state) => {
      const cases = { ...state.cases };
      delete cases[id];
      const observations = { ...state.observations };
      delete observations[id];
      const activeCaseId = state.activeCaseId === id ? Object.keys(cases)[0] ?? null : state.activeCaseId;
      return { cases, observations, activeCaseId };
    });
  },

  setActiveCase: (id) => set({ activeCaseId: id }),

  resetDemoCase: async () => {
    const demo = buildDemoCase();
    try {
      await db.cases.put(demo);
    } catch {
      /* non-fatal for demo purposes */
    }
    set((state) => ({ cases: { ...state.cases, [DEMO_CASE_ID]: demo }, activeCaseId: DEMO_CASE_ID }));
  },

  addObservation: async (caseId, notes, durationSeconds) => {
    const observation: Observation = {
      id: `obs-${Date.now()}-${Math.round(Math.random() * 9999)}`,
      caseId,
      createdAt: new Date().toISOString(),
      durationSeconds,
      notes,
    };
    try {
      await db.observations.put(observation);
    } catch {
      set({ storageError: "Could not save the observation to local storage." });
    }
    set((state) => ({
      observations: { ...state.observations, [caseId]: [...(state.observations[caseId] || []), observation] },
    }));
    return observation;
  },

  updateObservation: async (id, patch) => {
    const state = get();
    let targetCaseId: string | null = null;
    for (const [caseId, list] of Object.entries(state.observations)) {
      if (list.some((o) => o.id === id)) {
        targetCaseId = caseId;
        break;
      }
    }
    if (!targetCaseId) return;
    const updatedList = state.observations[targetCaseId].map((o) => (o.id === id ? { ...o, ...patch } : o));
    const updatedObs = updatedList.find((o) => o.id === id)!;
    try {
      await db.observations.put(updatedObs);
    } catch {
      set({ storageError: "Could not persist observation changes." });
    }
    set({ observations: { ...state.observations, [targetCaseId]: updatedList } });
  },

  deleteObservation: async (id, caseId) => {
    try {
      await db.observations.delete(id);
    } catch {
      set({ storageError: "Could not delete the observation from local storage." });
    }
    set((state) => ({
      observations: {
        ...state.observations,
        [caseId]: (state.observations[caseId] || []).filter((o) => o.id !== id),
      },
    }));
  },
}));
