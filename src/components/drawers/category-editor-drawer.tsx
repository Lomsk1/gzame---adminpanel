import { useState } from "react";
import { AdminDrawerShell } from "./admin-drawer-shell";
import { AdminInput } from "../ui/input-form";
import type { SpecialistCategory } from "../../types/specialist/specialist";

interface Props {
  category: SpecialistCategory | null;
  onClose: () => void;
  onSave: (data: { title: { en: string; ka: string; ru?: string; ja?: string } }) => void;
  isSubmitting?: boolean;
}

export const CategoryEditorDrawer = ({ category, onClose, onSave, isSubmitting }: Props) => {
  const [titleEn, setTitleEn] = useState(category?.title?.en ?? "");
  const [titleKa, setTitleKa] = useState(category?.title?.ka ?? "");
  const [titleRu, setTitleRu] = useState(category?.title?.ru ?? "");

  const handleSave = () => {
    onSave({
      title: {
        en: titleEn.trim(),
        ka: titleKa.trim(),
        ...(titleRu.trim() && { ru: titleRu.trim() }),
      },
    });
  };

  const footer = (
    <button
      type="button"
      disabled={isSubmitting}
      onClick={handleSave}
      className="w-full py-4 bg-admin-primary font-black uppercase tracking-widest text-sm text-admin-bg hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
    >
      {isSubmitting ? "Saving..." : "Save category"}
    </button>
  );

  const inputLabelClass = "text-sm font-black text-admin-text-dim uppercase tracking-widest block";
  const inputFieldClass = "w-full bg-admin-panel/40 border border-admin-border p-3 text-base text-admin-text outline-none focus:border-admin-primary transition-colors no-spinner";

  return (
    <AdminDrawerShell
      isOpen
      title={category ? "Edit category" : "New category"}
      onClose={onClose}
      isSubmitting={isSubmitting}
      footer={footer}
    >
      <div className="space-y-6">
        <AdminInput
          label="Title (EN)"
          value={titleEn}
          onChange={(v) => setTitleEn(String(v ?? ""))}
          placeholder="e.g. Coach"
          labelClassName={inputLabelClass}
          inputClassName={inputFieldClass}
        />
        <AdminInput
          label="Title (KA)"
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
      </div>
    </AdminDrawerShell>
  );
};
