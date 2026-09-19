import type { CaseStatus } from "../../types";

const STATUS_META: Record<CaseStatus, { color: string; icon: string }> = {
  Ready: { color: "#94A3B8", icon: "○" },
  Processing: { color: "#0D9488", icon: "◐" },
  Complete: { color: "#16A34A", icon: "✓" },
  "Needs Review": { color: "#D97706", icon: "!" },
  Reviewed: { color: "#16A34A", icon: "✓" },
  Error: { color: "#DC2626", icon: "✕" },
};

export function StatusBadge({ status }: { status: CaseStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className="status-badge" style={{ color: meta.color, borderColor: meta.color }}>
      <span aria-hidden="true">{meta.icon}</span>
      {status}
    </span>
  );
}
