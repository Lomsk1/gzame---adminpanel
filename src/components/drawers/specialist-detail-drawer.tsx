import { useState } from "react";
import useSWR from "swr";
import { useRevalidator } from "react-router";
import { toast } from "sonner";
import axiosAuth from "../../helper/axios";
import { useAdminT } from "../../store/locale/locale";
import type { Specialist } from "../../types/specialist/specialist";
import type { UsersDataType } from "../../types/user/user";
import { UserDetailDrawer } from "./user-detail-drawer";
import { ButtonComponent } from "../form/button";
import { AdminConfirmWrapper } from "../wrapper/wrapper";
import ButtonCloseDrawer from "../ui/button-close-drawer";
import { SpecialistStatusBadge } from "../specialists/specialist-status-badge";
import { DEFAULT_AVATAR, getCountryName, trustTierLabel, type TrustTierValue } from "../specialists/constants";
import { PsychotypeBadge } from "../ui/psychotypeBadge";

type DrawerTab = "directory" | "account";

interface Props {
  specialist: Specialist;
  onClose: () => void;
  onEdit: () => void;
  onDeleted: () => void;
}

const fetcher = (url: string) => axiosAuth.get(url).then((res) => res.data);

export function SpecialistDetailDrawer({ specialist, onClose, onEdit, onDeleted }: Props) {
  const { t } = useAdminT();
  const revalidator = useRevalidator();
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<DrawerTab>("directory");
  const linkedUserId = specialist.user_id?.trim() || null;

  const {
    data: linkedUserResponse,
    isLoading: linkedUserLoading,
    error: linkedUserError,
  } = useSWR<{ data: UsersDataType["data"][0] }>(
    linkedUserId ? `/api/v1/auth/users/${linkedUserId}` : null,
    fetcher,
    { revalidateOnFocus: false },
  );

  const linkedUser = linkedUserResponse?.data ?? null;

  const run = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true);
    const id = toast.loading(t("common.processing"));
    try {
      await fn();
      toast.success(ok, { id });
      revalidator.revalidate();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : t("specialists.toast.failed");
      toast.error(msg ?? t("specialists.toast.failed"), { id });
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = () =>
    run(async () => {
      await axiosAuth.patch(`/api/v1/specialists/${specialist._id}`, {
        isActive: specialist.isActive === false,
      });
    }, specialist.isActive === false ? t("specialists.detail.activated") : t("specialists.detail.deactivated"));

  const setKyc = (kyc_status: string) =>
    run(async () => {
      await axiosAuth.patch(`/api/v1/specialists/${specialist._id}/kyc-status`, {
        kyc_status,
      });
    }, t("specialists.detail.kycUpdated"));

  const setTrustTier = (trust_tier: TrustTierValue) =>
    run(async () => {
      await axiosAuth.patch(`/api/v1/specialists/${specialist._id}/trust-tier`, {
        trust_tier,
      });
    }, `Trust tier set to ${trust_tier}`);

  const deleteSpecialist = () =>
    run(async () => {
      await axiosAuth.delete(`/api/v1/specialists/${specialist._id}`);
      onDeleted();
      onClose();
    }, t("specialists.detail.deleted"));

  const services = specialist.services ?? [];
  const countries = specialist.countries ?? [];
  const languages = specialist.languages ?? [];
  const tags = specialist.tags ?? [];
  const categories = Array.isArray(specialist.categories) ? specialist.categories : [];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="Close" />
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-admin-border bg-admin-panel shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex items-start justify-between border-b border-admin-border/50 p-5">
          <div className="flex min-w-0 gap-3">
            <img
              src={specialist.avatar || DEFAULT_AVATAR}
              alt=""
              className="h-14 w-14 shrink-0 rounded-xl border border-admin-border object-cover"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_AVATAR;
              }}
            />
            <div className="min-w-0">
              <h2 className="truncate text-lg font-black text-admin-text">{specialist.name}</h2>
              <p className="truncate text-sm text-admin-text-dim">{specialist.specialty || "—"}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {specialist.isActive === false ? (
                  <SpecialistStatusBadge variant="inactive">Inactive</SpecialistStatusBadge>
                ) : (
                  <SpecialistStatusBadge variant="active">Active</SpecialistStatusBadge>
                )}
                {specialist.portal_enabled ? (
                  <SpecialistStatusBadge variant="portal">Portal</SpecialistStatusBadge>
                ) : null}
                <span className="rounded-full bg-admin-bg px-2 py-0.5 text-[10px] font-bold uppercase text-admin-text-dim">
                  KYC: {specialist.kyc_status ?? "none"}
                </span>
                <span className="rounded-full bg-admin-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase text-admin-primary">
                  {trustTierLabel(specialist.trust_tier)}
                </span>
              </div>
              {linkedUser ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <PsychotypeBadge type={linkedUser.psychotype} />
                  <span className="text-[10px] font-mono text-admin-text-dim">
                    LVL {linkedUser.currentLevel} · {linkedUser.email}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
          <ButtonCloseDrawer onClose={onClose} />
        </div>

        <div className="flex gap-1 border-b border-admin-border/40 bg-admin-bg/20 p-2">
          {([
            { id: "directory" as const, label: t("specialists.detail.directoryProfile") },
            { id: "account" as const, label: t("specialists.detail.portalAccount") },
          ]).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`flex-1 rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-wide transition-colors ${
                tab === item.id
                  ? "bg-admin-primary text-white"
                  : "text-admin-text-dim hover:bg-admin-panel/60 hover:text-admin-text"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {tab === "directory" ? (
            <div className="space-y-5 p-5">
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-admin-text-dim">Profile</h3>
                <p className="mt-2 text-sm leading-relaxed text-admin-text-dim">{specialist.bio || t("specialists.detail.noBio")}</p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-admin-text-muted">Invite</dt>
                    <dd className="font-mono text-admin-text">{specialist.invite_code || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-admin-text-muted">Portal email</dt>
                    <dd className="truncate text-admin-text">{specialist.portal_user_email || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-admin-text-muted">Linked user</dt>
                    <dd className="font-mono text-admin-text">{linkedUserId || t("specialists.detail.notLinked")}</dd>
                  </div>
                  <div>
                    <dt className="text-admin-text-muted">Stripe</dt>
                    <dd className="font-mono text-admin-text">
                      {specialist.stripe_connect_account_id
                        ? `…${specialist.stripe_connect_account_id.slice(-8)}`
                        : t("specialists.detail.notLinked")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-admin-text-muted">Monthly limit</dt>
                    <dd className="text-admin-text">{specialist.monthly_client_limit ?? 10}</dd>
                  </div>
                  <div>
                    <dt className="text-admin-text-muted">Trust tier</dt>
                    <dd className="text-admin-text">
                      {trustTierLabel(specialist.trust_tier)}
                      {specialist.reserve_pct != null ? ` · ${specialist.reserve_pct}% reserve` : ""}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-admin-text-muted">Order</dt>
                    <dd className="text-admin-text">{specialist.order ?? 0}</dd>
                  </div>
                </dl>
              </section>

              {categories.length ? (
                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-admin-text-dim">Categories</h3>
                  <p className="mt-1 text-xs text-admin-text">
                    {categories
                      .map((c) => (typeof c === "string" ? c : c.title?.en || c._id))
                      .join(", ")}
                  </p>
                </section>
              ) : null}

              {services.length ? (
                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-admin-text-dim">Services</h3>
                  <ul className="mt-2 space-y-2">
                    {services.map((s) => (
                      <li
                        key={s.title}
                        className="rounded-lg border border-admin-border/40 bg-admin-bg/40 px-3 py-2 text-xs"
                      >
                        <span className="font-semibold text-admin-text">{s.title}</span>
                        <span className="text-admin-text-dim">
                          {" "}
                          · {s.duration_minutes}m
                          {s.price_cents ? ` · €${(s.price_cents / 100).toFixed(2)}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {countries.length || languages.length ? (
                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-admin-text-dim">Reach</h3>
                  {countries.length ? (
                    <p className="mt-1 text-xs text-admin-text">
                      {countries.map((c) => getCountryName(c)).join(", ")}
                    </p>
                  ) : null}
                  {languages.length ? (
                    <p className="mt-1 text-xs text-admin-text-dim">Languages: {languages.join(", ")}</p>
                  ) : null}
                </section>
              ) : null}

              {tags.length ? (
                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-admin-text-dim">Tags</h3>
                  <p className="mt-1 text-xs text-admin-text">{tags.join(", ")}</p>
                </section>
              ) : null}

              {(specialist.legal_name || specialist.tax_id) && (
                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-admin-text-dim">Compliance</h3>
                  <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    {specialist.legal_name ? (
                      <div>
                        <dt className="text-admin-text-muted">Legal name</dt>
                        <dd className="text-admin-text">{specialist.legal_name}</dd>
                      </div>
                    ) : null}
                    {specialist.tax_id ? (
                      <div>
                        <dt className="text-admin-text-muted">Tax ID</dt>
                        <dd className="font-mono text-admin-text">{specialist.tax_id}</dd>
                      </div>
                    ) : null}
                  </dl>
                </section>
              )}

              {!linkedUserId ? (
                <div className="rounded-xl border border-dashed border-admin-border/60 bg-admin-bg/30 p-4 text-center">
                  <p className="text-xs text-admin-text-dim">
                    No portal user linked. Enable portal access to view psychotype, progression, and full account controls.
                  </p>
                  <ButtonComponent variant="oracle" size="sm" className="mt-3" onClick={onEdit}>
                    Enable / edit portal
                  </ButtonComponent>
                </div>
              ) : (
                <ButtonComponent variant="secondary" size="sm" onClick={() => setTab("account")}>
                  View full portal account →
                </ButtonComponent>
              )}
            </div>
          ) : linkedUserLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-admin-primary border-t-transparent" />
            </div>
          ) : linkedUserError || !linkedUser ? (
            <div className="space-y-4 p-5">
              <div className="rounded-xl border border-admin-error/30 bg-admin-error/5 p-4 text-center">
                <p className="text-sm text-admin-error">
                  {linkedUserId
                    ? "Could not load linked portal account."
                    : "This specialist has no linked portal user yet."}
                </p>
              </div>
              {!linkedUserId ? (
                <ButtonComponent variant="oracle" size="sm" onClick={onEdit}>
                  Enable portal access
                </ButtonComponent>
              ) : null}
            </div>
          ) : (
            <UserDetailDrawer user={linkedUser} onClose={onClose} embedded />
          )}
        </div>

        {tab === "directory" ? (
          <div className="border-t border-admin-border/50 p-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <ButtonComponent variant="oracle" size="sm" disabled={busy} onClick={onEdit}>
                Edit profile
              </ButtonComponent>
              <ButtonComponent variant="secondary" size="sm" disabled={busy} onClick={toggleActive}>
                {specialist.isActive === false ? t("specialists.detail.activate") : t("specialists.detail.deactivate")}
              </ButtonComponent>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(["none", "pending", "verified", "rejected"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  disabled={busy || specialist.kyc_status === k}
                  onClick={() => setKyc(k)}
                  className="rounded-lg border border-admin-border px-2 py-1.5 text-[10px] font-bold uppercase text-admin-text-dim hover:border-admin-primary/40 disabled:opacity-40"
                >
                  {k}
                </button>
              ))}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-admin-text-dim pt-1">
              Payout trust tier
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(["T0", "T1", "T2"] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  disabled={busy || (specialist.trust_tier ?? "T0") === tier}
                  onClick={() => setTrustTier(tier)}
                  title={
                    tier === "T0"
                      ? "10% reserve · 5d clearance"
                      : tier === "T1"
                        ? "5% reserve · 1d clearance"
                        : "2% reserve · same-day clearance"
                  }
                  className={`rounded-lg border px-2 py-2 text-[10px] font-bold uppercase transition-colors disabled:opacity-40 ${
                    (specialist.trust_tier ?? "T0") === tier
                      ? "border-admin-primary bg-admin-primary/15 text-admin-primary"
                      : "border-admin-border text-admin-text-dim hover:border-admin-primary/40"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
            <AdminConfirmWrapper
              title="Delete specialist?"
              description="Permanently removes this specialist from the directory."
              onConfirm={deleteSpecialist}
              variant="danger"
            >
              <ButtonComponent variant="danger" size="sm" disabled={busy} className="w-full">
                Delete specialist
              </ButtonComponent>
            </AdminConfirmWrapper>
          </div>
        ) : null}
      </div>
    </div>
  );
}
