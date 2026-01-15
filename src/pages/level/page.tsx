import { Suspense, useState } from "react";
import { useLoaderData, Await, useFetcher } from "react-router";
import { LevelNodeCard } from "../../components/cards/lvl";
import { LevelEditorDrawer } from "../../components/drawers/lvl-editor-drawer";
import type { LevelConfigTypes } from "../../types/level-cofig/level-config";
import { GlassCard } from "../../components/cards/card-glass";
import type { ActionResponse } from "../../features/level/level.actions";
import { toast } from "sonner";
import ButtonInitialization from "../../components/ui/button-initialize";

type LevelData = LevelConfigTypes['data'][number];

export default function LevelConfigPage() {
    const { levelConfigData } = useLoaderData() as { levelConfigData: Promise<LevelData[]> };
    const fetcher = useFetcher<ActionResponse>();

    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [editingLevel, setEditingLevel] = useState<LevelData | null>(null);

    // --- RENDER-PHASE ERROR HANDLING ---
    // Instead of modifying fetcher.data, we use fetcher.reset()
    if (fetcher.state === "idle" && fetcher.data) {
        const { success, message, error } = fetcher.data;

        // 1. Extract intent safely before resetting. 
        // We cast to 'any' or 'FormData' to bypass the 'never' check.
        const formData = fetcher.formData as FormData | undefined;
        const intent = formData?.get("intent") || "action";
        const id = formData?.get("id") || "global";

        // 2. Create a stable unique ID
        const toastId = `toast-${intent}-${id}`;

        if (success) {
            toast.success(message || "PROTOCOL_COMPLETE", { id: toastId });
        } else {
            toast.error("PROTOCOL_FAILURE", {
                description: error,
                id: toastId
            });
        }

        // 3. Reset the fetcher so this block doesn't run again on next render
        fetcher.reset();
    }

    const handleDelete = (id: string) => {
        // We removed 'reject' to fix the unused variable error
        toast.promise(new Promise((resolve) => {
            fetcher.submit({ id, intent: "delete" }, { method: "post" });
            resolve(true);
        }), {
            loading: 'EXECUTING_PURGE...',
        });
    };

    const handleSave = (data: Partial<LevelData>) => {
        const intent = editingLevel ? "update" : "create";
        fetcher.submit(
            {
                intent,
                id: editingLevel?._id || "",
                level: String(data.level),
                exp_required: String(data.exp_required),
                is_active: String(data.is_active),
                energy_bonus: String(data.rewards?.energy_bonus ?? 0)
            },
            { method: "post" }
        );
        setDrawerOpen(false);
    };

    const handleToggleActive = (lvl: LevelData) => {
        fetcher.submit(
            {
                id: lvl._id,
                intent: "toggle",
                is_active: String(!lvl.is_active),
            },
            { method: "post" }
        );
    };

    return (
        <Suspense fallback={<div className="p-10 text-admin-primary animate-pulse font-mono uppercase tracking-widest text-center">Initialising_System_Resources...</div>}>
            <Await resolve={levelConfigData}>
                {(resolvedLevels: LevelData[]) => {
                    const sortedLevels = [...resolvedLevels].sort((a, b) => a.level - b.level);
                    const maxExp = Math.max(...sortedLevels.map(l => l.exp_required || 0), 1);

                    return (
                        <div className="p-6 space-y-6 animate-in fade-in duration-500">
                            <div className="flex justify-between items-center">
                                <h1 className="text-2xl font-black text-admin-text uppercase italic tracking-tighter">
                                    Progression_Editor<span className="text-admin-primary">.exe</span>
                                </h1>
                                <ButtonInitialization
                                    onClick={() => { setEditingLevel(null); setDrawerOpen(true); }}
                                />
                            </div>

                            <GlassCard className="p-4 bg-admin-panel/10 border-admin-border/20">
                                <div className="h-24 flex items-end gap-1 px-2 border-l border-b border-admin-border/20">
                                    {sortedLevels.map((l) => (
                                        <div
                                            key={l._id}
                                            className={`flex-1 transition-all duration-500 border-t ${l.is_active ? 'bg-admin-primary/30 border-admin-primary/60' : 'bg-admin-border/20 border-admin-border/40'} hover:scale-105`}
                                            style={{ height: `${((l.exp_required || 0) / maxExp) * 100}%` }}
                                            title={`L.${l.level} (${l.exp_required} XP)`}
                                        />
                                    ))}
                                </div>
                            </GlassCard>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                                {sortedLevels.map((lvl) => (
                                    <LevelNodeCard
                                        key={lvl._id}
                                        config={lvl}
                                        onEdit={() => { setEditingLevel(lvl); setDrawerOpen(true); }}
                                        onDelete={() => handleDelete(lvl._id)}
                                        onToggleActive={() => handleToggleActive(lvl)}
                                        // Specific submittng check for each card
                                        isSubmitting={fetcher.state !== "idle" && fetcher.formData?.get("id") === lvl._id}
                                    />
                                ))}
                            </div>

                            {isDrawerOpen && (
                                <LevelEditorDrawer
                                    key={editingLevel?._id || "new-node"}
                                    config={editingLevel}
                                    onClose={() => setDrawerOpen(false)}
                                    onSave={handleSave}
                                    isSubmitting={fetcher.state !== "idle"}
                                />
                            )}
                        </div>
                    );
                }}
            </Await>
        </Suspense>
    );
}