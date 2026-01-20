import { GlassCard } from './card-glass';
import { AdminConfirmWrapper } from '../wrapper/wrapper';
import { Brain, Crosshair, Edit3, Layers, Shield, Trash2, Zap } from 'lucide-react';
import type { QuestsTypes } from '../../types/quests/quest';

type Quest = QuestsTypes["data"][number];

export default function QuestCard({ quest, onEdit, onDelete }: { quest: Quest, onEdit: () => void, onDelete: () => void }) {
    const CategoryIcon = { mental: Brain, stalking: Crosshair, action: Shield }[quest.category];

    return (
        <GlassCard
            className={`relative group overflow-hidden border-t-2 transition-all ${quest.is_foundational ? 'border-t-admin-accent' : 'border-t-admin-primary'
                }`}
        >
            <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="p-2 rounded bg-admin-bg border border-admin-border text-admin-primary shadow-inner">
                        <CategoryIcon size={18} />
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={onEdit} className="p-1.5 text-admin-text-dim hover:text-admin-primary transition-colors">
                            <Edit3 size={14} />
                        </button>
                        <AdminConfirmWrapper
                            title="TERMINATE_NODE"
                            description={`This will permanently purge "${quest.title.en}" from the database.`}
                            onConfirm={onDelete}
                            variant="danger"
                            isFixed
                            confirmWord='delete'
                        >
                            <button className="p-1.5 text-admin-text-dim hover:text-admin-error transition-colors">
                                <Trash2 size={14} />
                            </button>
                        </AdminConfirmWrapper>
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-base font-black text-admin-text uppercase group-hover:text-admin-primary transition-colors truncate">
                        {quest.title.en}
                    </h3>
                    <p className="text-[12px] text-admin-text-dim line-clamp-2 h-9 italic leading-relaxed">
                        {quest.description.en}
                    </p>
                </div>

                <div className="flex flex-wrap gap-1">
                    {quest.psychotype.map(p => (
                        <span key={p} className="px-1.5 py-0.5 bg-admin-panel border border-admin-border text-[11px] font-black text-admin-text uppercase tracking-wide">
                            {p}
                        </span>
                    ))}
                </div>

                <div className="pt-4 border-t border-admin-border/30 flex justify-between items-center">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <Layers size={12} className="text-admin-accent" />
                            <span className="text-[12px] font-black text-admin-text">{quest.expReward} EXP</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Zap size={12} className="text-yellow-500" />
                            <span className="text-[12px] font-black text-admin-text">{quest.energyCost} NRG</span>
                        </div>
                    </div>
                    <span className="text-[11px] font-black text-admin-primary">LVL_{quest.minLevel}</span>
                </div>
            </div>

            {quest.is_foundational && (
                <div className="absolute top-0 right-0 bg-admin-accent text-admin-bg text-[11px] font-black px-5 py-1 uppercase transform rotate-45 translate-x-5 -translate-y-[0.5px] shadow-md">
                    CORE
                </div>
            )}
        </GlassCard>
    );
}


