import type { InvestigationCase, Role } from "../../types";
import { StatusBadge } from "../common/StatusBadge";

interface TopBarProps {
  activeCase: InvestigationCase | null;
  view: "console" | "admin";
  onChangeView: (view: "console" | "admin") => void;
  onOpenCaseManager: () => void;
  onOpenAccessibility: () => void;
  onExport: () => void;
  onOpenDemo: () => void;
  role: Role;
  onChangeRole: (role: Role) => void;
  storageOk: boolean;
}

const ROLES: Role[] = ["Analyst", "Supervisor", "Viewer"];

export function TopBar({
  activeCase,
  view,
  onChangeView,
  onOpenCaseManager,
  onOpenAccessibility,
  onExport,
  onOpenDemo,
  role,
  onChangeRole,
  storageOk,
}: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <span className="brand-mark" aria-hidden="true">◈</span>
        <span className="brand-name">OilWatch Intelligence Console</span>
        <nav className="top-bar-nav" aria-label="Primary views">
          <button
            type="button"
            className={`nav-tab ${view === "console" ? "active" : ""}`}
            onClick={() => onChangeView("console")}
            aria-current={view === "console" ? "page" : undefined}
          >
            Console
          </button>
          <button
            type="button"
            className={`nav-tab ${view === "admin" ? "active" : ""}`}
            onClick={() => onChangeView("admin")}
            aria-current={view === "admin" ? "page" : undefined}
          >
            Analytics
          </button>
        </nav>
      </div>

      <div className="top-bar-center">
        {activeCase ? (
          <button type="button" className="case-id-pill" onClick={onOpenCaseManager} aria-label="Open case manager">
            <span className="case-id">{activeCase.id}</span>
            <StatusBadge status={activeCase.status} />
          </button>
        ) : (
          <button type="button" className="case-id-pill" onClick={onOpenCaseManager}>
            No case selected
          </button>
        )}
      </div>

      <div className="top-bar-right">
        <span className={`system-status ${storageOk ? "ok" : "warn"}`} title={storageOk ? "Local storage connected" : "Local storage unavailable"}>
          <span aria-hidden="true">{storageOk ? "●" : "▲"}</span>
          <span className="system-status-label">{storageOk ? "System Nominal" : "Storage Degraded"}</span>
        </span>

        <button type="button" className="btn-ghost" onClick={onOpenDemo}>
          Demo Mode
        </button>

        <button type="button" className="icon-btn" onClick={onOpenAccessibility} aria-label="Accessibility settings">
          ♿
        </button>

        <button type="button" className="btn-primary" onClick={onExport} disabled={!activeCase}>
          Export Case
        </button>

        <label className="role-select">
          <span className="sr-only">Current role</span>
          <select value={role} onChange={(e) => onChangeRole(e.target.value as Role)} aria-label="Switch role">
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}
