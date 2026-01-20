import { useState } from "react";
import { AdminDrawerShell } from "./admin-drawer-shell";
import { AdminInput } from "../ui/input-form";
import type { Psychotype } from "../../types/user/user";
import { AdminTextArea } from "../ui/text-area-form";

// Types matching your Quest Schema
export interface QuestFormData {
    _id?: string;
    title: { ka: string; en: string };
    description: { ka: string; en: string };
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
    const [form, setForm] = useState<QuestFormData>({
        title: config?.title || { ka: "", en: "" },
        description: config?.description || { ka: "", en: "" },
        psychotype: config?.psychotype || [],
        category: config?.category || "mental",
        expReward: config?.expReward ?? 10,
        energyCost: config?.energyCost ?? 5,
        minLevel: config?.minLevel ?? 1,
        isActive: config?.isActive ?? true,
        is_foundational: config?.is_foundational ?? false,
    });

    const togglePsychotype = (p: Psychotype) => {
        setForm(prev => ({
            ...prev,
            psychotype: prev.psychotype.includes(p)
                ? prev.psychotype.filter(item => item !== p)
                : [...prev.psychotype, p]
        }));
    };

    const handleSave = () => {
        // Validation: Ensure at least one psychotype is selected
        if (form.psychotype.length === 0) {
            alert("VALIDATION_ERROR: AT_LEAST_ONE_PSYCHOTYPE_REQUIRED");
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
            <span className="relative z-10">{isSubmitting ? "SYNCING_DATABASE..." : "DEPLOY_QUEST_NODE"}</span>
            <div className="absolute inset-0 bg-linear-to-b from-white/20 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000" />
        </button>
    );

    return (
        <AdminDrawerShell
            isOpen={true}
            title={config ? "RECONFIGURING_QUEST" : "INITIALIZING_QUEST_TEMPLATE"}
            onClose={onClose}
            isSubmitting={isSubmitting}
            footer={footer}
        >
            <div className="space-y-8">
                {/* 1. Core Config */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className="text-[10px] font-black text-admin-primary uppercase mb-1">Status</label>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, isActive: !form.isActive })}
                            className={`py-2 border text-[10px] font-black transition-all ${form.isActive ? 'border-admin-primary text-admin-primary bg-admin-primary/5' : 'border-admin-error text-admin-error bg-admin-error/5'}`}
                        >
                            {form.isActive ? "QUEST_LIVE" : "QUEST_OFFLINE"}
                        </button>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[10px] font-black text-admin-accent uppercase mb-1">Type_Class</label>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, is_foundational: !form.is_foundational })}
                            className={`py-2 border text-[10px] font-black transition-all ${form.is_foundational ? 'border-admin-accent text-admin-accent bg-admin-accent/5' : 'border-admin-border text-admin-text-dim'}`}
                        >
                            {form.is_foundational ? "FOUNDATIONAL" : "DAILY_TASK"}
                        </button>
                    </div>
                </div>

                {/* 2. Content */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-admin-primary uppercase tracking-widest border-l-2 border-admin-primary pl-2">Quest_Payload</h4>
                    <div className="grid grid-cols-1 gap-4">
                        <AdminInput label="EN_Title" value={form.title.en} onChange={(val) => setForm({ ...form, title: { ...form.title, en: val as string } })} />
                        <AdminInput label="KA_Title" value={form.title.ka} onChange={(val) => setForm({ ...form, title: { ...form.title, ka: val as string } })} />
                        <AdminTextArea label="EN_Description" value={form.description.en} onChange={(val) => setForm({ ...form, description: { ...form.description, en: val as string } })} />
                        <AdminTextArea label="KA_Description" value={form.description.ka} onChange={(val) => setForm({ ...form, description: { ...form.description, ka: val as string } })} />
                    </div>
                </div>

                {/* 3. Mechanics */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-admin-primary uppercase tracking-widest border-l-2 border-admin-primary pl-2">System_Mechanics</h4>
                    <div className="grid grid-cols-3 gap-3">
                        <AdminInput label="EXP_Reward" type="number" value={form.expReward} onChange={(val) => setForm({ ...form, expReward: Number(val) })} />
                        <AdminInput label="NRG_Cost" type="number" value={form.energyCost} onChange={(val) => setForm({ ...form, energyCost: Number(val) })} />
                        <AdminInput label="Min_Level" type="number" value={form.minLevel} onChange={(val) => setForm({ ...form, minLevel: Number(val) })} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-admin-text-dim uppercase">Category_Enum</label>
                        <div className="grid grid-cols-3 gap-2">
                            {["mental", "stalking", "action"].map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    onClick={() => setForm({ ...form, category: cat as any })}
                                    className={`py-2 text-[9px] font-black uppercase border transition-all ${form.category === cat ? 'border-admin-primary text-admin-primary bg-admin-primary/10' : 'border-admin-border text-admin-text-dim'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. Psychotype Matrix */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-admin-primary uppercase tracking-widest border-l-2 border-admin-primary pl-2">Psychotype_Affinity</h4>
                    <div className="grid grid-cols-3 gap-2">
                        {PSYCHOTYPES.map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => togglePsychotype(p)}
                                className={`py-2 text-[9px] font-black border transition-all ${form.psychotype.includes(p) ? 'border-admin-primary text-admin-primary bg-admin-primary/20' : 'border-admin-border/50 text-admin-text-dim'}`}
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