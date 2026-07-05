import { GlassCard } from "./card-glass";
import type { LevelConfigTypes } from "../../types/level-cofig/level-config";
import { AdminConfirmWrapper } from "../wrapper/wrapper";
import { useAdminT } from "../../store/locale/locale";

type LevelData = LevelConfigTypes["data"][number];

interface LevelNodeCardProps {
    config: LevelData;
    onEdit: () => void;
    onDelete: () => void;
    onToggleActive: () => void;
    isSubmitting?: boolean;
}

export const LevelNodeCard = ({
    config,
    onEdit,
    onDelete,
    onToggleActive,
    isSubmitting,
}: LevelNodeCardProps) => {
    const { t } = useAdminT();

    return (
        <GlassCard className={`group transition-all ${!config.is_active ? "opacity-50 grayscale" : "hover:border-admin-primary/40"}`}>
            <div className="flex justify-between items-start p-4 border-b border-admin-border/20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-admin-bg border border-admin-primary rounded text-lg font-black text-admin-primary italic">
                        {config.level}
                    </div>
                    <div>
                        <p className="text-[8px] font-mono text-admin-text-dim uppercase italic">
                            {t("levels.card.systemNode")}
                        </p>
                        <p className={`text-[10px] font-black uppercase ${config.is_active ? "text-admin-success" : "text-admin-error"}`}>
                            {config.is_active ? t("levels.card.online") : t("levels.card.offline")}
                        </p>
                    </div>
                </div>

                <button
                    onClick={onToggleActive}
                    className={`w-8 h-4 rounded-full border cursor-pointer border-admin-border relative transition-colors ${config.is_active ? "bg-admin-success/20" : "bg-admin-bg"}`}
                    disabled={isSubmitting}
                >
                    <div
                        className={`absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all ${config.is_active ? "right-1 bg-admin-success" : "left-1 bg-admin-text-dim"}`}
                    />
                </button>
            </div>

            <div className="p-4 space-y-4">
                <div className="flex justify-between items-end">
                    <span className="text-[12px] font-bold text-admin-text-dim uppercase tracking-tighter">
                        {t("levels.card.threshold")}
                    </span>
                    <span className="text-sm font-mono text-admin-text font-bold">
                        {config.exp_required.toLocaleString()} XP
                    </span>
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-mono text-admin-primary uppercase tracking-widest border-b border-admin-primary/20 pb-1">
                        {t("levels.card.rewardsPayload")}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {config.rewards?.energy_bonus ? (
                            <Badge color="warning" text={`+${config.rewards.energy_bonus} NRG`} />
                        ) : null}
                        {config.rewards?.unlock_features?.map((f) => (
                            <Badge key={f} color="primary" text={f} />
                        ))}
                        {config.rewards?.visual_rewards?.map((v) => (
                            <Badge key={v} color="accent" text={v} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-2 grid grid-cols-2 gap-2 bg-admin-panel/20">
                <button
                    onClick={onEdit}
                    className="py-1.5 text-[10px] font-black text-admin-text-dim hover:text-white uppercase tracking-tighter bg-admin-bg/40 border border-admin-border/30 rounded transition-colors cursor-pointer"
                    disabled={isSubmitting}
                >
                    {t("levels.card.modifyConfig")}
                </button>

                <AdminConfirmWrapper
                    title={t("levels.card.purgeTitle")}
                    description={t("levels.card.purgeDesc", { level: config.level })}
                    confirmText={t("levels.card.purgeConfirm")}
                    confirmWord="delete"
                    variant="danger"
                    onConfirm={onDelete}
                    isLoading={isSubmitting}
                    isFixed
                >
                    <button className="w-full py-1.5 text-[10px] font-black text-admin-error/60 hover:text-admin-error uppercase tracking-tighter bg-admin-bg/40 border border-admin-border/30 rounded transition-colors cursor-pointer">
                        {t("levels.card.destruct")}
                    </button>
                </AdminConfirmWrapper>
            </div>
        </GlassCard>
    );
};

const Badge = ({ text, color }: { text: string; color: "primary" | "warning" | "accent" }) => {
    const colors = {
        primary: "text-admin-primary border-admin-primary/30 bg-admin-primary/5",
        warning: "text-admin-warning border-admin-warning/30 bg-admin-warning/5",
        accent: "text-admin-accent border-admin-accent/30 bg-admin-accent/5",
    };
    return (
        <span className={`px-1.5 py-0.5 border text-[9px] font-black rounded-sm uppercase ${colors[color]}`}>{text}</span>
    );
};
