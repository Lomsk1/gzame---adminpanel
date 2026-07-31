import axios from "axios";
import { format } from "date-fns";
import { History, RotateCcw, Save, Trash2, Wand2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLoaderData, useRevalidator } from "react-router";
import { toast } from "sonner";
import { GlassCard } from "../../../components/cards/card-glass";
import { ButtonComponent } from "../../../components/form/button";
import { AdminPageHeader, AdminPageShell } from "../../../components/admin";
import { ConfirmDialog } from "../../../components/ui/confirm-dialog";
import axiosAuth from "../../../helper/axios";
import {
  DEVI_PROMPT_KEY_ORDER,
  type DeviPromptHistoryItem,
  type DeviPromptKey,
  type DeviPromptPayload,
  type DeviPromptSlotMeta,
} from "../../../features/devi-prompt/devi-prompt.loaders";
import { useAdminT } from "../../../store/locale/locale";

const TAB_LABEL_KEYS: Record<DeviPromptKey, string> = {
  core: "deviPrompt.tab.core",
  language: "deviPrompt.tab.language",
  specialist: "deviPrompt.tab.specialist",
  action: "deviPrompt.tab.action",
  mode_router: "deviPrompt.tab.modeRouter",
  memory_extract: "deviPrompt.tab.memoryExtract",
};

