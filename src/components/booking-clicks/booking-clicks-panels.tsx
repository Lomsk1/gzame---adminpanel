import { MousePointerClick, CalendarRange, Users, BarChart3 } from "lucide-react";
import { StatCard } from "../stats/stat-card";
import { AdminSection } from "../admin";
import { AdminDateField } from "../ui/admin-date-field";
import { useAdminT } from "../../store/locale/locale";

type BookingClicksStatsProps = {
  total: number;
  pageCount: number;
  page: number;
  totalPages: number;
  specialistCount: number;
};

export function BookingClicksStats({
  total,
  pageCount,
  page,
  totalPages,
  specialistCount,
}: BookingClicksStatsProps) {
  const { t } = useAdminT();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 admin-stagger">
      <StatCard
        title={t("bookingClicks.stats.total")}
        value={total.toLocaleString()}
        color="bg-admin-primary"
      />
      <StatCard
        title={t("bookingClicks.stats.filtered")}
        value={String(pageCount)}
        trend={t("bookingClicks.stats.thisPage")}
        color="bg-admin-accent"
      />
      <StatCard
        title={t("bookingClicks.stats.page")}
        value={`${page} / ${totalPages}`}
        color="bg-admin-success"
      />
      <StatCard
        title={t("bookingClicks.stats.specialists")}
        value={String(specialistCount)}
        color="bg-admin-warning"
      />
    </div>
  );
}

type PresetRange = { label: string; from: string; to: string };

type BookingClicksFiltersProps = {
  presetRanges: readonly PresetRange[];
  fromDate: string;
  toDate: string;
  specialistId: string;
  specialists: { _id: string; name: string }[];
  onPreset: (from: string, to: string) => void;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onSpecialistChange: (v: string) => void;
  onApply: () => void;
};

export function BookingClicksFilters({
  presetRanges,
  fromDate,
  toDate,
  specialistId,
  specialists,
  onPreset,
  onFromChange,
  onToChange,
  onSpecialistChange,
  onApply,
}: BookingClicksFiltersProps) {
  const { t } = useAdminT();

  return (
    <AdminSection
      title={t("bookingClicks.filtersTitle")}
      description={t("bookingClicks.quickRange")}
      tone="violet"
      headerRight={<CalendarRange className="w-4 h-4 text-admin-primary/70" />}
    >
      <div className="flex flex-wrap gap-2">
        {presetRanges.map((preset) => {
          const isActive = fromDate === preset.from && toDate === preset.to;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => onPreset(preset.from, preset.to)}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wide border transition-all duration-200 ${
                isActive
                  ? "bg-admin-primary/15 border-admin-primary text-admin-primary shadow-[0_0_12px_rgba(59,130,246,0.12)]"
                  : "bg-admin-bg/60 border-admin-border text-admin-text-dim hover:border-admin-primary/50 hover:text-admin-text"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <div className="pt-4 mt-4 border-t border-admin-border/50">
        <p className="text-xs font-semibold text-admin-text-dim uppercase tracking-wide mb-3">
          {t("bookingClicks.customRange")}
        </p>
        <div className="flex flex-wrap gap-4 items-end">
          <AdminDateField
            label={t("bookingClicks.fromDate")}
            value={fromDate}
            onChange={onFromChange}
            max={toDate || undefined}
          />
          <AdminDateField
            label={t("bookingClicks.toDate")}
            value={toDate}
            onChange={onToChange}
            min={fromDate || undefined}
          />
          <label className="flex flex-col gap-1.5 min-w-44">
            <span className="text-[10px] text-admin-text-dim uppercase tracking-wider">{t("bookingClicks.specialist")}</span>
            <select
              value={specialistId}
              onChange={(e) => onSpecialistChange(e.target.value)}
              className="bg-admin-bg border border-admin-border rounded-xl px-3 py-2.5 text-sm text-admin-text focus:border-admin-primary outline-none"
            >
              <option value="">{t("bookingClicks.allSpecialists")}</option>
              {specialists.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={onApply}
            className="rounded-xl bg-admin-primary px-5 py-2.5 text-xs font-black uppercase tracking-wider text-admin-bg hover:brightness-110 transition-all"
          >
            {t("common.apply")}
          </button>
        </div>
      </div>
    </AdminSection>
  );
}

export type BookingClickRow = {
  _id: string;
  clicked_at?: string;
  user?: { nickname?: string; email?: string } | null;
  specialist?: { name?: string } | null;
};

type BookingClicksTableProps = {
  rows: BookingClickRow[];
};

export function BookingClicksTable({ rows }: BookingClicksTableProps) {
  const { t } = useAdminT();

  return (
    <AdminSection
      title={t("bookingClicks.resultsTitle")}
      description={t("bookingClicks.resultsDesc")}
      tone="emerald"
      headerRight={
        <div className="flex items-center gap-2 text-admin-text-dim">
          <BarChart3 className="w-4 h-4" />
          <MousePointerClick className="w-4 h-4 text-admin-primary" />
        </div>
      }
    >
      <div className="overflow-x-auto rounded-xl border border-admin-border/60">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-admin-border bg-admin-panel/60">
              <th className="px-4 py-3 text-[10px] font-bold text-admin-text-dim uppercase tracking-wider">
                {t("bookingClicks.table.dateTime")}
              </th>
              <th className="px-4 py-3 text-[10px] font-bold text-admin-text-dim uppercase tracking-wider">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {t("bookingClicks.table.user")}
                </span>
              </th>
              <th className="px-4 py-3 text-[10px] font-bold text-admin-text-dim uppercase tracking-wider">
                {t("bookingClicks.table.userEmail")}
              </th>
              <th className="px-4 py-3 text-[10px] font-bold text-admin-text-dim uppercase tracking-wider">
                {t("bookingClicks.specialist")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-16 text-center text-admin-text-dim text-sm">
                  {t("bookingClicks.empty")}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={row._id}
                  className="border-b border-admin-border/40 hover:bg-admin-primary/5 transition-colors admin-fade-up"
                  style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                >
                  <td className="px-4 py-3 font-mono text-admin-text text-xs whitespace-nowrap">
                    {row.clicked_at
                      ? new Date(row.clicked_at).toLocaleString(undefined, {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-admin-text">
                      {row.user?.nickname || t("bookingClicks.rowAnonymous")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-admin-text-dim text-xs">{row.user?.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-lg border border-admin-primary/25 bg-admin-primary/10 px-2 py-0.5 text-xs font-semibold text-admin-primary">
                      {row.specialist?.name ?? "—"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminSection>
  );
}
