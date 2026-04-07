import { useCallback, useEffect, useMemo, useState } from "react";
import { useLoaderData, useSearchParams, useRevalidator } from "react-router";
import axios from "axios";
import { format } from "date-fns";
import { Download, ChevronLeft, ChevronRight, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ButtonComponent } from "../../components/form/button";
import { ConfirmDialog } from "../../components/ui/confirm-dialog";
import { StatCard } from "../../components/stats/stat-card";
import axiosAuth from "../../helper/axios";
import type { EarlyAccessListResponse, EarlyAccessRecord, EarlyAccessStatus } from "../../types/early-access/early-access";

function buildCsv(rows: EarlyAccessRecord[]): string {
  const header = "Signed up (UTC),Full name,Email,Status,Admin notes,ID\n";
  const escape = (v: string) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const body = rows
    .map((r) => {
      const d = r.created_at ? new Date(r.created_at) : null;
      const dt = d ? format(d, "yyyy-MM-dd HH:mm:ss") : "";
      return [dt, escape(r.fullName), escape(r.email), r.status, escape(r.adminNotes ?? ""), r._id].join(",");
    })
    .join("\n");
  return "\uFEFF" + header + body;
}

function downloadBlob(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const STATUS_CHIPS: { value: EarlyAccessStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "contacted", label: "Contacted" },
  { value: "invited", label: "Invited" },
];

const panelClass =
  "rounded-2xl border border-admin-border/50 bg-admin-panel/60 backdrop-blur-md shadow-[0_4px_24px_-8px_rgba(0,0,0,0.4)]";

