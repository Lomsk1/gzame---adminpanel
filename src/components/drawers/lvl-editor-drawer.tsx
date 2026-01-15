import { useState } from "react";
import type { LevelConfigTypes } from "../../types/level-cofig/level-config";
import { AdminDrawerShell } from "./admin-drawer-shell";
import { AdminInput } from "../ui/input-form";

type LevelData = LevelConfigTypes['data'][number];

interface Props {
    config: LevelData | null;
    onClose: () => void;
    onSave: (data: Partial<LevelData>) => void;
    isSubmitting?: boolean;
}

export const LevelEditorDrawer = ({ config, onClose, onSave, isSubmitting }: Props) => {
    const [formData, setFormData] = useState<Partial<LevelData>>(config || {
        level: 0,
        exp_required: 0,
        is_active: true,
        rewards: { energy_bonus: 0 }
    });

    const footer = (
        <>
            <button
                disabled={isSubmitting}
                onClick={() => onSave(formData)}
                className="group relative w-full py-4 bg-admin-primary font-black uppercase tracking-widest text-xs overflow-hidden transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 text-admin-bg cursor-pointer"
            >
                <span className="relative z-10">
                    {isSubmitting ? "COMMIT_IN_PROGRESS..." : "COMMIT_DATA_STREAM"}
                </span>
                <div className="absolute inset-0 bg-linear-to-b from-white/20 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000" />
            </button>

        </>
    );

    return (
        <AdminDrawerShell
            isOpen={true}
            onClose={onClose}
            isSubmitting={isSubmitting}
            title={config ? 'Edit_Level_Param' : 'New_Progression_Node'}
            footer={footer}
        >
            {/* Level & XP Inputs */}
            <div className="grid grid-cols-2 gap-4">
                <AdminInput
                    label="Level_ID"
                    type="number"
                    value={formData.level}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(val) => setFormData({ ...formData, level: val as any })}
                />
                <AdminInput
                    label="EXP_Required"
                    type="number"
                    value={formData.exp_required}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(val) => setFormData({ ...formData, exp_required: val as any })}
                />
            </div>

            {/* Rewards Section */}
            <div className="p-4 border border-admin-border/50 bg-admin-panel/20 rounded space-y-4">
                <p className="text-[10px] font-black text-admin-warning uppercase tracking-[0.2em]">Reward_Payload</p>
                <AdminInput
                    label="Energy_Bonus"
                    type="number"
                    value={formData.rewards?.energy_bonus ?? 0}
                    onChange={(val) => setFormData({
                        ...formData,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        rewards: { ...formData.rewards, energy_bonus: val as any }
                    })}
                />
            </div>

            {/* Features Toggle */}
            <div className="flex items-center gap-3 p-3 border border-admin-border/20 bg-white/5 rounded-sm">
                <input
                    type="checkbox"
                    id="active-toggle"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 accent-admin-primary cursor-pointer"
                />
                <label htmlFor="active-toggle" className="text-[10px] font-black uppercase text-admin-text cursor-pointer select-none">
                    Active_In_Production
                </label>
            </div>
        </AdminDrawerShell>
    );
};