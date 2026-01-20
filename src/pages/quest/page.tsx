import { Suspense, useState, useEffect } from "react";
import { useLoaderData, Await, useSearchParams, useFetcher } from "react-router";
import {
    Sword, ChevronLeft, ChevronRight, Search, Database, Activity,
} from "lucide-react";

// Types
import type { QuestsTypes } from "../../types/quests/quest";
import { QuestEditorDrawer, type QuestFormData } from "../../components/drawers/quest-editor-drawer";
import { toast } from "sonner";
import ButtonInitialization from "../../components/ui/button-initialize";
import QuestCard from "../../components/cards/quest-card";

type Quest = QuestsTypes["data"][number];

export default function QuestsPage() {
    const { questsData } = useLoaderData() as { questsData: Promise<QuestsTypes> };
    const [searchParams, setSearchParams] = useSearchParams();
    const fetcher = useFetcher();

    // --- State for Drawer ---
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [editingQuest, setEditingQuest] = useState<QuestFormData | null>(null);

    // --- URL Params & Filtering ---
    const currentPage = Number(searchParams.get("page")) || 1;
    const foundationalFilter = searchParams.get("is_foundational") || "all";

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set(key, value);
        if (key !== "page") params.set("page", "1");
        setSearchParams(params);
    };

    // --- Action Handlers ---
    useEffect(() => {
        if (fetcher.data?.success) {
            toast.success(fetcher.data.message);
        } else if (fetcher.data?.error) {
            toast.error(fetcher.data.error);
        }
    }, [fetcher.data]);

    const handleSave = (data: QuestFormData) => {
        const isUpdate = !!editingQuest?._id;
        const formData = new FormData();

        formData.append("intent", isUpdate ? "update" : "create");
        if (isUpdate) formData.append("id", editingQuest._id!);

        // Match your action's requirement: JSON stringified payload
        formData.append("payload", JSON.stringify(data));

        fetcher.submit(formData, { method: "POST" });
        setDrawerOpen(false);
    };

    const handleDelete = (id: string) => {
        const formData = new FormData();
        formData.append("intent", "delete");
        formData.append("id", id);
        fetcher.submit(formData, { method: "POST" });
    };

    const handleEditOpen = (quest: Quest) => {
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
                        Quest_Nodes<span className="text-admin-primary">.db</span>
                    </h1>
                    <div className="flex items-center gap-4">
                        <Suspense fallback={<div className="h-4 w-20 bg-admin-panel animate-pulse" />}>
                            <Await resolve={questsData}>
                                {(res) => (
                                    <span className="text-[12px] text-admin-primary font-mono bg-admin-primary/10 px-2 py-0.5 border border-admin-primary/20">
                                        TOTAL_RECORDS: {res.total || 0}
                                    </span>
                                )}
                            </Await>
                        </Suspense>
                        <span className="text-[12px] text-admin-text-dim font-mono uppercase tracking-widest flex items-center gap-2">
                            <Activity size={10} className="text-admin-accent animate-pulse" /> System_Online
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* --- TOGGLE FILTER --- */}
                    <div className="flex gap-1 p-1 bg-admin-panel rounded-lg border border-admin-border">
                        {["all", "true", "false"].map((val) => (
                            <button
                                key={val}
                                onClick={() => updateFilter("is_foundational", val)}
                                className={`px-4 py-1.5 rounded text-[11.5px] cursor-pointer font-black tracking-wider uppercase transition-all ${foundationalFilter === val
                                    ? 'bg-admin-primary text-admin-bg shadow-lg shadow-admin-primary/20'
                                    : 'text-admin-text-dim hover:text-admin-text'
                                    }`}
                            >
                                {val === "all" ? "All" : val === "true" ? "Foundational" : "Daily"}
                            </button>
                        ))}
                    </div>

                    <ButtonInitialization onClick={() => { setEditingQuest(null); setDrawerOpen(true); }} />
                </div>
            </header>

            <Suspense fallback={<div className="grid grid-cols-3 gap-6 animate-pulse">{[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-admin-panel rounded-xl" />)}</div>}>
                <Await resolve={questsData}>
                    {(resolved: QuestsTypes) => (
                        <div className="space-y-8">
                            {/* --- STATS BARS --- */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <QuickStat label="Live_Nodes" val={resolved.total} icon={<Database size={14} />} />
                                <QuickStat label="Uplink_Type" val={resolved.fromCache ? "CACHED" : "DATABASE"} color="text-admin-accent" />
                                <QuickStat label="Sector_Page" val={currentPage} />
                                <QuickStat label="Active_Buffer" val={resolved.data.length} />
                            </div>

                            {/* --- GRID --- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                                {resolved.data.length > 0 ? (
                                    resolved.data.map((quest) => (
                                        <QuestCard
                                            key={quest._id}
                                            quest={quest}
                                            onEdit={() => handleEditOpen(quest)}
                                            onDelete={() => handleDelete(quest._id)}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full h-64 border border-dashed border-admin-border flex flex-col items-center justify-center opacity-40">
                                        <Search size={40} className="mb-2" />
                                        <p className="text-xs font-black uppercase tracking-widest">No_Nodes_Detected</p>
                                    </div>
                                )}
                            </div>

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

/* --- SUB-COMPONENTS --- */


// eslint-disable-next-line @typescript-eslint/no-explicit-any
function QuickStat({ label, val, color = "text-admin-text", icon }: { label: string, val: any, color?: string, icon?: React.ReactNode }) {
    return (
        <div className="bg-admin-panel/40 border border-admin-border p-4 rounded-xl relative overflow-hidden">
            <div className="absolute right-2 top-2 opacity-5">{icon}</div>
            <p className="text-[11px] font-black text-admin-text-dim uppercase tracking-widest">{label}</p>
            <p className={`text-xl font-black mt-1 ${color}`}>{val}</p>
        </div>
    );
}

function Pagination({ current, total, limit, onPageChange }: { current: number, total: number, limit: number, onPageChange: (p: number) => void }) {
    const maxPage = Math.ceil(total / limit);
    if (maxPage <= 1) return null;
    return (
        <div className="flex justify-between items-center bg-admin-panel border border-admin-border p-3 rounded-xl">
            <button disabled={current === 1} onClick={() => onPageChange(current - 1)} className="p-2 border border-admin-border rounded hover:bg-admin-primary/10 disabled:opacity-20 transition-all"><ChevronLeft size={16} /></button>
            <span className="text-[10px] font-black uppercase text-admin-text-dim">Sector {current} // {maxPage}</span>
            <button disabled={current >= maxPage} onClick={() => onPageChange(current + 1)} className="p-2 border border-admin-border rounded hover:bg-admin-primary/10 disabled:opacity-20 transition-all"><ChevronRight size={16} /></button>
        </div>
    );
}