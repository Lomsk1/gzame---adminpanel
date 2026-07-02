import { useState } from "react";
import { AdminDrawerShell } from "./admin-drawer-shell";
import { AdminInput } from "../ui/input-form";
import { FormSection } from "../specialists";
import type { SpecialistCategory } from "../../types/specialist/specialist";

interface Props {
  category: SpecialistCategory | null;
  onClose: () => void;
  onSave: (data: { title: { en: string; ka: string; ru?: string; ja?: string } }) => void;
  isSubmitting?: boolean;
}

const inputLabelClass = "text-[11px] font-black text-admin-text-dim uppercase tracking-widest block mb-1.5";
const inputFieldClass =
  "w-full rounded-xl border border-admin-border bg-admin-panel/40 p-3 text-sm text-admin-text outline-none transition-colors focus:border-admin-primary no-spinner";

export const CategoryEditorDrawer = ({ category, onClose, onSave, isSubmitting }: Props) => {
  const [titleEn, setTitleEn] = useState(category?.title?.en ?? "");
  const [titleKa, setTitleKa] = useState(category?.title?.ka ?? "");
  const [titleRu, setTitleRu] = useState(category?.title?.ru ?? "");
  const [titleJa, setTitleJa] = useState(category?.title?.ja ?? "");

  const handleSave = () => {
    onSave({
      title: {
        en: titleEn.trim(),
        ka: titleKa.trim(),
        ...(titleRu.trim() && { ru: titleRu.trim() }),
        ...(titleJa.trim() && { ja: titleJa.trim() }),
      },
    });
  };

  const footer = (
    <button
      type="button"
      disabled={isSubmitting || !titleEn.trim() || !titleKa.trim()}
      onClick={handleSave}
      className="w-full rounded-xl bg-admin-primary py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isSubmitting ? "Saving…" : "Save category"}
    </button>
  );

  return (
    <AdminDrawerShell
      isOpen
      title={category ? "Edit category" : "New category"}
      subtitle="Multilingual specialist grouping"
      onClose={onClose}
      isSubmitting={isSubmitting}
      footer={footer}
      panelClassName="max-w-lg"
    >
      <FormSection
        title="Localized titles"
        description="English and Georgian are required. Russian and Japanese are optional."
        icon="🏷"
      >
        <AdminInput
          label="Title (EN) *"
          value={titleEn}
          onChange={(v) => setTitleEn(String(v ?? ""))}
          placeholder="e.g. Coach"
          labelClassName={inputLabelClass}
          inputClassName={inputFieldClass}
        />
        <AdminInput
          label="Title (KA) *"
          value={titleKa}
          onChange={(v) => setTitleKa(String(v ?? ""))}
          placeholder="e.g. მწვრთნელი"
          labelClassName={inputLabelClass}
          inputClassName={inputFieldClass}
        />
        <AdminInput
          label="Title (RU)"
          value={titleRu}
          onChange={(v) => setTitleRu(String(v ?? ""))}
          placeholder="e.g. Коуч"
          labelClassName={inputLabelClass}
          inputClassName={inputFieldClass}
        />
        <AdminInput
          label="Title (JA)"
          value={titleJa}
          onChange={(v) => setTitleJa(String(v ?? ""))}
          placeholder="e.g. コーチ"
          labelClassName={inputLabelClass}
          inputClassName={inputFieldClass}
        />
      </FormSection>
    </AdminDrawerShell>
  );
};
