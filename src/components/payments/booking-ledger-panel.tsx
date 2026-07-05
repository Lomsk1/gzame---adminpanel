import { useState } from "react";
import axiosAuth from "../../helper/axios";
import { format } from "date-fns";

type LedgerRow = {
  _id: string;
  account: string;
  direction: "debit" | "credit";
  amount_cents: number;
  currency?: string;
  ref_type?: string;
  ref_id?: string;
  owner_id?: string;
  created_at?: string;
};

function eur(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

type Props = {
  bookingId: string;
};

export function BookingLedgerPanel({ bookingId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<LedgerRow[]>([]);

  const load = async () => {
    if (rows.length > 0) {
      setOpen((v) => !v);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axiosAuth.get<{ data: LedgerRow[] }>(
        `/api/v1/stats/payments/bookings/${bookingId}/ledger`,
      );
      setRows(res.data.data ?? []);
      setOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load ledger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={load}
        disabled={loading}
        className="rounded-lg px-2 py-1 text-xs font-semibold border border-admin-border text-admin-text-dim hover:text-admin-text disabled:opacity-50"
      >
        {loading ? "Loading…" : open ? "Hide ledger" : "View ledger"}
      </button>
      {error ? <p className="text-xs text-red-400 mt-1">{error}</p> : null}
      {open && rows.length > 0 ? (
        <div className="mt-2 overflow-x-auto rounded-lg border border-admin-border/60">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-admin-text-dim border-b border-admin-border/40">
                <th className="py-1.5 px-2">Time</th>
                <th className="py-1.5 px-2">Account</th>
                <th className="py-1.5 px-2">Dir</th>
                <th className="py-1.5 px-2">Amount</th>
                <th className="py-1.5 px-2">Ref</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="border-b border-admin-border/30">
                  <td className="py-1.5 px-2 whitespace-nowrap">
                    {row.created_at ? format(new Date(row.created_at), "MM-dd HH:mm") : "—"}
                  </td>
                  <td className="py-1.5 px-2 font-mono">{row.account}</td>
                  <td className="py-1.5 px-2 font-mono">{row.direction}</td>
                  <td className="py-1.5 px-2">{eur(row.amount_cents)}</td>
                  <td className="py-1.5 px-2 text-admin-text-dim">
                    {row.ref_type ?? "—"}
                    {row.ref_id ? ` · ${row.ref_id.slice(0, 12)}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {open && rows.length === 0 && !loading ? (
        <p className="text-xs text-admin-text-dim mt-1">No ledger entries yet.</p>
      ) : null}
    </div>
  );
}
