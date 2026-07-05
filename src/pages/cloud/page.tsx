import axios from "axios";
import { format } from "date-fns";
import {
  CheckCircle2,
  Cloud,
  Copy,
  ExternalLink,
  Package,
  Radio,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { useLoaderData, useRevalidator } from "react-router";
import { toast } from "sonner";
import { GlassCard } from "../../components/cards/card-glass";
import { ButtonComponent } from "../../components/form/button";
import { ConfirmDialog } from "../../components/ui/confirm-dialog";
import axiosAuth, { axiosMultipartAuth } from "../../helper/axios";
import type { AndroidApkReleasePayload } from "../../features/cloud/cloud.loaders";
import { AdminPageHeader, AdminPageShell } from "../../components/admin";
import { useAdminT } from "../../store/locale/locale";

export default function CloudPage() {
  const { t } = useAdminT();
  const { release } = useLoaderData() as { release: AndroidApkReleasePayload };
  const revalidator = useRevalidator();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [versionLabel, setVersionLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleUpload = async () => {
    const input = fileInputRef.current;
    const file = input?.files?.[0];
    if (!file) {
      toast.error(t("cloud.chooseApk"));
      return;
    }
    setUploading(true);
    const toastId = toast.loading(t("cloud.uploading"));
    try {
      const fd = new FormData();
      fd.append("apk", file);
      if (versionLabel.trim()) {
        fd.append("versionLabel", versionLabel.trim());
      }
      await axiosMultipartAuth.post("/api/v1/android-apk/upload", fd);
      toast.success(t("cloud.uploadSuccess"), {
        id: toastId,
        description: t("cloud.uploadSuccessDesc"),
      });
      setVersionLabel("");
      setSelectedFileName(null);
      if (input) input.value = "";
      await revalidator.revalidate();
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String((err.response.data as { message?: string }).message)
          : t("cloud.uploadFailed");
      toast.error(t("cloud.uploadFailed"), { id: toastId, description: message });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const toastId = toast.loading(t("cloud.removingRelease"));
    try {
      await axiosAuth.delete("/api/v1/android-apk");
      toast.success(t("cloud.removedSuccess"), { id: toastId });
      setClearOpen(false);
      await revalidator.revalidate();
    } catch {
      toast.error(t("cloud.removeFailed"), { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  const copyUrl = async () => {
    if (!release?.downloadUrl) return;
    try {
      await navigator.clipboard.writeText(release.downloadUrl);
      toast.success(t("cloud.urlCopied"));
    } catch {
      toast.error(t("cloud.copyFailed"));
    }
  };

  return (
    <AdminPageShell className="space-y-8">
      <AdminPageHeader
        title={t("pages.cloud.title")}
        icon={<Cloud className="h-5 w-5 text-admin-primary" />}
        actions={
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-admin-border/80 bg-admin-panel/80 px-4 py-3 backdrop-blur-sm">
            <Package className="h-5 w-5 text-admin-accent" aria-hidden />
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">
                {t("cloud.endpoint")}
              </p>
              <p className="font-mono text-xs text-admin-text">GET /api/v1/android-apk</p>
            </div>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start admin-fade-up" style={{ animationDelay: "80ms" }}>
        {/* Live release */}
        <GlassCard
          glow={!!release}
          className={`border-admin-border/50 lg:col-span-7 ${release ? "shadow-[0_0_50px_-12px_rgba(16,185,129,0.35)]" : ""}`}
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-admin-text-dim">
                  {t("cloud.liveRelease")}
                </p>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-admin-text">
                  {t("cloud.androidDownload")}
                </h2>
              </div>
              {release ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-admin-success/40 bg-admin-success/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-admin-success">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-admin-success opacity-40" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-admin-success" />
                  </span>
                  {t("cloud.live")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-admin-warning/40 bg-admin-warning/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-admin-warning">
                  <Radio className="h-3.5 w-3.5" aria-hidden />
                  {t("cloud.notPublished")}
                </span>
              )}
            </div>

            {release ? (
              <div className="space-y-5">
                <dl className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-admin-border/60 bg-admin-bg/50 p-4">
                    <dt className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">
                      {t("cloud.version")}
                    </dt>
                    <dd className="mt-2 font-mono text-sm font-semibold text-admin-text">
                      {release.versionLabel?.trim() || "—"}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-admin-border/60 bg-admin-bg/50 p-4 sm:col-span-2">
                    <dt className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">
                      {t("cloud.packageFile")}
                    </dt>
                    <dd className="mt-2 truncate font-mono text-sm text-admin-text" title={release.fileName}>
                      {release.fileName || "—"}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-admin-border/60 bg-admin-bg/50 p-4 sm:col-span-3">
                    <dt className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">
                      {t("cloud.lastUpdated")}
                    </dt>
                    <dd className="mt-2 text-sm font-medium text-admin-text">
                      {release.updatedAt
                        ? format(new Date(release.updatedAt), "MMM d, yyyy · HH:mm")
                        : "—"}
                    </dd>
                  </div>
                </dl>

                <div className="rounded-xl border border-admin-border bg-admin-bg/60 p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim mb-2">
                    {t("cloud.hostedUrl")}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <code className="block max-w-full truncate rounded-lg bg-admin-panel px-3 py-2 text-[11px] leading-relaxed text-admin-accent">
                      {release.downloadUrl}
                    </code>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={copyUrl}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-admin-card px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-admin-text transition hover:border-admin-primary hover:text-admin-primary"
                      >
                        <Copy className="h-3.5 w-3.5" aria-hidden />
                        {t("cloud.copy")}
                      </button>
                      <a
                        href={release.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-admin-primary/25 transition hover:bg-admin-accent"
                      >
                        {t("cloud.open")}
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-admin-border/80 bg-admin-bg/30 px-6 py-14 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-admin-border/60 bg-admin-panel/80 text-admin-text-dim">
                  <Package className="h-7 w-7" aria-hidden />
                </div>
                <p className="max-w-sm text-sm font-medium text-admin-text">
                  {t("cloud.noApkTitle")}
                </p>
                <p className="mt-2 max-w-md text-xs leading-relaxed text-admin-text-dim">
                  {t("cloud.noApkDesc")}
                </p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Publish */}
        <GlassCard className="border-admin-border/50 lg:col-span-5" glow>
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-admin-text-dim">
                {t("cloud.publish")}
              </p>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-admin-text">
                {t("cloud.newBuild")}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-admin-text-dim">
                {t("cloud.publishDesc")}
              </p>
            </div>

            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">
                {t("cloud.versionLabel")} <span className="font-normal text-admin-text-muted">{t("cloud.optional")}</span>
              </span>
              <input
                id="apk-version"
                value={versionLabel}
                onChange={(e) => setVersionLabel(e.target.value)}
                placeholder={t("cloud.versionPlaceholder")}
                maxLength={64}
                className="w-full rounded-xl border border-admin-border bg-admin-bg/80 px-4 py-3 text-sm text-admin-text outline-none transition focus:border-admin-primary focus:ring-1 focus:ring-admin-primary/40"
              />
            </label>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">
                {t("cloud.apkPackage")}
              </span>
              <label
                htmlFor="apk-file"
                className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-admin-border/70 bg-admin-bg/40 px-6 py-10 transition hover:border-admin-primary/50 hover:bg-admin-primary/5"
              >
                <input
                  ref={fileInputRef}
                  id="apk-file"
                  type="file"
                  accept=".apk,application/vnd.android.package-archive"
                  disabled={uploading}
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setSelectedFileName(f?.name ?? null);
                  }}
                />
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-admin-border/80 bg-admin-panel text-admin-primary transition group-hover:border-admin-primary/40 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                  <Upload className="h-6 w-6" aria-hidden />
                </div>
                <p className="text-center text-sm font-semibold text-admin-text">
                  {selectedFileName ? selectedFileName : t("cloud.dropOrClick")}
                </p>
                <p className="mt-1 text-center text-[11px] text-admin-text-dim">
                  {t("cloud.maxSize")}
                </p>
              </label>
            </div>

            <div className="flex flex-col gap-3 pt-1">
              <ButtonComponent
                type="button"
                variant="oracle"
                isLoading={uploading}
                onClick={handleUpload}
                className="w-full"
              >
                {t("cloud.uploadPublish")}
              </ButtonComponent>
              {release ? (
                <button
                  type="button"
                  onClick={() => setClearOpen(true)}
                  disabled={uploading || deleting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-admin-error/40 bg-admin-error/10 py-3.5 text-[10px] font-bold uppercase tracking-widest text-admin-error transition hover:bg-admin-error/20 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  {t("cloud.removeFromCloud")}
                </button>
              ) : null}
            </div>

            <div className="flex gap-3 rounded-xl border border-admin-border/50 bg-admin-bg/40 px-4 py-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-admin-success" aria-hidden />
              <p className="text-[11px] leading-relaxed text-admin-text-dim">
                {t("cloud.storeNote")}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      <ConfirmDialog
        open={clearOpen}
        title={t("cloud.removeTitle")}
        message={t("cloud.removeMessage")}
        confirmLabel={deleting ? t("cloud.removing") : t("cloud.remove")}
        variant="danger"
        onCancel={() => setClearOpen(false)}
        onConfirm={handleDelete}
      />
    </AdminPageShell>
  );
}
