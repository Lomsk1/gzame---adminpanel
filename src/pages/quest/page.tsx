import { Suspense, useState } from "react";
import { useLoaderData, Await, useSearchParams, useFetcher } from "react-router";
import { GlassCard } from "../../components/cards/card-glass";
import {
    Sword, Zap, Brain, Shield, Crosshair,
    ChevronLeft, ChevronRight, Layers,
    Search, Database, Activity
} from "lucide-react";

// Types
import type { QuestsTypes } from "../../types/quests/quest";
import { QuestEditorDrawer, type QuestFormData } from "../../components/drawers/quest-editor-drawer";
import ButtonInitialization from "../../components/ui/button-initialize";

type Quest = QuestsTypes["data"][number];

export default function QuestsPage() {
    const { questsData } = useLoaderData() as { questsData: Promise<QuestsTypes> };
    const [searchParams, setSearchParams] = useSearchParams();
    const fetcher = useFetcher();

    // --- State for Drawer ---
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [editingQuest, setEditingQuest] = useState<QuestFormData | null>(null);

    // --- URL Params ---
    const currentPage = Number(searchParams.get("page")) || 1;
    const foundationalFilter = searchParams.get("is_foundational") || "all";

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set(key, value);
        if (key !== "page") params.set("page", "1");
        setSearchParams(params);
    };

    const handleSave = (data: QuestFormData) => {
        const method = data._id ? "PATCH" : "POST";
        const endpoint = data._id ? `/api/v1/quest/${data._id}` : "/api/v1/quest";

        // Use fetcher to submit data to your action
        fetcher.submit(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { ...data } as any,
            { method, action: endpoint, encType: "application/json" }
        );
        setDrawerOpen(false);
    };

    const handleEdit = (quest: Quest) => {
        setEditingQuest(quest as unknown as QuestFormData);
        setDrawerOpen(true);
    };

    return (
        <div className="p-8 space-y-8 bg-admin-bg min-h-screen font-mono animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* --- HEADER --- */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-admin-primary/20 pb-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-admin-text uppercase italic tracking-tighter flex items-center gap-3">
                        <Sword className="text-admin-primary w-8 h-8" />
                        Psychometric_Nodes<span className="text-admin-primary">.db</span>
                    </h1>
                    <div className="flex items-center gap-4">
                        <Suspense fallback={<div className="h-4 w-20 bg-admin-panel animate-pulse" />}>
                            <Await resolve={questsData}>
                                {(res) => (
                                    <span className="text-[10px] text-admin-primary font-mono bg-admin-primary/10 px-2 py-0.5 border border-admin-primary/20">
                                        TOTAL_ENTRY: {res.total || 0}
                                    </span>
                                )}
                            </Await>
                        </Suspense>
                        <span className="text-[10px] text-admin-text-dim font-mono uppercase tracking-widest flex items-center gap-2">
                            <Activity size={10} className="text-admin-accent animate-pulse" /> Status: Uplink_Active
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* --- CATEGORY FILTERS --- */}
                    <div className="flex gap-1 p-1 bg-admin-panel rounded-lg border border-admin-border">
                        {["all", "true", "false"].map((val) => (
                            <button
                                key={val}
                                onClick={() => updateFilter("is_foundational", val)}
                                className={`px-4 py-1.5 rounded text-[9px] font-black uppercase transition-all ${foundationalFilter === val
                                    ? 'bg-admin-primary text-admin-bg'
                                    : 'text-admin-text-dim hover:text-admin-text'
                                    }`}
                            >
                                {val === "all" ? "All_Nodes" : val === "true" ? "Foundational" : "Daily_Stream"}
                            </button>
                        ))}
                    </div>

                    <ButtonInitialization onClick={() => { setEditingQuest(null); setDrawerOpen(true); }} />
                </div>
            </header>

            <Suspense fallback={<LoadingGrid />}>
                <Await resolve={questsData}>
                    {(resolved: QuestsTypes) => (
                        <div className="space-y-8">
                            {/* --- TOP STATS --- */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <QuickStat label="Library_Count" val={resolved.total} icon={<Database size={14} />} />
                                <QuickStat label="Network_Source" val={resolved.fromCache ? "MEM_CACHE" : "COLD_STORAGE"} color="text-admin-accent" />
                                <QuickStat label="Active_Page" val={currentPage} />
                                <QuickStat label="Batch_Size" val={resolved.data.length} />
                            </div>

                            {/* --- QUEST GRID --- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                                {resolved.data.length > 0 ? (
                                    resolved.data.map((quest) => (
                                        <QuestCard
                                            key={quest._id}
                                            quest={quest}
                                            onEdit={() => handleEdit(quest)}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full h-64 border border-dashed border-admin-border flex flex-col items-center justify-center text-admin-text-dim">
                                        <Search size={40} className="mb-4 opacity-20" />
                                        <p className="text-xs font-black uppercase tracking-widest">No_Quests_Found_In_This_Sector</p>
                                    </div>
                                )}
                            </div>

                            {/* --- PAGINATION --- */}
                            <Pagination
                                current={currentPage}
                                total={resolved.total}
                                limit={20}
                                onPageChange={(p) => updateFilter("page", p.toString())}
                            />
                        </div>
                    )}
                </Await>
            </Suspense>

            {/* --- DRAWER --- */}
            {isDrawerOpen && (
                <QuestEditorDrawer
                    config={editingQuest}
                    onClose={() => setDrawerOpen(false)}
                    onSave={handleSave}
                    isSubmitting={fetcher.state !== "idle"}
                />
            )}
        </div>
    );
}

