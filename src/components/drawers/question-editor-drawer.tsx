import { useState } from "react";
import { AdminDrawerShell } from "./admin-drawer-shell";
import { AdminInput } from "../ui/input-form";
import { AdminConfirmWrapper } from "../wrapper/wrapper";
import { useAdminT } from "../../store/locale/locale";

// --- Types ---

export type Psychotype = "WARRIOR" | "SHAMAN" | "ARCHITECT" | "STALKER" | "SPARK" | "ANOMALY";

export interface Option {
    title: { ka: string; en: string; ru?: string; ja?: string };
    scores: Record<Psychotype, number | string>;
    sequence: number | string;
}

export interface Question {
    title: { ka: string; en: string; ru?: string; ja?: string };
    sequence?: number | string;
    isActive: boolean;
    options: Option[];
}

interface Props {
    config: Question | null;
    onClose: () => void;
    onSave: (data: Question) => void;
    isSubmitting?: boolean;
}

// --- Helpers ---

const createNewOption = (sequence: number): Option => ({
    title: { ka: "", en: "", ru: "", ja: "" },
    scores: {
        WARRIOR: 0, SHAMAN: 0, ARCHITECT: 0, STALKER: 0, SPARK: 0, ANOMALY: 0
    },
    sequence: sequence
});

