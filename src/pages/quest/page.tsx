import { Suspense, useState, useEffect } from "react";
import { useLoaderData, Await, useSearchParams, useFetcher } from "react-router";
import {
    Sword, ChevronLeft, ChevronRight, Search, Database,
} from "lucide-react";

// Types
import type { QuestsTypes } from "../../types/quests/quest";
import { QuestEditorDrawer, type QuestFormData } from "../../components/drawers/quest-editor-drawer";
import { toast } from "sonner";
import ButtonInitialization from "../../components/ui/button-initialize";
import QuestCard from "../../components/cards/quest-card";
import { AdminPageHeader, AdminPageShell } from "../../components/admin";
import { useAdminT } from "../../store/locale/locale";

type Quest = QuestsTypes["data"][number];

export default function QuestsPage() {
    const { t } = useAdminT();
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
        <AdminPageShell className="space-y-8 font-mono">
            <AdminPageHeader
                title={t("pages.quests.title")}
                icon={<Sword className="text-admin-primary w-5 h-5" />}
                actions={
                    <div className="flex flex-wrap items-center gap-4">
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
                                    {val === "all" ? t("quests.filter.all") : val === "true" ? t("quests.filter.foundational") : t("quests.filter.daily")}
                                </button>
                            ))}
                        </div>

                        <ButtonInitialization onClick={() => { setEditingQuest(null); setDrawerOpen(true); }} />
                    </div>
                }
            />

            <Suspense fallback={<div className="grid grid-cols-3 gap-6 animate-pulse">{[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-admin-panel rounded-xl" />)}</div>}>
                <Await resolve={questsData}>
                    {(resolved: QuestsTypes) => (
                        <div className="space-y-8">
                            {/* --- STATS BARS --- */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <QuickStat label={t("quests.stats.liveNodes")} val={resolved.total} icon={<Database size={14} />} />
                                <QuickStat label={t("quests.stats.uplinkType")} val={resolved.fromCache ? t("quests.stats.cached") : t("quests.stats.database")} color="text-admin-accent" />
                                <QuickStat label={t("quests.stats.sectorPage")} val={currentPage} />
                                <QuickStat label={t("quests.stats.activeBuffer")} val={resolved.data.length} />
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
                                        <p className="text-xs font-black uppercase tracking-widest">{t("quests.empty")}</p>
                                    </div>
                                )}
                            </div>

                            <Pagination
                                current={currentPage}
                                total={resolved.total}
                                limit={20}
                                onPageChange={(p) => updateFilter("page", p.toString())}
                                t={t}
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
        </AdminPageShell>
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

function Pagination({ current, total, limit, onPageChange, t }: { current: number, total: number, limit: number, onPageChange: (p: number) => void, t: ReturnType<typeof useAdminT>["t"] }) {
    const maxPage = Math.ceil(total / limit);
    if (maxPage <= 1) return null;
    return (
        <div className="flex justify-between items-center bg-admin-panel border border-admin-border p-3 rounded-xl">
            <button disabled={current === 1} onClick={() => onPageChange(current - 1)} className="p-2 border border-admin-border rounded hover:bg-admin-primary/10 disabled:opacity-20 transition-all"><ChevronLeft size={16} /></button>
            <span className="text-[10px] font-black uppercase text-admin-text-dim">{t("quests.pagination", { current, max: maxPage })}</span>
            <button disabled={current >= maxPage} onClick={() => onPageChange(current + 1)} className="p-2 border border-admin-border rounded hover:bg-admin-primary/10 disabled:opacity-20 transition-all"><ChevronRight size={16} /></button>
        </div>
    );
}