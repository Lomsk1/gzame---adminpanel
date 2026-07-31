import { useState, useCallback, useEffect } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import { Download, ChevronLeft, ChevronRight, MousePointerClick } from "lucide-react";
import type { BookingClickRecord, BookingClicksResponse } from "../../types/specialist/booking-clicks";
import type { Specialist } from "../../types/specialist/specialist";
import axiosAuth from "../../helper/axios";
import { format, subMonths, subYears, subDays, startOfDay } from "date-fns";
import { AdminButton, AdminCard, AdminPageHeader, AdminPageShell } from "../../components/admin";
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
            <AdminButton
              type="button"
              onClick={handleDownloadCurrent}
              disabled={data.length === 0}
              variant="secondary"
              size="md"
            >
              <Download className="w-4 h-4" />
              {t("bookingClicks.downloadPage")}
            </AdminButton>
            <AdminButton
              type="button"
              onClick={handleDownloadAllFiltered}
              disabled={downloadingAll}
              size="md"
            >
              <Download className="w-4 h-4" />
              {downloadingAll ? t("earlyAccess.preparing") : t("bookingClicks.downloadAll")}
            </AdminButton>
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
        <AdminCard padding="sm" className="flex items-center justify-between admin-fade-up">
          <AdminButton
            type="button"
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
            variant="secondary"
            size="sm"
          >
            <ChevronLeft className="w-4 h-4" /> {t("common.previous")}
          </AdminButton>
          <span className="text-sm text-admin-text-dim">{t("common.page", { current: page, total: totalPages })}</span>
          <AdminButton
            type="button"
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
            variant="secondary"
            size="sm"
          >
            {t("common.next")} <ChevronRight className="w-4 h-4" />
          </AdminButton>
        </AdminCard>
      )}
    </AdminPageShell>
  );
}
