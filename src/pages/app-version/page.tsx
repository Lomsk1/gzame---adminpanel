import axios from "axios";
import { format } from "date-fns";
import { Rocket, Save, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { useLoaderData, useRevalidator } from "react-router";
import { toast } from "sonner";
import { GlassCard } from "../../components/cards/card-glass";
import { ButtonComponent } from "../../components/form/button";
import { AdminPageHeader, AdminPageShell } from "../../components/admin";
import axiosAuth from "../../helper/axios";
import type { AppVersionConfigPayload } from "../../features/app-version/app-version.loaders";
import { useAdminT } from "../../store/locale/locale";

export default function AppVersionPage() {
  const { t } = useAdminT();
  const { config } = useLoaderData() as { config: AppVersionConfigPayload };
  const revalidator = useRevalidator();

  const [enabled, setEnabled] = useState(config.enabled);
  const [forceUpdate, setForceUpdate] = useState(config.forceUpdate);
  const [minVersion, setMinVersion] = useState(config.minVersion);
  const [minBuildNumber, setMinBuildNumber] = useState(String(config.minBuildNumber || 0));
  const [storeUrlAndroid, setStoreUrlAndroid] = useState(config.storeUrlAndroid);
  const [storeUrlIos, setStoreUrlIos] = useState(config.storeUrlIos);
  const [title, setTitle] = useState(config.title);
  const [message, setMessage] = useState(config.message);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEnabled(config.enabled);
    setForceUpdate(config.forceUpdate);
    setMinVersion(config.minVersion);
    setMinBuildNumber(String(config.minBuildNumber || 0));
    setStoreUrlAndroid(config.storeUrlAndroid);
    setStoreUrlIos(config.storeUrlIos);
    setTitle(config.title);
    setMessage(config.message);
  }, [config]);

  const handleSave = async () => {
    const trimmedVersion = minVersion.trim();
    if (!/^\d{1,4}(\.\d{1,4}){0,3}$/.test(trimmedVersion)) {
      toast.error(t("appVersion.invalidVersion"));
      return;
    }
    const buildNum = Number.parseInt(minBuildNumber, 10);
    if (!Number.isFinite(buildNum) || buildNum < 0) {
      toast.error(t("appVersion.invalidBuild"));
      return;
    }

    setSaving(true);
    const toastId = toast.loading(t("appVersion.saving"));
    try {
      await axiosAuth.patch("/api/v1/app-version", {
        enabled,
        forceUpdate,
        minVersion: trimmedVersion,
        minBuildNumber: buildNum,
        storeUrlAndroid: storeUrlAndroid.trim(),
        storeUrlIos: storeUrlIos.trim(),
        title: title.trim(),
        message: message.trim(),
      });
      toast.success(t("appVersion.saved"), { id: toastId });
      await revalidator.revalidate();
    } catch (err: unknown) {
      const description =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String((err.response.data as { message?: string }).message)
          : t("appVersion.saveFailed");
      toast.error(t("appVersion.saveFailed"), { id: toastId, description });
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-admin-border/80 bg-admin-bg/60 px-3 py-2.5 text-sm text-admin-text outline-none transition focus:border-admin-primary/60 focus:ring-2 focus:ring-admin-primary/20";
  const labelClass = "block text-[11px] font-bold uppercase tracking-wider text-admin-text-dim";

  return (
    <AdminPageShell className="space-y-8">
      <AdminPageHeader
        title={t("pages.appVersion.title")}
        icon={<Rocket className="h-5 w-5 text-admin-primary" />}
        actions={
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-admin-border/80 bg-admin-panel/80 px-4 py-3 backdrop-blur-sm">
            <Smartphone className="h-5 w-5 text-admin-accent" aria-hidden />
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">
                {t("appVersion.endpoint")}
              </p>
              <p className="font-mono text-xs text-admin-text">GET /api/v1/app-version</p>
            </div>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start admin-fade-up" style={{ animationDelay: "80ms" }}>
        <GlassCard className="border-admin-border/50 lg:col-span-7 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-admin-text">{t("appVersion.settingsTitle")}</h2>
            <p className="mt-1 text-sm text-admin-text-dim">{t("appVersion.settingsDesc")}</p>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-admin-border/60 bg-admin-bg/40 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-admin-border accent-admin-primary"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              <span>
                <span className="block text-sm font-semibold text-admin-text">
                  {t("appVersion.enabled")}
                </span>
                <span className="block text-xs text-admin-text-dim mt-0.5">
                  {t("appVersion.enabledHint")}
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-admin-border accent-admin-primary"
                checked={forceUpdate}
                onChange={(e) => setForceUpdate(e.target.checked)}
              />
              <span>
                <span className="block text-sm font-semibold text-admin-text">
                  {t("appVersion.forceUpdate")}
                </span>
                <span className="block text-xs text-admin-text-dim mt-0.5">
                  {t("appVersion.forceUpdateHint")}
                </span>
              </span>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="min-version" className={labelClass}>
                {t("appVersion.minVersion")}
              </label>
              <input
                id="min-version"
                className={inputClass}
                value={minVersion}
                onChange={(e) => setMinVersion(e.target.value)}
                placeholder="1.2.0"
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="min-build" className={labelClass}>
                {t("appVersion.minBuild")}
              </label>
              <input
                id="min-build"
                className={inputClass}
                value={minBuildNumber}
                onChange={(e) => setMinBuildNumber(e.target.value)}
                placeholder="0"
                inputMode="numeric"
                autoComplete="off"
              />
              <p className="mt-1 text-[11px] text-admin-text-dim">{t("appVersion.minBuildHint")}</p>
            </div>
          </div>

          <div>
            <label htmlFor="play-url" className={labelClass}>
              {t("appVersion.playUrl")}
            </label>
            <input
              id="play-url"
              className={inputClass}
              value={storeUrlAndroid}
              onChange={(e) => setStoreUrlAndroid(e.target.value)}
              placeholder="https://play.google.com/store/apps/details?id=com.gzame.app"
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="ios-url" className={labelClass}>
              {t("appVersion.iosUrl")}{" "}
              <span className="font-normal normal-case tracking-normal text-admin-text-muted">
                {t("appVersion.optional")}
              </span>
            </label>
            <input
              id="ios-url"
              className={inputClass}
              value={storeUrlIos}
              onChange={(e) => setStoreUrlIos(e.target.value)}
              placeholder="https://apps.apple.com/app/id…"
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="update-title" className={labelClass}>
              {t("appVersion.customTitle")}{" "}
              <span className="font-normal normal-case tracking-normal text-admin-text-muted">
                {t("appVersion.optional")}
              </span>
            </label>
            <input
              id="update-title"
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("appVersion.titlePlaceholder")}
              maxLength={120}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="update-message" className={labelClass}>
              {t("appVersion.customMessage")}{" "}
              <span className="font-normal normal-case tracking-normal text-admin-text-muted">
                {t("appVersion.optional")}
              </span>
            </label>
            <textarea
              id="update-message"
              className={`${inputClass} min-h-[96px] resize-y`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("appVersion.messagePlaceholder")}
              maxLength={500}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p className="text-xs text-admin-text-dim">
              {config.updatedAt
                ? t("appVersion.lastUpdated", {
                    date: format(new Date(config.updatedAt), "dd MMM yyyy · HH:mm"),
                  })
                : t("appVersion.neverSaved")}
            </p>
            <div className="w-full sm:w-auto sm:min-w-[180px]">
              <ButtonComponent type="button" onClick={handleSave} disabled={saving} isLoading={saving}>
                <Save className="h-4 w-4" aria-hidden />
                {t("appVersion.save")}
              </ButtonComponent>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="border-admin-border/50 lg:col-span-5 space-y-4">
          <h2 className="text-lg font-bold text-admin-text">{t("appVersion.howTitle")}</h2>
          <ol className="list-decimal space-y-3 pl-5 text-sm text-admin-text-dim">
            <li>{t("appVersion.how1")}</li>
            <li>{t("appVersion.how2")}</li>
            <li>{t("appVersion.how3")}</li>
          </ol>
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              enabled
                ? "border-admin-accent/40 bg-admin-accent/10 text-admin-text"
                : "border-admin-border/60 bg-admin-bg/40 text-admin-text-dim"
            }`}
          >
            <p className="text-[10px] font-black uppercase tracking-wider opacity-70">
              {t("appVersion.status")}
            </p>
            <p className="mt-1 font-semibold">
              {enabled
                ? forceUpdate
                  ? t("appVersion.statusForce")
                  : t("appVersion.statusSoft")
                : t("appVersion.statusOff")}
            </p>
            {enabled ? (
              <p className="mt-1 font-mono text-xs opacity-80">
                ≥ {minVersion.trim() || "—"}
                {Number.parseInt(minBuildNumber, 10) > 0
                  ? ` · build ≥ ${minBuildNumber}`
                  : ""}
              </p>
            ) : null}
          </div>
        </GlassCard>
      </div>
    </AdminPageShell>
  );
}