/* --- UI SUB-COMPONENTS --- */

function QuestCard({ quest, onEdit }: { quest: Quest, onEdit: () => void }) {
    const CategoryIcon = {
        mental: Brain,
        stalking: Crosshair,
        action: Shield
    }[quest.category];

    return (
        <GlassCard
            onClick={onEdit}
            className={`relative group cursor-pointer overflow-hidden border-t-2 transition-all hover:scale-[1.02] active:scale-95 ${quest.is_foundational ? 'border-t-admin-accent' : 'border-t-admin-primary'
                }`}
        >
            <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="p-2 rounded bg-admin-bg border border-admin-border text-admin-primary">
                        <CategoryIcon size={18} />
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[8px] font-black ${quest.isActive ? 'bg-admin-primary/10 text-admin-primary' : 'bg-admin-error/10 text-admin-error'}`}>
                        {quest.isActive ? "ONLINE" : "OFFLINE"}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-black text-admin-text uppercase group-hover:text-admin-primary transition-colors truncate">
                        {quest.title.en}
                    </h3>
                    <p className="text-[10px] text-admin-text-dim mt-1 line-clamp-2 h-8 italic">
                        {quest.description.en}
                    </p>
                </div>

                <div className="flex flex-wrap gap-1">
                    {quest.psychotype.map(p => (
                        <span key={p} className="px-1.5 py-0.5 bg-admin-panel border border-admin-border text-[7px] font-black text-admin-text uppercase">
                            {p}
                        </span>
                    ))}
                </div>

                <div className="pt-4 border-t border-admin-border/50 flex justify-between items-center">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <Layers size={12} className="text-admin-accent" />
                            <span className="text-[10px] font-black text-admin-text">{quest.expReward}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Zap size={12} className="text-yellow-500" />
                            <span className="text-[10px] font-black text-admin-text">{quest.energyCost}</span>
                        </div>
                    </div>
                    <span className="text-[9px] font-mono text-admin-text-dim">LVL_{quest.minLevel}</span>
                </div>
            </div>

            {quest.is_foundational && (
                <div className="absolute top-0 right-0 p-1">
                    <div className="bg-admin-accent text-admin-bg text-[7px] font-black px-2 py-0.5 uppercase transform rotate-45 translate-x-3 -translate-y-1 shadow-lg">
                        CORE
                    </div>
                </div>
            )}
        </GlassCard>
    );
}

function QuickStat({ label, val, color = "text-admin-text", icon }: { label: string, val: any, color?: string, icon?: React.ReactNode }) {
    return (
        <div className="bg-admin-panel/40 border border-admin-border p-4 rounded-xl relative overflow-hidden group">
            <div className="absolute right-2 top-2 opacity-10 group-hover:opacity-30 transition-opacity">
                {icon}
            </div>
            <p className="text-[8px] font-black text-admin-text-dim uppercase tracking-[0.2em]">{label}</p>
            <p className={`text-xl font-black mt-1 ${color}`}>{val}</p>
        </div>
    );
}

function Pagination({ current, total, limit, onPageChange }: { current: number, total: number, limit: number, onPageChange: (p: number) => void }) {
    const maxPage = Math.ceil(total / limit);
    if (maxPage <= 1) return null;

    return (
        <div className="flex justify-between items-center bg-admin-panel border border-admin-border p-4 rounded-xl">
            <button
                disabled={current === 1}
                onClick={() => onPageChange(current - 1)}
                className="flex items-center gap-2 text-[10px] font-black uppercase text-admin-text hover:text-admin-primary disabled:opacity-20"
            >
                <ChevronLeft size={14} /> Prev_Sector
            </button>

            <div className="flex items-center gap-2">
                <span className="text-xs font-black text-admin-primary">{current}</span>
                <span className="text-[10px] text-admin-text-dim uppercase">of</span>
                <span className="text-xs font-black text-admin-text">{maxPage}</span>
            </div>

            <button
                disabled={current >= maxPage}
                onClick={() => onPageChange(current + 1)}
                className="flex items-center gap-2 text-[10px] font-black uppercase text-admin-text hover:text-admin-primary disabled:opacity-20"
            >
                Next_Sector <ChevronRight size={14} />
            </button>
        </div>
    );
}

function LoadingGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 bg-admin-panel border border-admin-border rounded-xl" />
            ))}
        </div>
    );
}