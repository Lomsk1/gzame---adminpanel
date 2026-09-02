import { useEffect, useRef, useState, type DragEvent } from "react";
import { CloudUpload, ImageIcon, Link2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useAdminT } from "../../store/locale/locale";

type Props = {
  previewUrl: string;
  urlValue: string;
  hasPendingFile: boolean;
  onFileSelect: (file: File) => void;
  onUrlChange: (url: string) => void;
  onClear: () => void;
  disabled?: boolean;
};

function validateImageFile(
  file: File,
  invalidTypeMsg: string,
  tooLargeMsg: string,
): boolean {
  if (!file.type.startsWith("image/")) {
    toast.error(invalidTypeMsg);
    return false;
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.error(tooLargeMsg);
    return false;
  }
  return true;
}

export function BlogCoverUploadField({
  previewUrl,
  urlValue,
  hasPendingFile,
  onFileSelect,
  onUrlChange,
  onClear,
  disabled,
}: Props) {
  const { t } = useAdminT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(Boolean(urlValue && !hasPendingFile));

  useEffect(() => {
    if (urlValue && !hasPendingFile) setShowUrlInput(true);
  }, [urlValue, hasPendingFile]);

  const pickFile = (file: File) => {
    if (
      !validateImageFile(
        file,
        t("blog.cover.invalidType"),
        t("blog.cover.tooLarge"),
      )
    ) {
      return;
    }
    onFileSelect(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) pickFile(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-[10px] font-black text-admin-text-dim uppercase tracking-widest">
          {t("blog.editor.coverImage")}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput((v) => !v)}
          className="inline-flex items-center gap-1 text-[10px] font-semibold text-admin-text-dim hover:text-admin-primary transition-colors"
        >
          <Link2 className="w-3 h-3" />
          {showUrlInput ? t("blog.cover.hideUrl") : t("blog.cover.pasteUrl")}
        </button>
      </div>

      {previewUrl ? (
        <div className="relative rounded-2xl overflow-hidden border border-admin-border aspect-[21/9] max-h-44 group">
          <img src={previewUrl} alt="" className="w-full h-full object-cover" />
          {hasPendingFile && (
            <span className="absolute top-2 left-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-admin-warning/90 text-admin-bg">
              {t("blog.cover.pendingUpload")}
            </span>
          )}
          <div className="absolute inset-0 bg-admin-bg/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-admin-primary/20 border border-admin-primary/40 text-xs font-semibold text-admin-primary hover:bg-admin-primary/30 transition-colors"
            >
              {t("blog.cover.replace")}
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={onClear}
              className="p-1.5 rounded-lg bg-admin-error/20 border border-admin-error/40 text-admin-error hover:bg-admin-error/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed aspect-[21/9] max-h-44 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            dragOver
              ? "border-admin-primary bg-admin-primary/10"
              : "border-admin-border bg-admin-bg/20 hover:border-admin-primary/40 hover:bg-admin-primary/5"
          } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        >
          <div className="w-12 h-12 rounded-xl bg-admin-primary/10 border border-admin-primary/20 flex items-center justify-center">
            <CloudUpload className="w-6 h-6 text-admin-primary" />
          </div>
          <p className="text-sm font-semibold text-admin-text">{t("blog.cover.dropTitle")}</p>
          <p className="text-[11px] text-admin-text-dim text-center px-4">
            {t("blog.cover.dropHint")}
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) pickFile(file);
        }}
      />

      {showUrlInput && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-dim pointer-events-none" />
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-admin-panel/40 border border-admin-border rounded-xl text-sm text-admin-text outline-none focus:border-admin-primary font-mono"
              placeholder="https://..."
              value={urlValue}
              onChange={(e) => onUrlChange(e.target.value)}
              disabled={disabled}
            />
          </div>
          {urlValue && (
            <button
              type="button"
              onClick={onClear}
              className="p-2.5 rounded-xl border border-admin-border text-admin-text-dim hover:text-admin-error hover:border-admin-error/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <p className="text-[10px] text-admin-text-muted flex items-center gap-1.5">
        <CloudUpload className="w-3 h-3" />
        {t("blog.cover.cloudinaryNote")}
      </p>
    </div>
  );
}
