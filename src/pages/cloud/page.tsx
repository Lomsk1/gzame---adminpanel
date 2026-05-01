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

export default function CloudPage() {
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
      toast.error("Choose an .apk file first.");
      return;
    }
    setUploading(true);
    const toastId = toast.loading("Uploading to Cloudinary…");
    try {
      const fd = new FormData();
      fd.append("apk", file);
      if (versionLabel.trim()) {
        fd.append("versionLabel", versionLabel.trim());
      }
      await axiosMultipartAuth.post("/api/v1/android-apk/upload", fd);
      toast.success("APK published", {
        id: toastId,
        description: "Landing page will show the new direct download.",
      });
      setVersionLabel("");
      setSelectedFileName(null);
      if (input) input.value = "";
      await revalidator.revalidate();
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String((err.response.data as { message?: string }).message)
          : "Upload failed.";
      toast.error("Upload failed", { id: toastId, description: message });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const toastId = toast.loading("Removing release…");
    try {
      await axiosAuth.delete("/api/v1/android-apk");
      toast.success("Direct APK removed", { id: toastId });
      setClearOpen(false);
      await revalidator.revalidate();
    } catch {
      toast.error("Could not remove release", { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  const copyUrl = async () => {
    if (!release?.downloadUrl) return;
    try {
      await navigator.clipboard.writeText(release.downloadUrl);
      toast.success("URL copied to clipboard");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-admin-border/60 bg-admin-card/40">
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-admin-primary/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-admin-accent/15 blur-3xl"
          aria-hidden
        />
        <div className="relative z-10 flex flex-col gap-4 px-6 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-admin-primary/30 bg-admin-primary/10 px-3 py-1">
              <Cloud className="h-3.5 w-3.5 text-admin-primary" aria-hidden />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-admin-primary">
                Cloudinary · Landing
              </span>
            </div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-admin-text sm:text-4xl">
              Cloud
            </h1>
            <p className="text-sm leading-relaxed text-admin-text-dim">
              Host the Android APK on Cloudinary. The public site pulls the signed URL automatically —
              no redeploy needed when you publish a new build.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-admin-border/80 bg-admin-panel/80 px-4 py-3 backdrop-blur-sm">
            <Package className="h-5 w-5 text-admin-accent" aria-hidden />
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">
                Endpoint
              </p>
              <p className="font-mono text-xs text-admin-text">GET /api/v1/android-apk</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        {/* Live release */}
        <GlassCard
          glow={!!release}
          className={`border-admin-border/50 lg:col-span-7 ${release ? "shadow-[0_0_50px_-12px_rgba(16,185,129,0.35)]" : ""}`}
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-admin-text-dim">
                  Live release
                </p>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-admin-text">
                  Android direct download
                </h2>
              </div>
              {release ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-admin-success/40 bg-admin-success/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-admin-success">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-admin-success opacity-40" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-admin-success" />
                  </span>
                  Live
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-admin-warning/40 bg-admin-warning/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-admin-warning">
                  <Radio className="h-3.5 w-3.5" aria-hidden />
                  Not published
                </span>
              )}
            </div>

            {release ? (
              <div className="space-y-5">
                <dl className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-admin-border/60 bg-admin-bg/50 p-4">
                    <dt className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">
                      Version
                    </dt>
                    <dd className="mt-2 font-mono text-sm font-semibold text-admin-text">
                      {release.versionLabel?.trim() || "—"}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-admin-border/60 bg-admin-bg/50 p-4 sm:col-span-2">
                    <dt className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">
                      Package file
                    </dt>
                    <dd className="mt-2 truncate font-mono text-sm text-admin-text" title={release.fileName}>
                      {release.fileName || "—"}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-admin-border/60 bg-admin-bg/50 p-4 sm:col-span-3">
                    <dt className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">
                      Last updated
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
                    Hosted URL
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
                        Copy
                      </button>
                      <a
                        href={release.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-admin-primary/25 transition hover:bg-admin-accent"
                      >
                        Open
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
                  No APK on the edge yet
                </p>
                <p className="mt-2 max-w-md text-xs leading-relaxed text-admin-text-dim">
                  Upload a build on the right → your landing page will show the emerald “Direct APK” card and footer link automatically.
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
                Publish
              </p>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-admin-text">
                New build
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-admin-text-dim">
                Upload replaces the previous file on Cloudinary and updates the public URL in one step.
              </p>
            </div>

            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">
                Version label <span className="font-normal text-admin-text-muted">(optional)</span>
              </span>
              <input
                id="apk-version"
                value={versionLabel}
                onChange={(e) => setVersionLabel(e.target.value)}
                placeholder="e.g. 1.4.2"
                maxLength={64}
                className="w-full rounded-xl border border-admin-border bg-admin-bg/80 px-4 py-3 text-sm text-admin-text outline-none transition focus:border-admin-primary focus:ring-1 focus:ring-admin-primary/40"
              />
            </label>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">
                APK package
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
                  {selectedFileName ? selectedFileName : "Drop or click to select .apk"}
                </p>
                <p className="mt-1 text-center text-[11px] text-admin-text-dim">
                  Max 200 MB · raw storage on Cloudinary
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
                Upload & publish
              </ButtonComponent>
              {release ? (
                <button
                  type="button"
                  onClick={() => setClearOpen(true)}
                  disabled={uploading || deleting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-admin-error/40 bg-admin-error/10 py-3.5 text-[10px] font-bold uppercase tracking-widest text-admin-error transition hover:bg-admin-error/20 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Remove from cloud
                </button>
              ) : null}
            </div>

            <div className="flex gap-3 rounded-xl border border-admin-border/50 bg-admin-bg/40 px-4 py-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-admin-success" aria-hidden />
              <p className="text-[11px] leading-relaxed text-admin-text-dim">
                Store listings (Play / App Store) are unchanged. Only the optional sideload link on the marketing site is affected.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      <ConfirmDialog
        open={clearOpen}
        title="Remove Android APK?"
        message="This deletes the file from Cloudinary and hides the direct download on the landing page. Store listings are unaffected."
        confirmLabel={deleting ? "Removing…" : "Remove"}
        variant="danger"
        onCancel={() => setClearOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