export default function DeviPromptPage() {
  const { t } = useAdminT();
  const { slots, byKey } = useLoaderData() as {
    slots: DeviPromptSlotMeta[];
    byKey: Partial<Record<DeviPromptKey, DeviPromptPayload>>;
  };
  const revalidator = useRevalidator();

  const [activeKey, setActiveKey] = useState<DeviPromptKey>("core");
  const prompt = byKey[activeKey];

  const [text, setText] = useState(prompt?.text ?? "");
  const [note, setNote] = useState(prompt?.note ?? "");
  const [history, setHistory] = useState<DeviPromptHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const slotMeta = useMemo(
    () => slots.find((s) => s.key === activeKey) ?? null,
    [slots, activeKey],
  );

  useEffect(() => {
    setText(prompt?.text ?? "");
    setNote(prompt?.note ?? "");
  }, [prompt]);

  const loadHistory = useCallback(async (key: DeviPromptKey) => {
    setHistoryLoading(true);
    try {
      const res = await axiosAuth.get<{ data?: DeviPromptHistoryItem[] }>(
        `/api/v1/devi-prompt/${key}/history?limit=50`,
      );
      const rows = res.data?.data ?? [];
      setHistory(rows);
      setSelectedId(rows[0]?.id ?? null);
    } catch {
      setHistory([]);
      setSelectedId(null);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory(activeKey);
  }, [activeKey, loadHistory]);

  const selected = history.find((h) => h.id === selectedId) ?? null;
  const dirty =
    text.trim() !== (prompt?.text ?? "").trim() ||
    note.trim() !== (prompt?.note ?? "").trim();

  const handleSave = async () => {
    if (!text.trim()) {
      toast.error(t("deviPrompt.emptyText"));
      return;
    }
    setSaving(true);
    const toastId = toast.loading(t("deviPrompt.saving"));
    try {
      await axiosAuth.patch(`/api/v1/devi-prompt/${activeKey}`, {
        text,
        note: note.trim(),
      });
      toast.success(t("deviPrompt.saved"), {
        id: toastId,
        description: t("deviPrompt.savedDesc"),
      });
      await revalidator.revalidate();
      await loadHistory(activeKey);
    } catch (err: unknown) {
      const description =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String((err.response.data as { message?: string }).message)
          : t("deviPrompt.saveFailed");
      toast.error(t("deviPrompt.saveFailed"), { id: toastId, description });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOne = async () => {
    if (!deleteId) return;
    setBusy(true);
    const toastId = toast.loading(t("deviPrompt.deleting"));
    try {
      await axiosAuth.delete(`/api/v1/devi-prompt/${activeKey}/history/${deleteId}`);
      toast.success(t("deviPrompt.deleted"), { id: toastId });
      if (selectedId === deleteId) setSelectedId(null);
      setDeleteId(null);
      await loadHistory(activeKey);
    } catch {
      toast.error(t("deviPrompt.deleteFailed"), { id: toastId });
    } finally {
      setBusy(false);
    }
  };

  const handleClearAll = async () => {
    setBusy(true);
    const toastId = toast.loading(t("deviPrompt.clearing"));
    try {
      await axiosAuth.delete(`/api/v1/devi-prompt/${activeKey}/history`);
      toast.success(t("deviPrompt.cleared"), { id: toastId });
      setClearOpen(false);
      setSelectedId(null);
      await loadHistory(activeKey);
    } catch {
      toast.error(t("deviPrompt.clearFailed"), { id: toastId });
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreId) return;
    setBusy(true);
    const toastId = toast.loading(t("deviPrompt.restoring"));
    try {
      await axiosAuth.post(`/api/v1/devi-prompt/${activeKey}/history/${restoreId}/restore`);
      toast.success(t("deviPrompt.restored"), { id: toastId });
      setRestoreId(null);
      await revalidator.revalidate();
      await loadHistory(activeKey);
    } catch (err: unknown) {
      const description =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String((err.response.data as { message?: string }).message)
          : t("deviPrompt.restoreFailed");
      toast.error(t("deviPrompt.restoreFailed"), { id: toastId, description });
    } finally {
      setBusy(false);
    }
  };

  const sourceLabel = (source: DeviPromptHistoryItem["source"]) => {
    if (source === "seed") return t("deviPrompt.sourceSeed");
    if (source === "restore") return t("deviPrompt.sourceRestore");
    return t("deviPrompt.sourceSave");
  };

  return (
    <AdminPageShell maxWidthClass="max-w-[1600px]" className="space-y-6">
      <AdminPageHeader
        title={t("pages.deviPrompt.title")}
        icon={<Wand2 className="h-5 w-5 text-admin-primary" />}
        actions={
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-admin-border/80 bg-admin-panel/80 px-4 py-2.5">
            <History className="h-4 w-4 text-admin-accent" aria-hidden />
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">
                {t("deviPrompt.slots")}
              </p>
              <p className="font-mono text-xs text-admin-text">{DEVI_PROMPT_KEY_ORDER.length}</p>
            </div>
          </div>
        }
      />

      <p className="text-sm text-admin-text-dim -mt-2 max-w-3xl">{t("deviPrompt.pageDesc")}</p>

      <div className="flex flex-wrap gap-2 rounded-xl border border-admin-border/70 bg-admin-panel/40 p-2">
        {DEVI_PROMPT_KEY_ORDER.map((key) => {
          const active = key === activeKey;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveKey(key)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                active
                  ? "bg-admin-primary text-admin-bg"
                  : "text-admin-text-dim hover:bg-admin-bg/60 hover:text-admin-text"
              }`}
            >
              {t(TAB_LABEL_KEYS[key] as Parameters<typeof t>[0])}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
        <GlassCard className="xl:col-span-7" contentClassName="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-admin-text">
              {slotMeta?.label ?? t(TAB_LABEL_KEYS[activeKey] as Parameters<typeof t>[0])}
            </h2>
            <p className="mt-1 text-sm text-admin-text-dim">
              {slotMeta?.description ?? t("deviPrompt.editorDesc")}
            </p>
            {slotMeta?.usedIn ? (
              <p className="mt-2 font-mono text-[11px] text-admin-primary/80">
                {t("deviPrompt.usedIn")}: {slotMeta.usedIn}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="devi-note"
              className="block text-[11px] font-bold uppercase tracking-wider text-admin-text-dim"
            >
              {t("deviPrompt.note")}{" "}
              <span className="font-normal normal-case tracking-normal text-admin-text-muted">
                {t("deviPrompt.optional")}
              </span>
            </label>
            <input
              id="devi-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              placeholder={t("deviPrompt.notePlaceholder")}
              className="mt-1.5 w-full rounded-xl border border-admin-border/80 bg-admin-bg/60 px-3 py-2.5 text-sm text-admin-text outline-none transition focus:border-admin-primary/60 focus:ring-2 focus:ring-admin-primary/20"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label
                htmlFor="devi-text"
                className="text-[11px] font-bold uppercase tracking-wider text-admin-text-dim"
              >
                {t("deviPrompt.corePrompt")}
              </label>
              <span className="font-mono text-[11px] text-admin-text-dim">
                {text.length.toLocaleString()} {t("deviPrompt.chars")}
              </span>
            </div>
            <textarea
              id="devi-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
              className="min-h-[380px] w-full resize-y rounded-xl border border-admin-border/80 bg-admin-bg/60 px-4 py-4 font-mono text-sm leading-relaxed text-admin-text outline-none transition focus:border-admin-primary/60 focus:ring-2 focus:ring-admin-primary/20"
              placeholder={t("deviPrompt.placeholder")}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-admin-border/50 pt-4">
            <p className="text-xs text-admin-text-dim">
              {prompt?.updatedAt
                ? t("deviPrompt.lastUpdated", {
                    date: format(new Date(prompt.updatedAt), "dd MMM yyyy · HH:mm"),
                  })
                : t("deviPrompt.neverSaved")}
              {dirty ? ` · ${t("deviPrompt.unsaved")}` : ""}
            </p>
            <div className="w-full sm:w-auto sm:min-w-[180px]">
              <ButtonComponent
                type="button"
                onClick={handleSave}
                disabled={saving || !dirty}
                isLoading={saving}
              >
                <Save className="h-4 w-4" aria-hidden />
                {t("deviPrompt.save")}
              </ButtonComponent>
            </div>
          </div>
        </GlassCard>

        <div className="xl:col-span-5 space-y-4">
          <GlassCard contentClassName="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-admin-text">{t("deviPrompt.historyTitle")}</h2>
                <p className="mt-1 text-sm text-admin-text-dim">{t("deviPrompt.historyDesc")}</p>
              </div>
              <button
                type="button"
                disabled={history.length === 0 || busy}
                onClick={() => setClearOpen(true)}
                className="rounded-lg border border-admin-error/30 bg-admin-error/10 px-3 py-1.5 text-xs font-semibold text-admin-error hover:bg-admin-error/20 disabled:opacity-40"
              >
                {t("deviPrompt.clearAll")}
              </button>
            </div>

            {historyLoading ? (
              <div className="h-40 animate-pulse rounded-xl bg-admin-bg/50" />
            ) : history.length === 0 ? (
              <p className="rounded-xl border border-dashed border-admin-border/70 bg-admin-bg/30 px-4 py-8 text-center text-sm text-admin-text-dim">
                {t("deviPrompt.historyEmpty")}
              </p>
            ) : (
              <ul className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
                {history.map((item) => {
                  const active = item.id === selectedId;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                          active
                            ? "border-admin-primary/50 bg-admin-primary/10"
                            : "border-admin-border/60 bg-admin-bg/40 hover:border-admin-primary/30"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-admin-text-dim">
                            {sourceLabel(item.source)}
                          </span>
                          <span className="font-mono text-[10px] text-admin-text-dim">
                            {format(new Date(item.createdAt), "dd MMM · HH:mm")}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-admin-text-dim">{item.preview}</p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </GlassCard>

          {selected ? (
            <GlassCard contentClassName="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-admin-text">{t("deviPrompt.snapshotTitle")}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-admin-text-dim">
                  {sourceLabel(selected.source)}
                </span>
              </div>
              {selected.note ? (
                <p className="text-xs text-admin-text-dim">{selected.note}</p>
              ) : null}
              <pre className="max-h-52 overflow-auto rounded-xl border border-admin-border/60 bg-admin-bg/50 p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-admin-text-dim">
                {selected.text}
              </pre>
              <div className="grid grid-cols-2 gap-2">
                <ButtonComponent
                  type="button"
                  variant="secondary"
                  onClick={() => setRestoreId(selected.id)}
                  disabled={busy}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  {t("deviPrompt.restore")}
                </ButtonComponent>
                <ButtonComponent
                  type="button"
                  variant="danger"
                  onClick={() => setDeleteId(selected.id)}
                  disabled={busy}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  {t("deviPrompt.delete")}
                </ButtonComponent>
              </div>
            </GlassCard>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title={t("deviPrompt.deleteTitle")}
        message={t("deviPrompt.deleteMessage")}
        variant="danger"
        loading={busy}
        confirmLabel={t("deviPrompt.delete")}
        onConfirm={handleDeleteOne}
        onCancel={() => setDeleteId(null)}
      />
      <ConfirmDialog
        open={clearOpen}
        title={t("deviPrompt.clearTitle")}
        message={t("deviPrompt.clearMessage")}
        variant="danger"
        loading={busy}
        confirmLabel={t("deviPrompt.clearAll")}
        onConfirm={handleClearAll}
        onCancel={() => setClearOpen(false)}
      />
      <ConfirmDialog
        open={Boolean(restoreId)}
        title={t("deviPrompt.restoreTitle")}
        message={t("deviPrompt.restoreMessage")}
        variant="primary"
        loading={busy}
        confirmLabel={t("deviPrompt.restore")}
        onConfirm={handleRestore}
        onCancel={() => setRestoreId(null)}
      />
    </AdminPageShell>
  );
}
