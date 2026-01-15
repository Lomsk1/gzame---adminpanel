import { useState } from "react";
import { AdminDrawerShell } from "./admin-drawer-shell";
import { AdminInput } from "../ui/input-form"; // Adjust path as needed
import { AdminConfirmWrapper } from "../wrapper/wrapper";

// --- Types ---

export type Psychotype = "WARRIOR" | "SHAMAN" | "ARCHITECT" | "STALKER" | "SPARK" | "ANOMALY";

export interface Option {
    title: { ka: string; en: string };
    scores: Record<Psychotype, number | string>;
    sequence: number | string;
}

export interface Question {
    title: { ka: string; en: string };
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
    title: { ka: "", en: "" },
    scores: {
        WARRIOR: 0, SHAMAN: 0, ARCHITECT: 0, STALKER: 0, SPARK: 0, ANOMALY: 0
    },
    sequence: sequence
});

export const QuestionEditorDrawer = ({ config, onClose, onSave, isSubmitting }: Props) => {
    const [form, setForm] = useState<Question>({
        title: config?.title || { ka: "", en: "" },
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
        if (confirm("DESTRUCTIVE_ACTION: PURGE_OPTION_DATA?")) {
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
                <span className="relative z-10">{isSubmitting ? "COMMIT_IN_PROGRESS..." : "COMMIT_DATA_STREAM"}</span>
                <div className="absolute inset-0 bg-linear-to-b from-white/20 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000" />
            </button>
        </div>
    );

    return (
        <AdminDrawerShell
            isOpen={true}
            title={config ? "RECONFIGURING_NODE" : "INITIALIZING_NODE"}
            onClose={onClose}
            isSubmitting={isSubmitting}
            footer={footer}
        >
            <div className="space-y-8">
                {/* Global Settings */}
                <div className="grid grid-cols-2 gap-4 items-end">
                    <AdminInput
                        label="Node_Sequence"
                        type="number"
                        value={form.sequence}
                        onChange={(val) => setForm({ ...form, sequence: val })}
                    />
                    <div className="flex flex-col">
                        <label className="text-[10px] font-black text-admin-primary uppercase mb-1">Status</label>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, isActive: !form.isActive })}
                            className={`py-2 border text-[10px] font-black transition-all ${form.isActive ? 'border-admin-primary text-admin-primary bg-admin-primary/5' : 'border-admin-error text-admin-error bg-admin-error/5'
                                }`}
                        >
                            {form.isActive ? "NODE_ACTIVE" : "NODE_OFFLINE"}
                        </button>
                    </div>
                </div>

                {/* Question Titles */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-admin-primary uppercase tracking-widest border-l-2 border-admin-primary pl-2">Question_Payload</h4>
                    <AdminInput
                        label="EN_Title"
                        value={form.title.en}
                        onChange={(val) => setForm({ ...form, title: { ...form.title, en: val as string } })}
                    />
                    <AdminInput
                        label="KA_Title"
                        value={form.title.ka}
                        onChange={(val) => setForm({ ...form, title: { ...form.title, ka: val as string } })}
                    />
                </div>

                {/* Response Matrix */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-black text-admin-primary uppercase tracking-widest border-l-2 border-admin-primary pl-2">Response_Matrix</h4>
                        <button
                            type="button"
                            onClick={addOption}
                            className="text-[10px] font-bold text-admin-primary hover:text-white transition-colors uppercase"
                        >
                            [+ Initialize_Option]
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
                                    title={`TERMINATE_OPTION::0x${idx + 1}`}
                                    description="CRITICAL_ACTION: This will permanently purge this option and its psychotype matrix from the central node. Re-indexing will occur automatically."
                                    onConfirm={() => removeOption(idx)}
                                    variant="warning"
                                    className="w-fit!"
                                >
                                    <button
                                        type="button"
                                        className="text-[9px] font-black text-admin-error hover:bg-admin-error hover:text-white px-2 py-0.5 transition-all uppercase border border-transparent hover:border-admin-error/50"
                                    >
                                        [Purge_Data]
                                    </button>
                                </AdminConfirmWrapper>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <AdminInput
                                    label="English Text"
                                    value={opt.title.en}
                                    onChange={(val) => {
                                        const next = [...form.options];
                                        next[idx].title.en = val as string;
                                        setForm({ ...form, options: next });
                                    }}
                                />
                                <AdminInput
                                    label="ქართული ტექსტი"
                                    value={opt.title.ka}
                                    onChange={(val) => {
                                        const next = [...form.options];
                                        next[idx].title.ka = val as string;
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