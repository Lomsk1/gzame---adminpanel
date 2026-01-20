import { CheckCircle2, Circle, Clock, Fingerprint, Terminal, Timer } from "lucide-react";
import type { QuestDailyTypes } from "../../types/quests/daily";
import { GlassCard } from "./card-glass";

export function SessionCard({ session, onInspect }: { session: QuestDailyTypes["data"][number], onInspect: () => void }) {
    const timeRemaining = (date: Date) => {
        const end = new Date(date).getTime() + 86400000;
        const diff = end - new Date().getTime();
        if (diff <= 0) return "EXPIRED";
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}H ${mins}M`;
    };

    const completionCount = session.completed.filter(Boolean).length;

    return (
        <GlassCard className="border-l-2 border-l-admin-accent bg-admin-panel/20 p-5 relative group overflow-hidden transition-all hover:bg-admin-panel/30">
            <div className="flex flex-col gap-5 relative z-10">
                {/* Header Section */}
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-admin-text font-black text-[12px] uppercase tracking-tighter">
                            <Fingerprint size={12} className="text-admin-accent" />
                            UID: <span className="text-admin-primary font-mono">{session.user_id.slice(-10)}</span>
                        </div>
                        <div className="text-[10px] text-admin-text-dim flex items-center gap-3 font-mono">
                            <span className="flex items-center gap-1 opacity-70">
                                <Clock size={10} /> {new Date(session.assigned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="flex items-center gap-1 text-admin-primary">
                                <Timer size={10} /> {timeRemaining(session.assigned_at)}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="bg-admin-accent/5 border border-admin-accent/20 px-2 py-0.5 text-[10px] font-black text-admin-accent uppercase tracking-widest">
                            {session.psychotype_used}
                        </div>
                        <span className="text-[9px] text-admin-text-dim font-mono italic opacity-50 uppercase">Sync_v1.2</span>
                    </div>
                </div>

                {/* Quest Progress Grid */}
                <div className="grid grid-cols-1 gap-2">
                    {session.quest_set.map((quest, idx) => {
                        const isDone = session.completed[idx];
                        return (
                            <div
                                key={quest._id}
                                className={`flex items-center justify-between p-3 border transition-all duration-300 ${isDone
                                    ? 'bg-admin-accent/5 border-admin-accent/30 shadow-[inset_0_0_15px_rgba(var(--admin-accent-rgb),0.02)]'
                                    : 'bg-black/20 border-admin-border/50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`${isDone ? 'text-admin-accent' : 'text-admin-text-dim/30'}`}>
                                        {isDone ? <CheckCircle2 size={12} /> : <Circle size={12} className="animate-pulse" />}
                                    </div>
                                    <div>
                                        <p className={`text-[11px] font-black uppercase tracking-tight ${isDone ? 'text-admin-text' : 'text-admin-text-dim'}`}>
                                            {quest.title.en}
                                        </p>
                                        <p className="text-[9px] text-admin-text-dim/40 font-mono uppercase italic">
                                            {quest.category} // node_{quest._id.slice(-4)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {quest.psychotype.map((_p, i) => (
                                        <div key={i} className={`w-1 h-1 rounded-full ${isDone ? 'bg-admin-accent' : 'bg-admin-primary/20'}`} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Card Footer */}
                <div className="flex justify-between items-center pt-3 border-t border-admin-border/30">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-16 bg-black/40 border border-admin-border/50 overflow-hidden">
                            <div
                                className="h-full bg-admin-accent transition-all duration-1000 ease-out"
                                style={{ width: `${(completionCount / 3) * 100}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-mono text-admin-text-dim uppercase tracking-widest font-bold">
                            {completionCount}/3_SYNCED
                        </span>
                    </div>
                    <button
                        onClick={onInspect}
                        className="text-[10px] font-black text-admin-primary uppercase hover:bg-admin-primary hover:text-admin-bg transition-all flex items-center gap-1.5 border border-admin-primary/20 px-2 py-1"
                    >
                        <Terminal size={10} /> Inspect_Payload
                    </button>
                </div>
            </div>
        </GlassCard>
    );
}