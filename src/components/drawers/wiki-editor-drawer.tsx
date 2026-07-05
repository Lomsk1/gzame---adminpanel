import { useEffect, useState } from "react";
import { AdminDrawerShell } from "./admin-drawer-shell";
import { AdminInput } from "../ui/input-form";
import { ButtonComponent } from "../form/button";
import { WIKI_CATEGORIES, slugifyTitle } from "../../features/wiki/wiki.constants";
import { wikiCategoryDesc, wikiCategoryLabel } from "../../i18n/domain-labels";
import type { WikiEntry, WikiCategory } from "../../types/wiki/wiki";
import { useAdminT } from "../../store/locale/locale";

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
  const { t } = useAdminT();
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
      .map((tag) => tag.trim())
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
      title={entry ? t("wiki.editor.edit") : t("wiki.editor.new")}
      subtitle={wikiCategoryDesc(t, category)}
      isSubmitting={isSubmitting}
      footer={
        <ButtonComponent
          variant="oracle"
          className="w-full"
          onClick={handleSave}
          isLoading={isSubmitting}
          disabled={!canSave}
        >
          {entry ? t("wiki.editor.updateEmbed") : t("wiki.editor.createEmbed")}
        </ButtonComponent>
      }
    >
      <AdminInput
        label={t("wiki.editor.title")}
        value={title}
        onChange={(v) => setTitle(String(v ?? ""))}
        placeholder={t("wiki.editor.titlePh")}
      />

      <AdminInput
        label={t("wiki.editor.slug")}
        value={slug}
        onChange={(v) => {
          setSlugTouched(true);
          setSlug(String(v ?? ""));
        }}
        placeholder={t("wiki.editor.slugPh")}
      />

      <div className="space-y-1">
        <label className="text-[10px] font-black text-admin-text-dim uppercase tracking-widest block">
          {t("wiki.editor.category")}
        </label>
        <select
          className="w-full bg-admin-panel/40 border border-admin-border p-2 text-sm text-admin-text outline-none focus:border-admin-primary"
          value={category}
          onChange={(e) => setCategory(e.target.value as WikiCategory)}
        >
          {WIKI_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {wikiCategoryLabel(t, c)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-admin-primary uppercase tracking-widest block">
          {t("wiki.editor.body")}
        </label>
        <textarea
          className="w-full min-h-48 bg-admin-bg/30 border border-admin-border rounded-xl p-4 text-sm text-admin-text font-mono leading-relaxed focus:outline-none focus:border-admin-primary/50 resize-y custom-scrollbar"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t("wiki.editor.bodyPh")}
        />
        <p className="text-[10px] text-admin-text-dim">{t("wiki.editor.chars", { count: body.length })}</p>
      </div>

      <AdminInput
        label={t("wiki.editor.tags")}
        value={tagsText}
        onChange={(v) => setTagsText(String(v ?? ""))}
        placeholder={t("wiki.editor.tagsPh")}
      />

      <label className="flex items-center gap-3 p-4 rounded-xl border border-admin-border bg-admin-panel/30 cursor-pointer">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 accent-admin-primary"
        />
        <div>
          <p className="text-sm font-bold text-admin-text">{t("wiki.editor.activeRag")}</p>
          <p className="text-[10px] text-admin-text-dim">{t("wiki.editor.inactiveHint")}</p>
        </div>
      </label>
    </AdminDrawerShell>
  );
}
