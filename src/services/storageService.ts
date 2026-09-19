// Local persistence via Dexie (IndexedDB). Falls back gracefully is not
// required in modern browsers, but errors are surfaced rather than silently
// swallowed so the UI can show a real "Storage unavailable" error state.

import Dexie, { type Table } from "dexie";
import type { AppSettings, InvestigationCase, Observation } from "../types";

class OilWatchDB extends Dexie {
  cases!: Table<InvestigationCase, string>;
  observations!: Table<Observation, string>;
  settings!: Table<AppSettings & { id: string }, string>;

  constructor() {
    super("oilwatch-db");
    this.version(1).stores({
      cases: "id, status, updatedAt",
      observations: "id, caseId, createdAt",
      settings: "id",
    });
  }
}

export const db = new OilWatchDB();

export const SETTINGS_ID = "app-settings";

export async function isStorageAvailable(): Promise<boolean> {
  try {
    await db.open();
    return true;
  } catch {
    return false;
  }
}
