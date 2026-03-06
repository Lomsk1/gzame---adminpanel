import { useState, useCallback, useEffect } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import { GlassCard } from "../../components/cards/card-glass";
import { ButtonComponent } from "../../components/form/button";
import { Download, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import type { BookingClickRecord, BookingClicksResponse } from "../../types/specialist/booking-clicks";
import type { Specialist } from "../../types/specialist/specialist";
import axiosAuth from "../../helper/axios";
import { format, subMonths, subYears, subDays, startOfDay } from "date-fns";

function buildCsv(rows: BookingClickRecord[]): string {
  const header = "Date (UTC),Time (UTC),User (nickname),User (email),Specialist,Click ID\n";
  const escape = (v: string) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const body = rows
    .map((r) => {
      const d = r.clicked_at ? new Date(r.clicked_at) : null;
      const dateStr = d ? format(d, "yyyy-MM-dd") : "";
      const timeStr = d ? format(d, "HH:mm:ss") : "";
      const nickname = r.user?.nickname ?? "";
      const email = r.user?.email ?? "";
      const specialistName = r.specialist?.name ?? "";
      return [dateStr, timeStr, escape(nickname), escape(email), escape(specialistName), r._id].join(",");
    })
    .join("\n");
  return "\uFEFF" + header + body; // BOM for Excel UTF-8
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

export default function BookingClicksPage() {
  const { bookingClicksData, specialistsData } = useLoaderData() as {
    bookingClicksData: BookingClicksResponse;
    specialistsData: Specialist[];
  };
  const [searchParams, setSearchParams] = useSearchParams();

  const [fromDate, setFromDate] = useState(searchParams.get("fromDate") ?? "");
  const [toDate, setToDate] = useState(searchParams.get("toDate") ?? "");
  const [specialistId, setSpecialistId] = useState(searchParams.get("specialistId") ?? "");

  useEffect(() => {
    setFromDate(searchParams.get("fromDate") ?? "");
    setToDate(searchParams.get("toDate") ?? "");
    setSpecialistId(searchParams.get("specialistId") ?? "");
  }, [searchParams]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = bookingClicksData?.data ?? [];
  const total = bookingClicksData?.total ?? 0;
  const page = bookingClicksData?.page ?? 1;
  const limit = bookingClicksData?.limit ?? 50;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (fromDate) params.set("fromDate", fromDate);
    else params.delete("fromDate");
    if (toDate) params.set("toDate", toDate);
    else params.delete("toDate");
    if (specialistId) params.set("specialistId", specialistId);
    else params.delete("specialistId");
    setSearchParams(params);
  }, [fromDate, toDate, specialistId, searchParams, setSearchParams]);

  const today = format(startOfDay(new Date()), "yyyy-MM-dd");
  const presetRanges = [
    { label: "7 days", from: format(subDays(new Date(), 7), "yyyy-MM-dd"), to: today },
    { label: "1 month", from: format(subMonths(new Date(), 1), "yyyy-MM-dd"), to: today },
    { label: "3 months", from: format(subMonths(new Date(), 3), "yyyy-MM-dd"), to: today },
    { label: "6 months", from: format(subMonths(new Date(), 6), "yyyy-MM-dd"), to: today },
    { label: "1 year", from: format(subYears(new Date(), 1), "yyyy-MM-dd"), to: today },
  ] as const;

  const setPresetRange = useCallback(
    (from: string, to: string) => {
      setFromDate(from);
      setToDate(to);
      const params = new URLSearchParams(searchParams);
      params.set("page", "1");
      params.set("fromDate", from);
      params.set("toDate", to);
      if (specialistId) params.set("specialistId", specialistId);
      else params.delete("specialistId");
      setSearchParams(params);
    },
    [searchParams, specialistId, setSearchParams]
  );

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  const handleDownloadCurrent = useCallback(() => {
    const csv = buildCsv(data);
    const name = `booking-clicks-page-${page}-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;
    downloadBlob(csv, name);
  }, [data, page]);

  const [downloadingAll, setDownloadingAll] = useState(false);
  const handleDownloadAllFiltered = useCallback(async () => {
    setDownloadingAll(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "10000");
      if (fromDate) params.set("fromDate", fromDate);
      if (toDate) params.set("toDate", toDate);
      if (specialistId) params.set("specialistId", specialistId);
      const res = await axiosAuth.get<BookingClicksResponse>(
        `/api/v1/specialists/booking-clicks?${params.toString()}`
      );
      const rows = res.data?.data ?? [];
      const csv = buildCsv(rows);
      const name = `booking-clicks-export-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;
      downloadBlob(csv, name);
    } finally {
      setDownloadingAll(false);
    }
  }, [fromDate, toDate, specialistId]);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 bg-admin-bg min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-admin-border pb-8">
        <div>
          <h1 className="text-2xl font-black text-admin-text uppercase italic tracking-tighter">
            Booking Clicks
          </h1>
          <p className="text-sm text-admin-text-dim mt-1">
            When users tapped &quot;Book consultation&quot; and were redirected. Filter by date range and specialist, then download as CSV.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonComponent
            variant="oracle"
            size="sm"
            onClick={handleDownloadCurrent}
            disabled={data.length === 0}
            className="px-4 py-2 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download current page
          </ButtonComponent>
          <ButtonComponent
            variant="oracle"
            size="sm"
            onClick={handleDownloadAllFiltered}
            disabled={downloadingAll}
            className="px-4 py-2 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {downloadingAll ? "Preparing…" : "Download all (filtered)"}
          </ButtonComponent>
        </div>
      </header>

      {/* Filters */}
      <GlassCard className="p-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-admin-text-dim">
            <Filter className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">Quick range</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {presetRanges.map((preset) => {
              const isActive =
                fromDate === preset.from && toDate === preset.to;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setPresetRange(preset.from, preset.to)}
                  className={`min-w-26 px-5 py-3 rounded-xl text-base font-bold uppercase tracking-wide border-2 transition-all ${isActive
                      ? "bg-admin-primary/15 border-admin-primary text-admin-primary shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                      : "bg-admin-bg/80 border-admin-border text-admin-text hover:border-admin-primary/60 hover:text-admin-text"
                    }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="pt-4 border-t border-admin-border/60">
          <div className="flex items-center gap-2 text-admin-text-dim mb-4">
            <span className="text-sm font-semibold uppercase tracking-wide">Custom range</span>
          </div>
          <div className="flex flex-wrap gap-5 items-end">
            <label className="flex flex-col gap-2">
              <span className="text-xs text-admin-text-dim uppercase tracking-wider">From date</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-admin-bg border-2 border-admin-border rounded-xl px-4 py-3 text-base text-admin-text focus:border-admin-primary outline-none min-w-40"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs text-admin-text-dim uppercase tracking-wider">To date</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-admin-bg border-2 border-admin-border rounded-xl px-4 py-3 text-base text-admin-text focus:border-admin-primary outline-none min-w-40"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs text-admin-text-dim uppercase tracking-wider">Specialist</span>
              <select
                value={specialistId}
                onChange={(e) => setSpecialistId(e.target.value)}
                className="bg-admin-bg border-2 border-admin-border rounded-xl px-4 py-3 text-base text-admin-text focus:border-admin-primary outline-none min-w-48"
              >
                <option value="">All specialists</option>
                {specialistsData.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <ButtonComponent variant="oracle" size="sm" onClick={applyFilters} className="px-5 py-3 text-base">
              Apply
            </ButtonComponent>
          </div>
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <p className="text-xs text-admin-text-dim uppercase">Total clicks</p>
          <p className="text-2xl font-black text-admin-primary">{total.toLocaleString()}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-admin-text-dim uppercase">This page</p>
          <p className="text-2xl font-black text-admin-text">{data.length}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-admin-text-dim uppercase">Page</p>
          <p className="text-2xl font-black text-admin-text">
            {page} / {totalPages}
          </p>
        </GlassCard>
      </div>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-admin-panel/50">
                <th className="px-4 py-3 font-bold text-admin-text-dim uppercase">Date & time (UTC)</th>
                <th className="px-4 py-3 font-bold text-admin-text-dim uppercase">User (nickname)</th>
                <th className="px-4 py-3 font-bold text-admin-text-dim uppercase">User (email)</th>
                <th className="px-4 py-3 font-bold text-admin-text-dim uppercase">Specialist</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-admin-text-dim">
                    No booking clicks match the current filters.
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row._id} className="border-b border-admin-border/50 hover:bg-admin-panel/30">
                    <td className="px-4 py-3 text-admin-text font-mono">
                      {row.clicked_at
                        ? format(new Date(row.clicked_at), "yyyy-MM-dd HH:mm:ss")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-admin-text">{row.user?.nickname ?? "—"}</td>
                    <td className="px-4 py-3 text-admin-text-dim">{row.user?.email ?? "—"}</td>
                    <td className="px-4 py-3 text-admin-primary font-medium">
                      {row.specialist?.name ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
            className="flex items-center gap-2 px-4 py-2 bg-admin-panel border border-admin-border rounded-lg text-sm font-bold uppercase hover:border-admin-primary transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm text-admin-text-dim">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
            className="flex items-center gap-2 px-4 py-2 bg-admin-panel border border-admin-border rounded-lg text-sm font-bold uppercase hover:border-admin-primary transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
