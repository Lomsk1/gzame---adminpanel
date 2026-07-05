import { useState } from "react";
import { AdminDrawerShell } from "./admin-drawer-shell";
import { AdminInput } from "../ui/input-form";
import type { Psychotype } from "../../types/user/user";
import { AdminTextArea } from "../ui/text-area-form";
import { useAdminT } from "../../store/locale/locale";
import { toast } from "sonner";

export interface QuestFormData {
    _id?: string;
    title: { ka: string; en: string; ru?: string; ja?: string };
    description: { ka: string; en: string; ru?: string; ja?: string };
    psychotype: Psychotype[];
    category: "mental" | "stalking" | "action";
    expReward: number;
    energyCost: number;
    minLevel: number;
    isActive: boolean;
    is_foundational: boolean;
}

interface Props {
    config: QuestFormData | null;
    onClose: () => void;
    onSave: (data: QuestFormData) => void;
    isSubmitting?: boolean;
}

const PSYCHOTYPES: Psychotype[] = ["WARRIOR", "SHAMAN", "ARCHITECT", "STALKER", "SPARK", "ANOMALY"];

export const QuestEditorDrawer = ({ config, onClose, onSave, isSubmitting }: Props) => {
    const { t } = useAdminT();
    const [form, setForm] = useState<QuestFormData>({
        title: config?.title || { ka: "", en: "", ru: "", ja: "" },
        description: config?.description || { ka: "", en: "", ru: "", ja: "" },
        psychotype: config?.psychotype || [],
        category: config?.category || "mental",
        expReward: config?.expReward ?? 10,
        energyCost: config?.energyCost ?? 5,
        minLevel: config?.minLevel ?? 1,
        isActive: config?.isActive ?? true,
        is_foundational: config?.is_foundational ?? false,
    });

    const togglePsychotype = (p: Psychotype) => {
        setForm((prev) => ({
            ...prev,
            psychotype: prev.psychotype.includes(p)
                ? prev.psychotype.filter((item) => item !== p)
                : [...prev.psychotype, p],
        }));
    };

    const handleSave = () => {
        if (form.psychotype.length === 0) {
            toast.error(t("quests.editor.validationPsychotype"));
            return;
        }
        onSave(form);
    };

    const footer = (
        <button
            disabled={isSubmitting}
            onClick={handleSave}
            className="group relative w-full py-4 bg-admin-primary font-black uppercase tracking-widest text-xs overflow-hidden transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 text-admin-bg cursor-pointer"
        >
            <span className="relative z-10">
                {isSubmitting ? t("quests.editor.syncing") : t("quests.editor.deploy")}
            </span>
            <div className="absolute inset-0 bg-linear-to-b from-white/20 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000" />
        </button>
    );

    return (
        <AdminDrawerShell
            isOpen
            title={config ? t("quests.editor.reconfiguring") : t("quests.editor.initializing")}
            onClose={onClose}
            isSubmitting={isSubmitting}
            footer={footer}
        >
            <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className="text-[10px] font-black text-admin-primary uppercase mb-1">{t("common.status")}</label>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, isActive: !form.isActive })}
                            className={`py-2 border text-[10px] font-black transition-all ${form.isActive ? "border-admin-primary text-admin-primary bg-admin-primary/5" : "border-admin-error text-admin-error bg-admin-error/5"}`}
                        >
                            {form.isActive ? t("quests.editor.questLive") : t("quests.editor.questOffline")}
                        </button>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[10px] font-black text-admin-accent uppercase mb-1">{t("common.status")}</label>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, is_foundational: !form.is_foundational })}
                            className={`py-2 border text-[10px] font-black transition-all ${form.is_foundational ? "border-admin-accent text-admin-accent bg-admin-accent/5" : "border-admin-border text-admin-text-dim"}`}
                        >
                            {form.is_foundational ? t("quests.editor.foundational") : t("quests.editor.dailyTask")}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-admin-primary uppercase tracking-widest border-l-2 border-admin-primary pl-2">
                        {t("pages.quests.title")}
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                        <AdminInput label={t("quests.editor.enTitle")} value={form.title.en} onChange={(val) => setForm({ ...form, title: { ...form.title, en: val as string } })} />
                        <AdminInput label={t("quests.editor.kaTitle")} value={form.title.ka} onChange={(val) => setForm({ ...form, title: { ...form.title, ka: val as string } })} />
                        <AdminInput label={t("quests.editor.ruTitle")} value={form.title.ru ?? ""} onChange={(val) => setForm({ ...form, title: { ...form.title, ru: (val as string) || undefined } })} />
                        <AdminInput label={t("quests.editor.jaTitle")} value={form.title.ja ?? ""} onChange={(val) => setForm({ ...form, title: { ...form.title, ja: (val as string) || undefined } })} />
                        <AdminTextArea label={t("quests.editor.enDesc")} value={form.description.en} onChange={(val) => setForm({ ...form, description: { ...form.description, en: val as string } })} />
                        <AdminTextArea label={t("quests.editor.kaDesc")} value={form.description.ka} onChange={(val) => setForm({ ...form, description: { ...form.description, ka: val as string } })} />
                        <AdminTextArea label={t("quests.editor.ruDesc")} value={form.description.ru ?? ""} onChange={(val) => setForm({ ...form, description: { ...form.description, ru: (val as string) || undefined } })} />
                        <AdminTextArea label={t("quests.editor.jaDesc")} value={form.description.ja ?? ""} onChange={(val) => setForm({ ...form, description: { ...form.description, ja: (val as string) || undefined } })} />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        <AdminInput label={t("quests.editor.expReward")} type="number" value={form.expReward} onChange={(val) => setForm({ ...form, expReward: Number(val) })} />
                        <AdminInput label={t("quests.editor.nrgCost")} type="number" value={form.energyCost} onChange={(val) => setForm({ ...form, energyCost: Number(val) })} />
                        <AdminInput label={t("quests.editor.minLevel")} type="number" value={form.minLevel} onChange={(val) => setForm({ ...form, minLevel: Number(val) })} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-admin-text-dim uppercase">{t("common.status")}</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(["mental", "stalking", "action"] as const).map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setForm({ ...form, category: cat })}
                                    className={`py-2 text-[9px] font-black uppercase border transition-all ${form.category === cat ? "border-admin-primary text-admin-primary bg-admin-primary/10" : "border-admin-border text-admin-text-dim"}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                        {PSYCHOTYPES.map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => togglePsychotype(p)}
                                className={`py-2 text-[9px] font-black border transition-all ${form.psychotype.includes(p) ? "border-admin-primary text-admin-primary bg-admin-primary/20" : "border-admin-border/50 text-admin-text-dim"}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </AdminDrawerShell>
    );
};
