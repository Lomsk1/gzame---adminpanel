import { Suspense, useState } from "react";
import { useLoaderData, Await } from "react-router";
import {
    Activity, User, CheckCircle2, Terminal, Binary, X, Zap, Ghost, Copy
} from "lucide-react";

import type { QuestDailyTypes } from "../../types/quests/daily";
import { SessionCard } from "../../components/cards/active-quest";
import { AdminPageHeader, AdminPageShell } from "../../components/admin";
import { useAdminT } from "../../store/locale/locale";

export default function ActiveQuestsPage() {
    const { t } = useAdminT();
    const { activeQuests } = useLoaderData() as { activeQuests: Promise<QuestDailyTypes> };
    const [inspectingPayload, setInspectingPayload] = useState<QuestDailyTypes['data'][0] | null>(null);

    return (
        <AdminPageShell className="space-y-6 font-mono">
            <AdminPageHeader title={t("pages.dailyQuests.title")} icon={<Activity className="text-admin-accent w-5 h-5" />} />

            <Suspense fallback={<ActiveLoadingGrid />}>
                <Await resolve={activeQuests}>
                    {(resolved: QuestDailyTypes) => {
                        const stats = (() => {
                            const totalPotential = resolved.data.length * 3;
                            const completedCount = resolved.data.reduce((acc, s) =>
                                acc + s.completed.filter(Boolean).length, 0);

                            const counts: Record<string, number> = {};
                            resolved.data.forEach(s => {
                                counts[s.psychotype_used] = (counts[s.psychotype_used] || 0) + 1;
                            });

                            const topEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

                            return {
                                completed: completedCount,
                                pending: totalPotential - completedCount,
                                topPsychotype: topEntry ? topEntry[0] : t("dailyQuests.stats.none"),
                                completionRate: totalPotential > 0
                                    ? Math.round((completedCount / totalPotential) * 100)
                                    : 0
                            };
                        })();

                        return (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                    <MonitorStat label={t("dailyQuests.stats.activeSessions")} val={resolved.total} icon={<User size={12} />} />
                                    <MonitorStat
                                        label={t("dailyQuests.stats.globalSync")}
                                        val={`${stats.completionRate}%`}
                                        color="text-admin-accent"
                                        icon={<CheckCircle2 size={12} />}
                                    />
                                    <MonitorStat
                                        label={t("dailyQuests.stats.pendingNodes")}
                                        val={stats.pending}
                                        color="text-yellow-500"
                                        icon={<Binary size={12} />}
                                    />
                                    <MonitorStat
                                        label={t("dailyQuests.stats.dominantType")}
                                        val={stats.topPsychotype}
                                        color="text-admin-primary"
                                        icon={<Zap size={12} />}
                                    />
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    {resolved.data.length > 0 ? (
                                        resolved.data.map((session) => (
                                            <SessionCard
                                                key={session._id}
                                                session={session}
                                                onInspect={() => setInspectingPayload(session)}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-full py-20 border border-dashed border-admin-border/30 flex flex-col items-center justify-center opacity-40">
                                            <Ghost size={32} className="mb-2" />
                                            <p className="text-[10px] font-black uppercase tracking-widest font-mono">{t("dailyQuests.empty")}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }}
                </Await>
            </Suspense>

            {inspectingPayload && (
                <PayloadInspector
                    data={inspectingPayload}
                    onClose={() => setInspectingPayload(null)}
                />
            )}
        </AdminPageShell>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MonitorStat({ label, val, color = "text-admin-text", icon }: { label: string, val: any, color?: string, icon?: React.ReactNode }) {
    return (
        <div className="bg-admin-panel/40 border border-admin-border p-3 rounded-lg relative overflow-hidden group">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-admin-text-dim/50 group-hover:text-admin-accent transition-colors">{icon}</span>
                <p className="text-[10px] font-black text-admin-text-dim uppercase tracking-[0.15em]">{label}</p>
            </div>
            <p className={`text-xl font-black italic tracking-tighter ${color} leading-none group-hover:translate-x-1 transition-transform`}>
                {val}
            </p>
            <div className="absolute bottom-0 left-0 h-px w-0 bg-admin-primary group-hover:w-full transition-all duration-500 opacity-20" />
        </div>
    );
}

function PayloadInspector({ data, onClose }: { data: QuestDailyTypes['data'][0], onClose: () => void }) {
    const { t } = useAdminT();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-end bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-xl h-full bg-admin-bg border border-admin-primary/30 shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                <div className="p-4 border-b border-admin-border flex justify-between items-center bg-admin-panel">
                    <div className="flex items-center gap-3">
                        <Terminal size={14} className="text-admin-primary" />
                        <div>
                            <h2 className="text-[10px] font-black text-admin-text uppercase">{t("dailyQuests.inspector.title")}</h2>
                            <p className="text-[8px] text-admin-text-dim font-mono">{t("dailyQuests.inspector.nodeUid")} {data._id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-admin-error/20 rounded-full transition-all text-admin-text-dim hover:text-white">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-4 font-mono text-[10px] bg-black/40 custom-scrollbar">
                    <pre className="text-admin-accent/80 leading-relaxed selection:bg-admin-primary selection:text-admin-bg">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>

                <div className="p-4 border-t border-admin-border flex justify-between items-center bg-admin-panel/50">
                    <span className="text-[8px] text-admin-text-dim uppercase font-bold italic">{t("dailyQuests.inspector.status")}</span>
                    <button
                        onClick={handleCopy}
                        className="text-[9px] font-black text-admin-primary flex items-center gap-2 hover:text-white transition-colors"
                    >
                        {copied ? t("dailyQuests.inspector.copied") : t("dailyQuests.inspector.copy")} <Copy size={10} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function ActiveLoadingGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-64 bg-admin-panel/20 border border-admin-border rounded-lg" />
            ))}
        </div>
    );
}
