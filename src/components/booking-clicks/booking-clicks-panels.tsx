import { MousePointerClick, CalendarRange, Users, BarChart3 } from "lucide-react";
import { StatCard } from "../stats/stat-card";
import { AdminBadge, AdminButton, AdminSection, AdminTable, AdminTableBody, AdminTableHead, AdminTd, AdminTh, AdminTr } from "../admin";
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
      tone="info"
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
              className={`rounded-lg border px-3 py-2 text-[11px] font-semibold transition-colors ${
                isActive
                  ? "bg-admin-primary/15 border-admin-primary text-admin-primary shadow-[0_0_16px_rgba(var(--admin-primary-rgb),0.15)]"
                  : "bg-admin-bg/60 border-admin-border text-admin-text-dim hover:border-admin-primary/50 hover:text-admin-text"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <div className="pt-4 mt-4 border-t border-admin-border/50">
        <p className="mb-3 text-[11px] font-semibold text-admin-text-dim">
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
            <span className="text-[11px] font-semibold text-admin-text-dim">{t("bookingClicks.specialist")}</span>
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
          <AdminButton
            type="button"
            onClick={onApply}
            size="md"
          >
            {t("common.apply")}
          </AdminButton>
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
      <AdminTable>
        <AdminTableHead>
          <tr>
            <AdminTh>
              {t("bookingClicks.table.dateTime")}
            </AdminTh>
            <AdminTh>
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {t("bookingClicks.table.user")}
              </span>
            </AdminTh>
            <AdminTh>
              {t("bookingClicks.table.userEmail")}
            </AdminTh>
            <AdminTh>
              {t("bookingClicks.specialist")}
            </AdminTh>
          </tr>
        </AdminTableHead>
        <AdminTableBody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-16 text-center text-admin-text-dim text-sm">
                {t("bookingClicks.empty")}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <AdminTr
                key={row._id}
                className="admin-fade-up"
                style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
              >
                <AdminTd className="whitespace-nowrap font-mono text-xs">
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
                </AdminTd>
                <AdminTd>
                  <span className="font-semibold text-admin-text">
                    {row.user?.nickname || t("bookingClicks.rowAnonymous")}
                  </span>
                </AdminTd>
                <AdminTd className="text-xs text-admin-text-dim">{row.user?.email ?? "—"}</AdminTd>
                <AdminTd>
                  <AdminBadge tone="primary">
                    {row.specialist?.name ?? "—"}
                  </AdminBadge>
                </AdminTd>
              </AdminTr>
            ))
          )}
        </AdminTableBody>
      </AdminTable>
    </AdminSection>
  );
}
