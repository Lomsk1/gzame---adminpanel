import { useState } from "react";
import axiosAuth from "../../helper/axios";
import { ConfirmDialog } from "../ui/confirm-dialog";

type Props = {
  bookingId: string;
  disputeReason?: string;
  evidenceUrls?: string[];
  totalCents?: number;
  status?: string;
  disputeResolved?: boolean;
  onResolved: () => void;
};

export function DisputeResolvePanel({
  bookingId,
  disputeReason,
  evidenceUrls,
  totalCents,
  status,
  disputeResolved,
  onResolved,
}: Props) {
  const [loading, setLoading] = useState<"refund" | "release" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [partialEur, setPartialEur] = useState("");
  const [refundServiceFee, setRefundServiceFee] = useState(true);
  const [deviPack, setDeviPack] = useState<Record<string, unknown> | null>(null);
  const [loadingDevi, setLoadingDevi] = useState(false);
  const [pending, setPending] = useState<"refund" | "release" | null>(null);

  const locked = status !== "disputed" || disputeResolved === true;

  const loadDeviPack = async () => {
    setLoadingDevi(true);
    try {
      const res = await axiosAuth.get<{ data: Record<string, unknown> }>(
        `/api/v1/stats/payments/bookings/${bookingId}/devi-evidence`,
      );
      setDeviPack(res.data.data);
    } finally {
      setLoadingDevi(false);
    }
  };

  const resolve = async (resolution: "refund" | "release") => {
    setLoading(resolution);
    setError(null);
    try {
      const amountCents =
        resolution === "refund" && partialEur.trim()
          ? Math.round(Number.parseFloat(partialEur) * 100)
          : undefined;

      await axiosAuth.post(`/api/v1/consultations/bookings/${bookingId}/resolve`, {
        resolution,
        ...(amountCents && amountCents > 0 ? { amountCents } : {}),
        refundServiceFee,
      });
      setPending(null);
      onResolved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Resolution failed");
    } finally {
      setLoading(null);
    }
  };

  if (locked) {
    return (
      <div className="mt-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
        <p className="text-xs font-bold text-emerald-300">Report resolved — use Reports page for details.</p>
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 space-y-3">
      <p className="text-xs font-bold uppercase tracking-wide text-amber-400">
        Dispute review — use Reports for full workflow
      </p>

      {disputeReason ? (
        <div className="rounded-lg bg-black/20 p-2.5">
          <p className="text-[10px] font-semibold uppercase text-admin-text-dim mb-1">Client report</p>
          <p className="text-xs text-admin-text whitespace-pre-wrap">{disputeReason}</p>
        </div>
      ) : (
        <p className="text-xs text-admin-text-dim italic">No report text provided.</p>
      )}

      <div>
        <p className="text-[10px] font-semibold uppercase text-admin-text-dim mb-2">
          Photo evidence ({evidenceUrls?.length ?? 0})
        </p>
        {evidenceUrls && evidenceUrls.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {evidenceUrls.map((url, index) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="group block overflow-hidden rounded-lg border border-admin-border/60 bg-black/30"
                title={`Evidence ${index + 1}`}
              >
                <img
                  src={url}
                  alt={`Dispute evidence ${index + 1}`}
                  className="h-20 w-20 object-cover transition-opacity group-hover:opacity-80"
                />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-xs text-admin-text-dim italic">No photos attached.</p>
        )}
      </div>

      <button
        type="button"
        onClick={loadDeviPack}
        disabled={loadingDevi}
        className="text-xs font-semibold text-admin-primary underline disabled:opacity-50"
      >
        {loadingDevi ? "Loading Devi pack…" : "View Devi evidence pack"}
      </button>
      {deviPack ? (
        <pre className="text-[10px] max-h-40 overflow-auto bg-black/30 p-2 rounded-lg text-admin-text-dim">
          {JSON.stringify(
            {
              recommendation: deviPack.devi_recommendation,
              flags: (deviPack.fraud as { client_collusion?: { deviceHashes?: string[] } })
                ?.client_collusion?.deviceHashes,
            },
            null,
            2,
          )}
        </pre>
      ) : null}

      <label className="flex items-center gap-2 text-xs text-admin-text-dim">
        <input
          type="checkbox"
          checked={refundServiceFee}
          onChange={(e) => setRefundServiceFee(e.target.checked)}
        />
        Refund service fee (full refunds only)
      </label>
      <input
        type="number"
        min={0}
        step={0.01}
        placeholder={
          totalCents
            ? `Partial refund EUR (max ${(totalCents / 100).toFixed(2)})`
            : "Partial refund EUR (optional)"
        }
        value={partialEur}
        onChange={(e) => setPartialEur(e.target.value)}
        className="w-full rounded-lg border border-admin-border bg-admin-bg px-2 py-1 text-xs text-admin-text"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!!loading}
          onClick={() => setPending("refund")}
          className="rounded-lg px-3 py-1.5 text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 disabled:opacity-50"
        >
          {loading === "refund" ? "Refunding…" : "Refund client"}
        </button>
        <button
          type="button"
          disabled={!!loading}
          onClick={() => setPending("release")}
          className="rounded-lg px-3 py-1.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 disabled:opacity-50"
        >
          {loading === "release" ? "Releasing…" : "Release to specialist"}
        </button>
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}

      <ConfirmDialog
        open={pending !== null}
        title={pending === "release" ? "Release to specialist?" : "Refund client?"}
        message={
          pending === "release"
            ? "This is permanent. Payment goes to the specialist wallet."
            : "This is permanent. Stripe refund goes to the client's card."
        }
        confirmLabel={pending === "release" ? "Release" : "Refund"}
        variant={pending === "release" ? "success" : "danger"}
        loading={!!loading}
        onCancel={() => {
          if (!loading) setPending(null);
        }}
        onConfirm={() => {
          if (pending) void resolve(pending);
        }}
      />
    </div>
  );
}
