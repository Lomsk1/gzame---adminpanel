import { useRef } from "react";
import { DEFAULT_AVATAR } from "./constants";

interface Props {
  previewUrl: string | null;
  onFileChange: (file: File) => void;
  onClear: () => void;
}

export function AvatarUploadField({ previewUrl, onFileChange, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="relative shrink-0">
        <div className="h-28 w-28 overflow-hidden rounded-2xl border-2 border-admin-primary/30 bg-admin-bg shadow-[0_0_30px_rgba(59,130,246,0.12)]">
          <img
            src={previewUrl || DEFAULT_AVATAR}
            alt="Avatar preview"
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_AVATAR;
            }}
          />
        </div>
        <span className="absolute -bottom-2 -right-2 rounded-full border border-admin-border bg-admin-panel px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-admin-text-dim">
          Photo
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 sm:pt-2">
        <p className="text-sm font-semibold text-admin-text">Profile image</p>
        <p className="text-xs leading-relaxed text-admin-text-dim">
          Square photos work best. Shown on specialist cards in the mobile app.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file?.type.startsWith("image/")) onFileChange(file);
          }}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-xl border border-admin-primary/40 bg-admin-primary/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-admin-primary transition-colors hover:bg-admin-primary/20"
          >
            Upload image
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-admin-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-admin-text-dim transition-colors hover:border-admin-error/40 hover:text-admin-error"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