export default function EarlyAccessPage() {
  const { earlyAccessData } = useLoaderData() as { earlyAccessData: EarlyAccessListResponse };
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();

  const [searchInput, setSearchInput] = useState(() => searchParams.get("search") ?? "");
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get("status") ?? "");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setSearchInput(searchParams.get("search") ?? "");
    setStatusFilter(searchParams.get("status") ?? "");
  }, [searchParams]);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const data = useMemo(() => earlyAccessData?.data ?? [], [earlyAccessData]);
  const total = earlyAccessData?.total ?? 0;
  const page = earlyAccessData?.page ?? 1;
  const limit = earlyAccessData?.limit ?? 50;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    const s = searchInput.trim();
    if (s) params.set("search", s);
    else params.delete("search");
    if (statusFilter) params.set("status", statusFilter);
    else params.delete("status");
    setSearchParams(params);
  }, [searchInput, statusFilter, searchParams, setSearchParams]);

  const setStatusFromChip = useCallback(
    (value: EarlyAccessStatus | "") => {
      setStatusFilter(value);
      const params = new URLSearchParams(searchParams);
      params.set("page", "1");
      const s = searchInput.trim();
      if (s) params.set("search", s);
      else params.delete("search");
      if (value) params.set("status", value);
      else params.delete("status");
      setSearchParams(params);
    },
    [searchInput, searchParams, setSearchParams],
  );

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setStatusFilter("");
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    params.delete("search");
    params.delete("status");
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const hasActiveFilters =
    Boolean(searchParams.get("search")?.trim()) || Boolean(searchParams.get("status"));

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  const handleDownloadCurrent = useCallback(() => {
    const csv = buildCsv(data);
    downloadBlob(csv, `early-access-page-${page}-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`);
  }, [data, page]);

  const [downloadingAll, setDownloadingAll] = useState(false);
  const handleDownloadAllFiltered = useCallback(async () => {
    setDownloadingAll(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "10000");
      params.set("page", "1");
      const s = searchParams.get("search")?.trim();
      const st = searchParams.get("status");
      if (s) params.set("search", s);
      if (st) params.set("status", st);
      const res = await axiosAuth.get<EarlyAccessListResponse>(`/api/v1/early-access?${params.toString()}`);
      const rows = res.data?.data ?? [];
      const csv = buildCsv(rows);
      downloadBlob(csv, `early-access-export-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`);
    } catch {
      toast.error("Export failed");
    } finally {
      setDownloadingAll(false);
    }
  }, [searchParams]);

  const patchRow = async (id: string, body: { status?: EarlyAccessStatus; adminNotes?: string }) => {
    setUpdatingId(id);
    try {
      await axiosAuth.patch(`/api/v1/early-access/${id}`, body);
      toast.success("Saved");
      await revalidator.revalidate();
    } catch (e: unknown) {
      const msg =
        axios.isAxiosError(e) && e.response?.data?.message
          ? String((e.response.data as { message?: string }).message)
          : "Update failed";
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await axiosAuth.delete(`/api/v1/early-access/${deleteId}`);
      toast.success("Removed");
      setDeleteId(null);
      await revalidator.revalidate();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-admin-border/60 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-admin-text">Early access</h1>
          <p className="mt-1 max-w-lg text-sm leading-relaxed text-admin-text-dim">
            Landing waitlist signups — filter, update status, notes, or export.
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-2">
          <ButtonComponent
            variant="oracle"
            size="sm"
            onClick={handleDownloadCurrent}
            disabled={data.length === 0}
            className="flex items-center gap-2 px-4 py-2"
          >
            <Download className="h-4 w-4" />
            Download page
          </ButtonComponent>
          <ButtonComponent
            variant="oracle"
            size="sm"
            onClick={handleDownloadAllFiltered}
            disabled={downloadingAll}
            className="flex items-center gap-2 px-4 py-2"
          >
            <Download className="h-4 w-4" />
            {downloadingAll ? "Preparing…" : "Download all"}
          </ButtonComponent>
        </div>
      </header>

      {/* Toolbar: status + search — single calm panel (no GlassCard double-padding) */}
      <div className={`${panelClass} p-5`}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch lg:gap-6">
          <div className="lg:w-auto lg:shrink-0">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-admin-text-dim">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_CHIPS.map((chip) => {
                const active =
                  chip.value === ""
                    ? !searchParams.get("status")
                    : searchParams.get("status") === chip.value;
                return (
                  <button
                    key={chip.value || "all"}
                    type="button"
                    onClick={() => setStatusFromChip(chip.value)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-all ${
                      active
                        ? "bg-admin-primary text-white shadow-[0_0_12px_rgba(59,130,246,0.35)]"
                        : "border border-admin-border/80 bg-admin-bg/50 text-admin-text-dim hover:border-admin-primary/40 hover:text-admin-text"
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hidden w-px shrink-0 bg-admin-border/50 lg:block" aria-hidden />

          <div className="min-w-0 flex-1">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-admin-text-dim">Search</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-text-dim"
                  aria-hidden
                />
                <input
                  id="ea-search"
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                  placeholder="Name or email…"
                  autoComplete="off"
                  className="w-full rounded-xl border border-admin-border bg-admin-bg/80 py-2.5 pl-10 pr-3 text-sm text-admin-text placeholder:text-admin-text-dim/60 focus:border-admin-primary focus:outline-none focus:ring-1 focus:ring-admin-primary/30"
                />
              </div>
              <div className="flex shrink-0 gap-2">
                <ButtonComponent variant="oracle" size="sm" onClick={applyFilters} className="px-5 py-2.5">
                  Apply
                </ButtonComponent>
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-admin-border px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-admin-text-dim transition hover:border-admin-error/50 hover:text-admin-error"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total matching" value={total.toLocaleString()} color="bg-admin-primary" />
        <StatCard title="Rows this page" value={String(data.length)} color="bg-admin-accent" />
        <StatCard title="Page" value={`${page} / ${totalPages}`} color="bg-admin-success" />
      </div>

      {/* Table: full-bleed inside panel */}
      <div className={`${panelClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-admin-bg/40">
                <th className="whitespace-nowrap px-4 py-3 text-[10px] font-black uppercase tracking-wider text-admin-text-dim">
                  Signed up (UTC)
                </th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-admin-text-dim">Name</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-admin-text-dim">Email</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-admin-text-dim">Status</th>
                <th className="min-w-[180px] px-4 py-3 text-[10px] font-black uppercase tracking-wider text-admin-text-dim">
                  Notes
                </th>
                <th className="w-16 px-4 py-3 text-[10px] font-black uppercase tracking-wider text-admin-text-dim" />
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-sm text-admin-text-dim">
                    No signups match the current filters.
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <EarlyAccessRow
                    key={row._id}
                    row={row}
                    busy={updatingId === row._id}
                    onPatch={patchRow}
                    onDelete={() => setDeleteId(row._id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-4 border-t border-admin-border/50 pt-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
            className="flex items-center gap-2 rounded-xl border border-admin-border bg-admin-panel px-4 py-2 text-xs font-bold uppercase tracking-wide text-admin-text transition hover:border-admin-primary disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="text-xs font-mono text-admin-text-dim">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
            className="flex items-center gap-2 rounded-xl border border-admin-border bg-admin-panel px-4 py-2 text-xs font-bold uppercase tracking-wide text-admin-text transition hover:border-admin-primary disabled:pointer-events-none disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete signup?"
        message="This removes the row from the early access list. The user can sign up again from the landing page."
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
      {deleting ? <span className="sr-only" aria-live="polite">Deleting…</span> : null}
    </div>
  );
}

function EarlyAccessRow({
  row,
  busy,
  onPatch,
  onDelete,
}: {
  row: EarlyAccessRecord;
  busy: boolean;
  onPatch: (id: string, body: { status?: EarlyAccessStatus; adminNotes?: string }) => Promise<void>;
  onDelete: () => void;
}) {
  return (
    <tr className="border-b border-admin-border/40 transition-colors hover:bg-admin-primary/[0.04]">
      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-admin-text">
        {row.created_at ? format(new Date(row.created_at), "yyyy-MM-dd HH:mm") : "—"}
      </td>
      <td className="max-w-[140px] px-4 py-3 text-sm font-medium text-admin-text wrap-break-word">{row.fullName}</td>
      <td className="max-w-[220px] break-all px-4 py-3 text-xs text-admin-text-dim">{row.email}</td>
      <td className="px-4 py-3">
        <select
          value={row.status}
          disabled={busy}
          onChange={(e) => {
            const status = e.target.value as EarlyAccessStatus;
            void onPatch(row._id, { status });
          }}
          className="max-w-full rounded-lg border border-admin-border bg-admin-bg px-2 py-1.5 text-xs font-bold uppercase text-admin-text focus:border-admin-primary focus:outline-none disabled:opacity-50"
        >
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="invited">Invited</option>
        </select>
      </td>
      <td className="px-4 py-3">
        <input
          key={`${row._id}-notes-${row.updated_at}`}
          type="text"
          defaultValue={row.adminNotes ?? ""}
          disabled={busy}
          onBlur={(e) => {
            const trimmed = e.target.value.trim();
            if (trimmed === (row.adminNotes ?? "").trim()) return;
            void onPatch(row._id, { adminNotes: trimmed });
          }}
          placeholder="Notes…"
          className="w-full min-w-[160px] max-w-[280px] rounded-lg border border-admin-border bg-admin-bg px-2 py-1.5 text-xs text-admin-text focus:border-admin-primary focus:outline-none disabled:opacity-50"
        />
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="rounded-lg border border-admin-border p-2 text-admin-error transition hover:bg-admin-error/10 disabled:opacity-40"
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
