# OilWatch Intelligence Console

A satellite oil-spill investigation console: an analyst registers an incident, runs a detection-to-attribution pipeline, and reviews which vessels are most likely responsible — all offline-first in the browser.

> **Status: client-only MVP.** There is no backend. Detection, drift modelling, and AIS correlation are deterministic, seeded simulations that stand in for a real SAR/EO inference API and ocean-drift model, behind stable service contracts so they can be swapped for the real thing later without touching the UI.

## How it works

1. **Case intake** — an analyst opens the Case Manager and fills in the incident: name, date/time, location, satellite source (SAR / EO / SAR + EO), imagery type, and notes. This creates an `InvestigationCase` in the `CASE_READY` state.
2. **Run analysis** — clicking *Run Analysis* steps through `SCANNING → DETECTING → CHARACTERIZING → HINDCASTING → FORECASTING → CORRELATING_AIS → RANKING`, with live status text on the process bar. Speed (Fast / Normal / Slow) controls the per-step delay.
3. **Detection & drift** — `detectOilSlick()` produces a slick polygon (confidence, area, age), and `runHindcast()` / `runForecast()` reconstruct a probable origin zone and project forward drift. Results are seeded on the case ID, so the same case always reproduces the same output.
4. **AIS correlation & ranking** — `correlateAIS()` scores candidate vessels against the reconstructed origin using a weighted model (spatial 40% / temporal 30% / trajectory 20% / continuity 10%), filters anything below a 35-point threshold, and ranks the rest with human-readable evidence.
5. **Review & export** — the analyst inspects ranked candidates and evidence, marks the case *Reviewed*, and can export the full case (satellite, slick, hindcast, forecast, AIS, candidates, observations, review) as a downloadable JSON file.

Everything persists locally via IndexedDB (Dexie), so a case survives a page reload without any server.

## Tech stack

| Layer | Choice |
|---|---|
| UI | React 19 + TypeScript, Vite (Rolldown) |
| State | Zustand — `caseStore`, `settingsStore`, `processingStore` |
| Persistence | Dexie / IndexedDB (`oilwatch-db`: `cases`, `observations`, `settings`) |
| Map | MapLibre GL JS |
| Charts | Recharts |
| Lint | Oxlint |

## Setup

Requires [Node.js](https://nodejs.org/) 18+ and npm.

```bash
npm install
npm run dev
```

The dev server prints a local URL (default `http://localhost:5173`) — open it in a browser. No environment variables or external services are required; the app is fully self-contained.

### Other scripts

```bash
npm run build    # type-check (tsc -b) then production build via Vite
npm run preview  # serve the production build locally
npm run lint     # run Oxlint
```

## Project structure

```
src/
  components/       UI, grouped by feature (map, cases, candidates, evidence, analysis, admin, accessibility)
  stores/           Zustand stores: case data, app settings, simulated processing state
  services/         Detection / hindcast / forecast / AIS correlation / attribution / export / storage
  data/             Fixture data, demo case factory, processing-step definitions
  types/            Shared domain types (InvestigationCase, OilSlick, CandidateVessel, ...)
  utils/            Seeded random + geometry helpers used by the simulated services
```

## Roles & accessibility

The console supports three roles — **Analyst**, **Supervisor**, **Viewer** — that gate whether a user can run analysis or mark a case reviewed. An accessibility panel exposes high-contrast mode, reduced motion, and text scale, all persisted per-user in settings.

## Roadmap

The service layer (`services/slickDetectionService.ts`, `services/driftService.ts`, `services/aisService.ts`) is intentionally isolated behind fixed contracts so each simulated call can be replaced with a real integration — Sentinel-1/2 SAR ingestion, an ocean-drift model (e.g. OpenDrift), and a live AIS feed — without changing the UI or store layer above it.
