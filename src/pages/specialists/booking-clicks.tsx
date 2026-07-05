import { useState, useCallback, useEffect } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import { Download, ChevronLeft, ChevronRight, MousePointerClick } from "lucide-react";
import type { BookingClickRecord, BookingClicksResponse } from "../../types/specialist/booking-clicks";
import type { Specialist } from "../../types/specialist/specialist";
import axiosAuth from "../../helper/axios";
import { format, subMonths, subYears, subDays, startOfDay } from "date-fns";
import { AdminPageHeader, AdminPageShell } from "../../components/admin";
import {
  BookingClicksFilters,
  BookingClicksStats,
  BookingClicksTable,
} from "../../components/booking-clicks/booking-clicks-panels";
import { useAdminT } from "../../store/locale/locale";

import type { AdminMessages } from "../../i18n/translations";

function buildCsv(rows: BookingClickRecord[], t: (key: keyof AdminMessages) => string): string {
  const header = `${t("bookingClicks.table.dateTime")},${t("bookingClicks.table.userNickname")},${t("bookingClicks.table.userEmail")},${t("bookingClicks.specialist")},ID\n`;
  const escape = (v: string) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const body = rows
    .map((r) => {
      const d = r.clicked_at ? new Date(r.clicked_at) : null;
      const dateTime = d ? format(d, "yyyy-MM-dd HH:mm:ss") : "";
      return [
        dateTime,
        escape(r.user?.nickname ?? ""),
        escape(r.user?.email ?? ""),
        escape(r.specialist?.name ?? ""),
        r._id,
      ].join(",");
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

export default function BookingClicksPage() {
  const { t } = useAdminT();
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
    { label: t("bookingClicks.range7d"), from: format(subDays(new Date(), 7), "yyyy-MM-dd"), to: today },
    { label: t("bookingClicks.range1m"), from: format(subMonths(new Date(), 1), "yyyy-MM-dd"), to: today },
    { label: t("bookingClicks.range3m"), from: format(subMonths(new Date(), 3), "yyyy-MM-dd"), to: today },
    { label: t("bookingClicks.range6m"), from: format(subMonths(new Date(), 6), "yyyy-MM-dd"), to: today },
    { label: t("bookingClicks.range1y"), from: format(subYears(new Date(), 1), "yyyy-MM-dd"), to: today },
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
    [searchParams, specialistId, setSearchParams],
  );

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  const handleDownloadCurrent = useCallback(() => {
    downloadBlob(buildCsv(data, t), `booking-clicks-page-${page}-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`);
  }, [data, page, t]);

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
        `/api/v1/specialists/booking-clicks?${params.toString()}`,
      );
      downloadBlob(
        buildCsv(res.data?.data ?? [], t),
        `booking-clicks-export-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`,
      );
    } finally {
      setDownloadingAll(false);
    }
  }, [fromDate, toDate, specialistId, t]);

  return (
    <AdminPageShell className="space-y-6">
      <AdminPageHeader
        title={t("pages.bookingClicks.title")}
        icon={<MousePointerClick className="w-5 h-5 text-admin-primary" />}
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownloadCurrent}
              disabled={data.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-admin-border bg-admin-panel px-4 py-2 text-xs font-bold uppercase tracking-wide text-admin-text hover:border-admin-primary/50 transition-all disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              {t("bookingClicks.downloadPage")}
            </button>
            <button
              type="button"
              onClick={handleDownloadAllFiltered}
              disabled={downloadingAll}
              className="inline-flex items-center gap-2 rounded-xl bg-admin-primary px-4 py-2 text-xs font-black uppercase tracking-wide text-admin-bg hover:brightness-110 transition-all disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              {downloadingAll ? t("earlyAccess.preparing") : t("bookingClicks.downloadAll")}
            </button>
          </div>
        }
      />

      <p className="text-sm text-admin-text-dim -mt-2 admin-fade-up">{t("bookingClicks.subtitle")}</p>

      <BookingClicksStats
        total={total}
        pageCount={data.length}
        page={page}
        totalPages={totalPages}
        specialistCount={specialistsData.length}
      />

      <BookingClicksFilters
        presetRanges={presetRanges}
        fromDate={fromDate}
        toDate={toDate}
        specialistId={specialistId}
        specialists={specialistsData}
        onPreset={setPresetRange}
        onFromChange={setFromDate}
        onToChange={setToDate}
        onSpecialistChange={setSpecialistId}
        onApply={applyFilters}
      />

      <BookingClicksTable rows={data} />

      {totalPages > 1 && (
        <div className="flex justify-between items-center rounded-xl border border-admin-border bg-admin-panel/40 p-4 admin-fade-up">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-admin-border text-xs font-bold uppercase hover:border-admin-primary transition-all disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> {t("common.previous")}
          </button>
          <span className="text-sm text-admin-text-dim">{t("common.page", { current: page, total: totalPages })}</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-admin-border text-xs font-bold uppercase hover:border-admin-primary transition-all disabled:opacity-40"
          >
            {t("common.next")} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </AdminPageShell>
  );
}
