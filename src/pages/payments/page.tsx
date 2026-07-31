import { useLoaderData, useRevalidator, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import axiosAuth from "../../helper/axios";
import { GlassCard } from "../../components/cards/card-glass";
import { MetricCard } from "../../components/ui/psychotypeBadge";
import { DisputeResolvePanel } from "../../components/payments/dispute-resolve-panel";
import { BookingLedgerPanel } from "../../components/payments/booking-ledger-panel";
import type { paymentsPageLoader } from "../../features/payments/payments.loaders";
import { formatPrice } from "../../components/specialists/constants";
import { format } from "date-fns";
import { AdminPageHeader, AdminPageShell } from "../../components/admin";
import { useAdminT } from "../../store/locale/locale";

const PAYMENT_TABS = ["overview", "bookings", "subscriptions", "ambassadors", "accruals", "compliance"] as const;

function eur(cents: number) {
  return formatPrice(cents, "EUR");
}

export default function PaymentsPage() {
  const { t } = useAdminT();
  const { tab, overview, bookings, subscriptions, ambassadors, accruals } =
    useLoaderData() as Awaited<ReturnType<typeof paymentsPageLoader>>;
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const activeTab = searchParams.get("tab") || tab || "overview";

  const setTab = (next: string) => {
    const p = new URLSearchParams(searchParams);
    p.set("tab", next);
    p.delete("page");
    setSearchParams(p);
  };

  const vol = overview?.bookingVolume;

  return (
    <AdminPageShell className="space-y-6">
      <AdminPageHeader title={t("pages.payments.title")} />

      <div className="flex flex-wrap gap-2 admin-fade-up" style={{ animationDelay: "80ms" }}>
        {PAYMENT_TABS.map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setTab(tabKey)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold border transition-colors ${
              activeTab === tabKey
                ? "border-admin-primary bg-admin-primary/15 text-admin-primary"
                : "border-admin-border text-admin-text-dim hover:text-admin-text"
            }`}
          >
            {t(`payments.tab.${tabKey}`)}
          </button>
        ))}
      </div>

      {activeTab === "overview" && overview ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard label={t("payments.stats.subscribedUsers")} value={String(overview.subscribedUsers)} variant="primary" />
            <MetricCard label={t("payments.stats.paidBookings")} value={String(vol?.count ?? 0)} variant="accent" />
            <MetricCard label={t("payments.stats.grossVolume")} value={eur(vol?.totalChargeCents ?? 0)} variant="primary" />
            <MetricCard
              label={t("payments.stats.platformFees")}
              value={eur((vol?.platformFeeCents ?? 0) + (vol?.serviceFeeCents ?? 0))}
              variant="warning"
            />
            <MetricCard
              label={t("payments.stats.ambassadorAccruals")}
              value={String(
                Object.values(overview.ambassadorAccruals ?? {}).reduce(
                  (sum, row) => sum + row.count,
                  0,
                ),
              )}
              variant="accent"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GlassCard className="p-4">
              <h2 className="text-sm font-bold text-admin-text mb-3">{t("payments.bookingsByStatus")}</h2>
              <ul className="space-y-2 text-sm">
                {Object.entries(overview.bookingsByStatus ?? {}).map(([status, count]) => (
                  <li key={status} className="flex justify-between">
                    <span className="text-admin-text-dim">{status}</span>
                    <span className="font-mono text-admin-text">{count}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
            <GlassCard className="p-4">
              <h2 className="text-sm font-bold text-admin-text mb-3">{t("payments.stripeSubscriptions")}</h2>
              <ul className="space-y-2 text-sm">
                {Object.entries(overview.subscriptionsByStatus ?? {}).map(([status, count]) => (
                  <li key={status} className="flex justify-between">
                    <span className="text-admin-text-dim">{status || t("payments.unknown")}</span>
                    <span className="font-mono text-admin-text">{count}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </>
      ) : null}

      {activeTab === "bookings" ? (
        <GlassCard className="p-4 overflow-x-auto">
          <div className="flex flex-wrap gap-2 mb-4">
            {["", "disputed", "paid", "released", "refunded"].map((s) => (
              <button
                key={s || "all"}
                type="button"
                onClick={() => {
                  const p = new URLSearchParams(searchParams);
                  if (s) p.set("status", s);
                  else p.delete("status");
                  p.delete("page");
                  setSearchParams(p);
                }}
                className={`rounded-lg px-3 py-1 text-xs font-semibold border ${
                  (searchParams.get("status") || "") === s
                    ? "border-admin-primary text-admin-primary"
                    : "border-admin-border text-admin-text-dim"
                }`}
              >
                {s || t("payments.filter.all")}
              </button>
            ))}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-admin-text-dim border-b border-admin-border">
                <th className="py-2 pr-3">{t("payments.table.date")}</th>
                <th className="py-2 pr-3">{t("payments.table.service")}</th>
                <th className="py-2 pr-3">{t("payments.table.specialist")}</th>
                <th className="py-2 pr-3">{t("payments.table.client")}</th>
                <th className="py-2 pr-3">{t("payments.table.status")}</th>
                <th className="py-2 pr-3">{t("payments.table.total")}</th>
                <th className="py-2">{t("payments.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {(bookings?.data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-admin-text-dim">
                    {t("common.noResults")}
                  </td>
                </tr>
              ) : (bookings?.data ?? []).map((b) => (
                <tr key={b._id} className="border-b border-admin-border/40 align-top">
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {b.scheduled_at ? format(new Date(b.scheduled_at), "yyyy-MM-dd HH:mm") : "—"}
                  </td>
                  <td className="py-2 pr-3">{b.service_snapshot?.title}</td>
                  <td className="py-2 pr-3">
                    {b.specialist_id?.name ?? "—"}
                    <div className="text-xs text-admin-text-dim">{b.specialist_id?.kyc_status}</div>
                  </td>
                  <td className="py-2 pr-3">{b.user_id?.nickname ?? b.user_id?.email}</td>
                  <td className="py-2 pr-3 font-mono text-xs">
                    {b.status}
                    {b.status === "disputed" ? (
                      <span className="ml-1 text-amber-400" title={t("payments.disputedReview")}>
                        ⚠
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2 pr-3">{eur(b.total_charge_cents ?? b.service_snapshot?.price_cents ?? 0)}</td>
                  <td className="py-2 min-w-[200px]">
                    <BookingLedgerPanel bookingId={b._id} />
                    {b.status === "disputed" ? (
                      <DisputeResolvePanel
                        bookingId={b._id}
                        disputeReason={b.dispute_reason}
                        evidenceUrls={b.dispute_evidence_urls}
                        totalCents={b.total_charge_cents ?? b.service_snapshot?.price_cents}
                        onResolved={() => revalidator.revalidate()}
                      />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      ) : null}

      {activeTab === "subscriptions" ? (
        <GlassCard className="p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-admin-text-dim border-b border-admin-border">
                <th className="py-2 pr-3">{t("payments.table.user")}</th>
                <th className="py-2 pr-3">{t("payments.table.role")}</th>
                <th className="py-2 pr-3">{t("payments.table.status")}</th>
                <th className="py-2 pr-3">{t("payments.table.provider")}</th>
                <th className="py-2">{t("payments.table.expires")}</th>
              </tr>
            </thead>
            <tbody>
              {((subscriptions?.data ?? []) as Array<Record<string, string>>).length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-admin-text-dim">
                    {t("common.noResults")}
                  </td>
                </tr>
              ) : ((subscriptions?.data ?? []) as Array<Record<string, string>>).map((u) => (
                <tr key={String(u._id)} className="border-b border-admin-border/40">
                  <td className="py-2 pr-3">{u.nickname ?? u.email}</td>
                  <td className="py-2 pr-3">{u.role}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{u.subscriptionStatus}</td>
                  <td className="py-2 pr-3">{u.subscriptionProvider}</td>
                  <td className="py-2">
                    {u.subscriptionExpiresAt
                      ? format(new Date(u.subscriptionExpiresAt), "yyyy-MM-dd")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      ) : null}

      {activeTab === "ambassadors" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard className="p-4">
            <h2 className="font-bold text-admin-text mb-2">{t("payments.ambassadors.title", { count: ambassadors?.ambassadors?.length ?? 0 })}</h2>
            <p className="text-xs text-admin-text-dim mb-3">
              {t("payments.ambassadors.desc")}
            </p>
            <ul className="space-y-2 text-sm">
              {(ambassadors?.ambassadors ?? []).length === 0 ? (
                <li className="py-6 text-center text-sm text-admin-text-dim">{t("common.noResults")}</li>
              ) : (ambassadors?.ambassadors ?? []).map((a) => (
                <li key={String(a._id)} className="flex justify-between border-b border-admin-border/40 py-2 gap-3">
                  <span>{String(a.name)}</span>
                  <span className="text-admin-text-dim font-mono text-xs text-right">
                    {String(a.ambassador_referral_code ?? "—")}
                    {a.ambassador_country_code ? ` · ${String(a.ambassador_country_code)}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </GlassCard>
          <GlassCard className="p-4">
            <h2 className="font-bold text-admin-text mb-2">
              {t("payments.recruits.title", { count: ambassadors?.recruits?.length ?? 0 })}
            </h2>
            <ul className="space-y-2 text-sm">
              {(ambassadors?.recruits ?? []).length === 0 ? (
                <li className="py-6 text-center text-sm text-admin-text-dim">{t("common.noResults")}</li>
              ) : (ambassadors?.recruits ?? []).map((r) => {
                const ref = r.referred_by_specialist_id as { name?: string } | undefined;
                return (
                  <li key={String(r._id)} className="border-b border-admin-border/40 py-2">
                    <div className="font-medium">{String(r.name)}</div>
                    <div className="text-xs text-admin-text-dim">
                      {t("payments.recruits.referredBy", { name: ref?.name ?? "—", kyc: String(r.kyc_status ?? "none") })}
                    </div>
                  </li>
                );
              })}
            </ul>
          </GlassCard>
        </div>
      ) : null}

      {activeTab === "accruals" ? (
        <GlassCard className="p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-admin-text-dim border-b border-admin-border">
                <th className="py-2 pr-3">{t("payments.accruals.ambassador")}</th>
                <th className="py-2 pr-3">{t("payments.accruals.order")}</th>
                <th className="py-2 pr-3">{t("payments.accruals.state")}</th>
                <th className="py-2 pr-3">{t("payments.accruals.amount")}</th>
                <th className="py-2">{t("payments.accruals.transferableAfter")}</th>
              </tr>
            </thead>
            <tbody>
              {((accruals?.data ?? []) as Array<Record<string, unknown>>).length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-admin-text-dim">
                    {t("common.noResults")}
                  </td>
                </tr>
              ) : ((accruals?.data ?? []) as Array<Record<string, unknown>>).map((row) => {
                const ambassador = row.ambassador_id as { name?: string } | undefined;
                const order = row.order_id as { service_snapshot?: { title?: string } } | undefined;
                return (
                  <tr key={String(row._id)} className="border-b border-admin-border/40">
                    <td className="py-2 pr-3">{ambassador?.name ?? "—"}</td>
                    <td className="py-2 pr-3">{order?.service_snapshot?.title ?? "—"}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{String(row.state)}</td>
                    <td className="py-2 pr-3">{eur(Number(row.amount_cents ?? 0))}</td>
                    <td className="py-2">
                      {row.transferable_after
                        ? format(new Date(String(row.transferable_after)), "yyyy-MM-dd")
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </GlassCard>
      ) : null}

      {activeTab === "compliance" ? (
        <ComplianceTab />
      ) : null}
    </AdminPageShell>
  );
}

function ComplianceTab() {
  const { t } = useAdminT();
  const year = new Date().getFullYear();
  const [downloading, setDownloading] = useState(false);
  const [morStatus, setMorStatus] = useState<Record<string, unknown> | null>(null);
  const [signedOffBy, setSignedOffBy] = useState("");
  const [lawyerRef, setLawyerRef] = useState("");
  const [savingMor, setSavingMor] = useState(false);
  const [stripeTax, setStripeTax] = useState(false);
  const [sepaEnabled, setSepaEnabled] = useState(true);

  const loadMor = async () => {
    const res = await axiosAuth.get<{ data: Record<string, unknown> }>(
      "/api/v1/stats/payments/compliance/mor",
    );
    setMorStatus(res.data.data);
    setStripeTax(Boolean(res.data.data.stripeTaxEnabled));
    setSepaEnabled(res.data.data.sepaEnabled !== false);
  };

  useEffect(() => {
    void loadMor();
  }, []);

  const saveMorSignOff = async () => {
    if (!signedOffBy.trim()) return;
    setSavingMor(true);
    try {
      await axiosAuth.post("/api/v1/stats/payments/compliance/mor/sign-off", {
        signedOffBy,
        lawyerReference: lawyerRef || undefined,
      });
      setSignedOffBy("");
      setLawyerRef("");
      await loadMor();
    } finally {
      setSavingMor(false);
    }
  };

  const savePlatformConfig = async () => {
    setSavingMor(true);
    try {
      await axiosAuth.patch("/api/v1/stats/payments/compliance/config", {
        stripeTaxEnabled: stripeTax,
        sepaEnabled: sepaEnabled,
      });
      await loadMor();
    } finally {
      setSavingMor(false);
    }
  };

  const downloadDac7 = async () => {
    setDownloading(true);
    try {
      const res = await axiosAuth.get(`/api/v1/stats/payments/dac7-export?year=${year}`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dac7-specialists-${year}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <GlassCard className="p-4 space-y-3">
        <h2 className="font-bold text-admin-text">{t("payments.compliance.morTitle")}</h2>
        <p className="text-sm text-admin-text-dim">
          {t("payments.compliance.morDesc")}
        </p>
        {morStatus ? (
          <p className="text-xs font-mono text-admin-text">
            {t("payments.compliance.statusLabel")} {String(morStatus.morLegalStatus)} · {t("payments.compliance.terms")} {String(morStatus.morTermsVersion)}
            {morStatus.morSignedOffAt
              ? ` · ${t("payments.compliance.signed")} ${format(new Date(String(morStatus.morSignedOffAt)), "PP")}`
              : ""}
          </p>
        ) : null}
        {morStatus?.morLegalStatus !== "signed_off" ? (
          <div className="space-y-2">
            <input
              className="w-full rounded-xl border border-admin-border bg-admin-panel/40 p-2 text-sm"
              placeholder={t("payments.compliance.signedOffBy")}
              value={signedOffBy}
              onChange={(e) => setSignedOffBy(e.target.value)}
            />
            <input
              className="w-full rounded-xl border border-admin-border bg-admin-panel/40 p-2 text-sm"
              placeholder={t("payments.compliance.lawyerRef")}
              value={lawyerRef}
              onChange={(e) => setLawyerRef(e.target.value)}
            />
            <button
              type="button"
              onClick={saveMorSignOff}
              disabled={savingMor || !signedOffBy.trim()}
              className="rounded-xl px-4 py-2 text-sm font-semibold bg-admin-primary text-admin-bg disabled:opacity-50"
            >
              {savingMor ? t("payments.compliance.saving") : t("payments.compliance.recordSignOff")}
            </button>
          </div>
        ) : (
          <p className="text-sm text-admin-success">{t("payments.compliance.signOffRecorded")}</p>
        )}
      </GlassCard>

      <GlassCard className="p-4 space-y-3">
        <h2 className="font-bold text-admin-text">{t("payments.compliance.routingTitle")}</h2>
        <p className="text-sm text-admin-text-dim">
          {t("payments.compliance.routingDesc")}
        </p>
        <label className="flex items-center gap-2 text-sm text-admin-text">
          <input type="checkbox" checked={stripeTax} onChange={(e) => setStripeTax(e.target.checked)} />
          {t("payments.compliance.stripeTax")}
        </label>
        <label className="flex items-center gap-2 text-sm text-admin-text">
          <input type="checkbox" checked={sepaEnabled} onChange={(e) => setSepaEnabled(e.target.checked)} />
          {t("payments.compliance.sepa")}
        </label>
        <button
          type="button"
          onClick={savePlatformConfig}
          disabled={savingMor}
          className="rounded-xl px-4 py-2 text-sm font-semibold border border-admin-border text-admin-text hover:bg-admin-bg/50 disabled:opacity-50"
        >
          {t("payments.compliance.saveRouting")}
        </button>
      </GlassCard>

      <GlassCard className="p-4 space-y-3">
        <h2 className="font-bold text-admin-text">{t("payments.compliance.dac7Title")}</h2>
        <p className="text-sm text-admin-text-dim">
          {t("payments.compliance.dac7Desc")}
        </p>
        <button
          type="button"
          onClick={downloadDac7}
          disabled={downloading}
          className="inline-flex rounded-xl px-4 py-2 text-sm font-semibold border border-admin-primary text-admin-primary hover:bg-admin-primary/10 disabled:opacity-50"
        >
          {downloading ? t("earlyAccess.preparing") : t("payments.compliance.downloadCsv", { year })}
        </button>
      </GlassCard>
      <ReconcileCard />
      <CollusionGraphCard />
    </div>
  );
}

function CollusionGraphCard() {
  const { t } = useAdminT();
  const [userId, setUserId] = useState("");
  const [graph, setGraph] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!userId.trim()) return;
    setLoading(true);
    try {
      const res = await axiosAuth.get<{ data: Record<string, unknown> }>(
        `/api/v1/stats/payments/users/${userId.trim()}/collusion-graph`,
      );
      setGraph(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-4 space-y-3 lg:col-span-2">
      <h2 className="font-bold text-admin-text">{t("payments.compliance.collusionTitle")}</h2>
      <p className="text-sm text-admin-text-dim">
        {t("payments.compliance.collusionDesc")}
      </p>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl border border-admin-border bg-admin-panel/40 p-2 text-sm font-mono"
          placeholder={t("payments.compliance.userIdPlaceholder")}
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button
          type="button"
          onClick={load}
          disabled={loading || !userId.trim()}
          className="rounded-xl px-4 py-2 text-sm font-semibold border border-admin-border text-admin-text hover:bg-admin-bg/50 disabled:opacity-50"
        >
          {loading ? t("common.loading") : t("payments.compliance.loadGraph")}
        </button>
      </div>
      {graph ? (
        <pre className="text-[10px] max-h-48 overflow-auto bg-black/30 p-2 rounded-lg text-admin-text-dim">
          {JSON.stringify(graph, null, 2)}
        </pre>
      ) : null}
    </GlassCard>
  );
}

function ReconcileCard() {
  const { t } = useAdminT();
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosAuth.get<{ data: Array<Record<string, unknown>> }>(
        "/api/v1/stats/payments/reconcile",
      );
      setRows(res.data.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-4 space-y-3">
      <h2 className="font-bold text-admin-text">{t("payments.compliance.reconcileTitle")}</h2>
      <p className="text-sm text-admin-text-dim">
        {t("payments.compliance.reconcileDesc")}
      </p>
      <button
        type="button"
        onClick={load}
        disabled={loading}
        className="rounded-xl px-4 py-2 text-sm font-semibold border border-admin-border text-admin-text hover:bg-admin-bg/50 disabled:opacity-50"
      >
        {loading ? t("payments.compliance.checking") : t("payments.compliance.runCheck")}
      </button>
      {rows.length === 0 && !loading ? (
        <p className="text-xs text-admin-text-dim">{t("payments.compliance.noMismatches")}</p>
      ) : null}
      {rows.length > 0 ? (
        <ul className="text-xs space-y-1 font-mono text-amber-300">
          {rows.map((r) => (
            <li key={String(r.bookingId)}>
              {t("payments.compliance.mismatchLine", {
                bookingId: String(r.bookingId),
                kind: String(r.kind),
                expected: String(r.expectedCents),
                actual: String(r.actualCents),
              })}
            </li>
          ))}
        </ul>
      ) : null}
    </GlassCard>
  );
}