export const QuestionEditorDrawer = ({ config, onClose, onSave, isSubmitting }: Props) => {
    const { t } = useAdminT();
    const [form, setForm] = useState<Question>({
        title: config?.title
            ? { ka: config.title.ka, en: config.title.en, ru: config.title.ru ?? "", ja: config.title.ja ?? "" }
            : { ka: "", en: "", ru: "", ja: "" },
        sequence: config?.sequence ?? 1,
        isActive: config?.isActive ?? true,
        options: config?.options
            ? JSON.parse(JSON.stringify(config.options))
            : [createNewOption(1)]
    });

    const addOption = () => {
        setForm(prev => ({
            ...prev,
            options: [...prev.options, createNewOption(prev.options.length + 1)]
        }));
    };

    const removeOption = (idx: number) => {
        if (form.options.length <= 1) return;
        if (confirm(t("questions.editor.purgeOptionConfirm"))) {
            setForm(prev => ({
                ...prev,
                options: prev.options
                    .filter((_, i) => i !== idx)
                    .map((opt, i) => ({ ...opt, sequence: i + 1 }))
            }));
        }
    };

    // Clean up data before saving (converts "" to 0)
    const handleSave = () => {
        const sanitizedData: Question = {
            ...form,
            sequence: Number(form.sequence) || 0,
            options: form.options.map(opt => ({
                ...opt,
                sequence: Number(opt.sequence) || 0,
                scores: Object.fromEntries(
                    Object.entries(opt.scores).map(([key, val]) => [key, Number(val) || 0])
                ) as Record<Psychotype, number>
            }))
        };
        onSave(sanitizedData);
    };

    const footer = (
        <div className="space-y-3">
            <button
                disabled={isSubmitting}
                onClick={handleSave}
                className="group relative w-full py-4 bg-admin-primary font-black uppercase tracking-widest text-xs overflow-hidden transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 text-admin-bg cursor-pointer"
            >
                <span className="relative z-10">{isSubmitting ? t("drawer.commitInProgress") : t("drawer.commitData")}</span>
                <div className="absolute inset-0 bg-linear-to-b from-white/20 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000" />
            </button>
        </div>
    );

    return (
        <AdminDrawerShell
            isOpen={true}
            title={config ? t("questions.editor.reconfiguring") : t("questions.editor.initializing")}
            onClose={onClose}
            isSubmitting={isSubmitting}
            footer={footer}
        >
            <div className="space-y-8">
                {/* Global Settings */}
                <div className="grid grid-cols-2 gap-4 items-end">
                    <AdminInput
                        label={t("questions.editor.nodeSequence")}
                        type="number"
                        value={form.sequence}
                        onChange={(val) => setForm({ ...form, sequence: val })}
                    />
                    <div className="flex flex-col">
                        <label className="text-[10px] font-black text-admin-primary uppercase mb-1">{t("common.status")}</label>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, isActive: !form.isActive })}
                            className={`py-2 border text-[10px] font-black transition-all ${form.isActive ? 'border-admin-primary text-admin-primary bg-admin-primary/5' : 'border-admin-error text-admin-error bg-admin-error/5'
                                }`}
                        >
                            {form.isActive ? t("questions.editor.nodeActive") : t("questions.editor.nodeOffline")}
                        </button>
                    </div>
                </div>

                {/* Question Titles */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-admin-primary uppercase tracking-widest border-l-2 border-admin-primary pl-2">{t("questions.editor.questionPayload")}</h4>
                    <AdminInput
                        label={t("questions.editor.enTitle")}
                        value={form.title.en}
                        onChange={(val) => setForm({ ...form, title: { ...form.title, en: val as string } })}
                    />
                    <AdminInput
                        label={t("questions.editor.kaTitle")}
                        value={form.title.ka}
                        onChange={(val) => setForm({ ...form, title: { ...form.title, ka: val as string } })}
                    />
                    <AdminInput
                        label={t("questions.editor.ruTitle")}
                        value={form.title.ru ?? ""}
                        onChange={(val) => setForm({ ...form, title: { ...form.title, ru: (val as string) || undefined } })}
                    />
                    <AdminInput
                        label={t("questions.editor.jaTitle")}
                        value={form.title.ja ?? ""}
                        onChange={(val) => setForm({ ...form, title: { ...form.title, ja: (val as string) || undefined } })}
                    />
                </div>

                {/* Response Matrix */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-black text-admin-primary uppercase tracking-widest border-l-2 border-admin-primary pl-2">{t("questions.editor.responseMatrix")}</h4>
                        <button
                            type="button"
                            onClick={addOption}
                            className="text-[10px] font-bold text-admin-primary hover:text-white transition-colors uppercase"
                        >
                            + {t("questions.editor.addOption")}
                        </button>
                    </div>

                    {form.options.map((opt, idx) => (
                        <div key={idx} className="p-4 bg-admin-panel/20 border border-admin-border/50 space-y-4 relative">
                            <div className="flex justify-between items-center bg-admin-border/10 p-2 -m-4 mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-mono text-admin-primary/60">OPT_0x{idx + 1}</span>
                                    <div className="w-16">
                                        <AdminInput
                                            label="SEQ"
                                            type="number"
                                            value={opt.sequence}
                                            onChange={(val) => {
                                                const next = [...form.options];
                                                next[idx].sequence = val as number;
                                                setForm({ ...form, options: next });
                                            }}
                                        />
                                    </div>
                                </div>
                                <AdminConfirmWrapper
                                    title={t("questions.editor.purgeOptionTitle", { num: idx + 1 })}
                                    description={t("questions.editor.purgeOptionDesc")}
                                    onConfirm={() => removeOption(idx)}
                                    variant="warning"
                                    className="w-fit!"
                                >
                                    <button
                                        type="button"
                                        className="text-[9px] font-black text-admin-error hover:bg-admin-error hover:text-white px-2 py-0.5 transition-all uppercase border border-transparent hover:border-admin-error/50"
                                    >
                                        {t("questions.editor.purgeData")}
                                    </button>
                                </AdminConfirmWrapper>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <AdminInput
                                    label={t("questions.editor.enText")}
                                    value={opt.title.en}
                                    onChange={(val) => {
                                        const next = [...form.options];
                                        next[idx].title.en = val as string;
                                        setForm({ ...form, options: next });
                                    }}
                                />
                                <AdminInput
                                    label={t("questions.editor.kaText")}
                                    value={opt.title.ka}
                                    onChange={(val) => {
                                        const next = [...form.options];
                                        next[idx].title.ka = val as string;
                                        setForm({ ...form, options: next });
                                    }}
                                />
                                <AdminInput
                                    label={t("questions.editor.ruText")}
                                    value={opt.title.ru ?? ""}
                                    onChange={(val) => {
                                        const next = [...form.options];
                                        next[idx].title.ru = (val as string) || undefined;
                                        setForm({ ...form, options: next });
                                    }}
                                />
                                <AdminInput
                                    label={t("questions.editor.jaText")}
                                    value={opt.title.ja ?? ""}
                                    onChange={(val) => {
                                        const next = [...form.options];
                                        next[idx].title.ja = (val as string) || undefined;
                                        setForm({ ...form, options: next });
                                    }}
                                />
                            </div>

                            {/* Psychotype Score Grid */}
                            <div className="grid grid-cols-3 gap-2">
                                {(Object.keys(opt.scores) as Psychotype[]).map(type => (
                                    <AdminInput
                                        key={type}
                                        label={type.slice(0, 4)}
                                        type="number"
                                        value={opt.scores[type]}
                                        onChange={(val) => {
                                            const next = [...form.options];
                                            next[idx].scores[type] = val as number;
                                            setForm({ ...form, options: next });
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminDrawerShell>
    );
};