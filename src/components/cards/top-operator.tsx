import type { StatsUserTypes } from "../../types/stats/user";
import { GlassCard } from "./card-glass";

export const TopOperatorsCard = ({ users }: { users: StatsUserTypes['data']['topUsers'] }) => (
    <GlassCard className="h-full border-admin-accent/20">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-admin-accent mb-4">Elite_Operators</h3>
        <div className="space-y-3">
            {users.map((user, i) => (
                <div key={user._id} className="flex items-center justify-between p-2 rounded bg-admin-bg/40 border border-admin-border/30 group hover:border-admin-accent/50 transition-all">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-admin-accent">0{i + 1}</span>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-admin-text">{user.nickname}</span>
                            <span className="text-[8px] uppercase text-admin-text-dim">LVL {user.currentLevel}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-black text-admin-warning">{user.currentStreakDays}D</div>
                        <div className="text-[7px] text-admin-text-dim uppercase tracking-tighter">Streak</div>
                    </div>
                </div>
            ))}
        </div>
    </GlassCard>
);