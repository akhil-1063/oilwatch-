import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import type { CaseStatus, InvestigationCase } from "../../types";

interface AdminViewProps {
  cases: InvestigationCase[];
}

const ALL_STATUSES: CaseStatus[] = [
  "Ready",
  "Processing",
  "Complete",
  "Needs Review",
  "Reviewed",
  "Error",
];

const CHART_GRID_STROKE = "#374151";
const CHART_AXIS_COLOR = "#94A3B8";
const CHART_PRIMARY_COLOR = "#0D9488";
const CHART_TOOLTIP_STYLE = {
  backgroundColor: "#1F2937",
  border: "1px solid #374151",
  color: "#FFFFFF",
};

interface DailyCount {
  date: string;
  count: number;
}

interface BucketCount {
  bucket: string;
  count: number;
}

function toDayKey(iso: string): string {
  return iso.slice(0, 10);
}

function buildHistogram(values: number[]): BucketCount[] {
  const bins = new Array(10).fill(0) as number[];
  for (const v of values) {
    const idx = Math.min(Math.max(Math.floor(v / 10), 0), 9);
    bins[idx] += 1;
  }
  return bins.map((count, idx) => ({
    bucket: `${idx * 10}–${idx * 10 + 10}`,
    count,
  }));
}

function buildDailySeries(cases: InvestigationCase[]): DailyCount[] {
  const counts = new Map<string, number>();
  for (const c of cases) {
    const key = toDayKey(c.createdAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, count]) => ({ date, count }));
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

export function AdminView({ cases }: AdminViewProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<CaseStatus[]>([]);
  const [regionFilter, setRegionFilter] = useState("");

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      const createdDay = toDayKey(c.createdAt);
      if (dateFrom && createdDay < dateFrom) return false;
      if (dateTo && createdDay > dateTo) return false;
      if (statusFilter.length > 0 && !statusFilter.includes(c.status)) return false;
      if (
        regionFilter.trim() !== "" &&
        !c.location.region.toLowerCase().includes(regionFilter.trim().toLowerCase())
      )
        return false;
      return true;
    });
  }, [cases, dateFrom, dateTo, statusFilter, regionFilter]);

  const totalCases = filtered.length;
  const casesAnalyzed = filtered.filter(
    (c) => c.status === "Complete" || c.status === "Reviewed"
  ).length;
  const casesReviewed = filtered.filter((c) => c.status === "Reviewed").length;

  const avgConfidence = useMemo(
    () => mean(filtered.filter((c) => c.slick !== null).map((c) => c.slick!.confidence)),
    [filtered]
  );

  const avgAttribution = useMemo(
    () =>
      mean(
        filtered
          .filter((c) => c.candidates.length > 0)
          .map((c) => c.candidates[0].attributionScore)
      ),
    [filtered]
  );

  const dailySeries = useMemo(() => buildDailySeries(filtered), [filtered]);

  const confidenceHistogram = useMemo(
    () =>
      buildHistogram(
        filtered.filter((c) => c.slick !== null).map((c) => c.slick!.confidence)
      ),
    [filtered]
  );

  const attributionHistogram = useMemo(
    () =>
      buildHistogram(
        filtered.filter((c) => c.candidates.length > 0).map((c) => c.candidates[0].attributionScore)
      ),
    [filtered]
  );

  function toggleStatus(status: CaseStatus) {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  }

  if (cases.length === 0) {
    return (
      <div className="admin-view">
        <p className="admin-empty-state">No investigations yet.</p>
      </div>
    );
  }

  return (
    <div className="admin-view">
      <div className="admin-filter-bar">
        <label className="admin-filter-field">
          From
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label="Filter from date"
          />
        </label>
        <label className="admin-filter-field">
          To
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label="Filter to date"
          />
        </label>
        <div className="admin-filter-field admin-status-chips" role="group" aria-label="Filter by status">
          {ALL_STATUSES.map((status) => {
            const active = statusFilter.includes(status);
            return (
              <button
                key={status}
                type="button"
                className={active ? "chip chip-active" : "chip"}
                aria-pressed={active}
                onClick={() => toggleStatus(status)}
              >
                {status}
              </button>
            );
          })}
        </div>
        <label className="admin-filter-field">
          Region
          <input
            type="text"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            placeholder="e.g. Gulf of Mexico"
            aria-label="Filter by region"
          />
        </label>
      </div>

      <div className="admin-stat-row">
        <div className="stat-tile">
          <span className="stat-tile-value">{totalCases}</span>
          <span className="stat-tile-label">Total Cases</span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile-value">{casesAnalyzed}</span>
          <span className="stat-tile-label">Cases Analyzed</span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile-value">{casesReviewed}</span>
          <span className="stat-tile-label">Cases Reviewed</span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile-value">{avgConfidence !== null ? avgConfidence : "—"}</span>
          <span className="stat-tile-label">Avg. Detection Confidence</span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile-value">{avgAttribution !== null ? avgAttribution : "—"}</span>
          <span className="stat-tile-label">Avg. Attribution Score</span>
        </div>
      </div>

      <div className="admin-chart-row">
        <div className="chart-card">
          <h3>Cases Over Time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailySeries}>
              <CartesianGrid stroke={CHART_GRID_STROKE} strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke={CHART_AXIS_COLOR} tick={{ fill: CHART_AXIS_COLOR, fontSize: 11 }} />
              <YAxis allowDecimals={false} stroke={CHART_AXIS_COLOR} tick={{ fill: CHART_AXIS_COLOR, fontSize: 11 }} />
              <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Legend />
              <Line type="monotone" dataKey="count" name="Cases Created" stroke={CHART_PRIMARY_COLOR} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Detection Confidence Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={confidenceHistogram}>
              <CartesianGrid stroke={CHART_GRID_STROKE} strokeDasharray="3 3" />
              <XAxis dataKey="bucket" stroke={CHART_AXIS_COLOR} tick={{ fill: CHART_AXIS_COLOR, fontSize: 11 }} />
              <YAxis allowDecimals={false} stroke={CHART_AXIS_COLOR} tick={{ fill: CHART_AXIS_COLOR, fontSize: 11 }} />
              <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="count" name="Cases" fill={CHART_PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Candidate Score Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attributionHistogram}>
              <CartesianGrid stroke={CHART_GRID_STROKE} strokeDasharray="3 3" />
              <XAxis dataKey="bucket" stroke={CHART_AXIS_COLOR} tick={{ fill: CHART_AXIS_COLOR, fontSize: 11 }} />
              <YAxis allowDecimals={false} stroke={CHART_AXIS_COLOR} tick={{ fill: CHART_AXIS_COLOR, fontSize: 11 }} />
              <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="count" name="Top Candidates" fill={CHART_PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <table className="admin-table">
        <caption className="sr-only">Historic investigation cases matching the current filters</caption>
        <thead>
          <tr>
            <th scope="col">Case</th>
            <th scope="col">Region</th>
            <th scope="col">Status</th>
            <th scope="col">Detection Confidence</th>
            <th scope="col">Top Candidate</th>
            <th scope="col">Attribution Score</th>
            <th scope="col">Updated</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.location.region}</td>
              <td>{c.status}</td>
              <td>{c.slick?.confidence ?? "—"}</td>
              <td>{c.candidates[0]?.vessel.name ?? "—"}</td>
              <td>{c.candidates[0]?.attributionScore ?? "—"}</td>
              <td>{new Date(c.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
