import { useEffect, useState } from "react";
import { AdminDrawerShell } from "./admin-drawer-shell";
import { AdminInput } from "../ui/input-form";
import { ButtonComponent } from "../form/button";
import {
  WIKI_CATEGORIES,
  WIKI_CATEGORY_META,
  slugifyTitle,
} from "../../features/wiki/wiki.constants";
import type { WikiEntry, WikiCategory } from "../../types/wiki/wiki";

export type WikiFormData = {
  title: string;
  slug: string;
  category: WikiCategory;
  body: string;
  tags: string[];
  is_active: boolean;
};

interface Props {
  entry: WikiEntry | null;
  onClose: () => void;
  onSave: (data: WikiFormData) => void;
  isSubmitting?: boolean;
}

export function WikiEditorDrawer({ entry, onClose, onSave, isSubmitting }: Props) {
  const [title, setTitle] = useState(entry?.title ?? "");
  const [slug, setSlug] = useState(entry?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!entry?.slug);
  const [category, setCategory] = useState<WikiCategory>(entry?.category ?? "general");
  const [body, setBody] = useState(entry?.body ?? "");
  const [tagsText, setTagsText] = useState((entry?.tags ?? []).join(", "));
  const [isActive, setIsActive] = useState(entry?.is_active !== false);

  useEffect(() => {
    if (!slugTouched && title.trim()) {
      setSlug(slugifyTitle(title));
    }
  }, [title, slugTouched]);

  const handleSave = () => {
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSave({
      title: title.trim(),
      slug: slug.trim() || slugifyTitle(title),
      category,
      body: body.trim(),
      tags,
      is_active: isActive,
    });
  };

  const canSave = title.trim().length > 0 && body.trim().length > 0;

  return (
    <AdminDrawerShell
      isOpen
      onClose={onClose}
      title={entry ? "Edit_Wiki_Entry" : "New_Wiki_Entry"}
      subtitle={WIKI_CATEGORY_META[category].description}
      isSubmitting={isSubmitting}
      footer={
        <ButtonComponent
          variant="oracle"
          className="w-full"
          onClick={handleSave}
          isLoading={isSubmitting}
          disabled={!canSave}
        >
          {entry ? "Update & Re-embed" : "Create & Embed"}
        </ButtonComponent>
      }
    >
      <AdminInput label="Title" value={title} onChange={(v) => setTitle(String(v ?? ""))} placeholder="e.g. WARRIOR psychotype — core patterns" />

      <AdminInput
        label="Slug (URL id)"
        value={slug}
        onChange={(v) => {
          setSlugTouched(true);
          setSlug(String(v ?? ""));
        }}
        placeholder="warrior-psychotype-core"
      />

      <div className="space-y-1">
        <label className="text-[10px] font-black text-admin-text-dim uppercase tracking-widest block">
          Category
        </label>
        <select
          className="w-full bg-admin-panel/40 border border-admin-border p-2 text-sm text-admin-text outline-none focus:border-admin-primary"
          value={category}
          onChange={(e) => setCategory(e.target.value as WikiCategory)}
        >
          {WIKI_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {WIKI_CATEGORY_META[c].label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-admin-primary uppercase tracking-widest block">
          Body (markdown)
        </label>
        <textarea
          className="w-full min-h-48 bg-admin-bg/30 border border-admin-border rounded-xl p-4 text-sm text-admin-text font-mono leading-relaxed focus:outline-none focus:border-admin-primary/50 resize-y custom-scrollbar"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write structured knowledge DEVI can retrieve via RAG..."
        />
        <p className="text-[10px] text-admin-text-dim">{body.length} characters</p>
      </div>

      <AdminInput
        label="Tags (comma-separated)"
        value={tagsText}
        onChange={(v) => setTagsText(String(v ?? ""))}
        placeholder="anxiety, motivation, streak"
      />

      <label className="flex items-center gap-3 p-4 rounded-xl border border-admin-border bg-admin-panel/30 cursor-pointer">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 accent-admin-primary"
        />
        <div>
          <p className="text-sm font-bold text-admin-text">Active in RAG</p>
          <p className="text-[10px] text-admin-text-dim">Inactive entries are hidden from DEVI retrieval</p>
        </div>
      </label>
    </AdminDrawerShell>
  );
}
