import { Suspense, useState } from "react";
import { useLoaderData, Await, useFetcher } from "react-router";
import { GlassCard } from "../../components/cards/card-glass";
import { QuestionEditorDrawer } from "../../components/drawers/question-editor-drawer";
import { toast } from "sonner";
import type { QuestionsTypes } from "../../types/questions/questions";
import type { ActionResponse } from "../../features/level/level.actions";
import ButtonInitialization from "../../components/ui/button-initialize";
import { AdminConfirmWrapper } from "../../components/wrapper/wrapper";

type QuestionItem = QuestionsTypes["data"][number];

export default function QuestionsManagementPage() {
    // Correctly typed loader data
    const { questionsData } = useLoaderData() as { questionsData: Promise<QuestionsTypes> };
    const fetcher = useFetcher<ActionResponse>();

    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false)

    // Feedback Logic
    if (fetcher.state === "idle" && fetcher.data) {
        const { success, message, error } = fetcher.data;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formData = fetcher.formData as any;
        const toastId = `q-action-${formData?.get("id") || 'new'}`;

        if (success) {
            toast.success(message || "NEURAL_STRUCTURE_UPDATED", { id: toastId });
        } else {
            toast.error("RECALIBRATION_FAILED", { description: error, id: toastId });
        }
        fetcher.reset();
    }

    const handleDelete = (id: string) => {
        setIsDeleting(true)
        fetcher.submit({ id, intent: "delete" }, { method: "post" }).finally(() => setIsDeleting(false))
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSave = (finalPayload: any) => {
        const intent = editingQuestion ? "update" : "create";
        fetcher.submit(
            {
                intent,
                id: editingQuestion?._id || "",
                payload: JSON.stringify(finalPayload)
            },
            { method: "post" }
        );
        setDrawerOpen(false);
    };

    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-admin-bg font-mono">
                <div className="text-admin-primary animate-pulse tracking-[0.5em] uppercase">
                    Syncing_Neural_Matrix...
                </div>
            </div>
        }>
            <Await resolve={questionsData}>
                {(resolvedResponse: QuestionsTypes) => {

                    const questions = resolvedResponse.data || [];
                    const sortedQuestions = [...questions].sort((a, b) => a.sequence - b.sequence);

                    return (
                        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                            {/* --- HEADER --- */}
                            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-admin-primary/20 pb-8">
                                <div>
                                    <h1 className="text-4xl font-black text-admin-text uppercase italic tracking-tighter">
                                        Psychometric_Nodes<span className="text-admin-primary">.db</span>
                                    </h1>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-[10px] text-admin-primary font-mono bg-admin-primary/10 px-2 py-0.5 border border-admin-primary/20">
                                            TOTAL_ENTRY: {resolvedResponse.total || 0}
                                        </span>
                                        <span className="text-[10px] text-admin-text-dim font-mono uppercase tracking-widest">
                                            Status: Uplink_Active
                                        </span>
                                    </div>
                                </div>
                                <ButtonInitialization
                                    onClick={() => { setEditingQuestion(null); setDrawerOpen(true); }}
                                />
                            </header>

                            {/* --- CONTENT GRID --- */}
                            <div className="grid grid-cols-1 gap-6 pb-24">
                                {sortedQuestions.map((q) => (
                                    <GlassCard
                                        key={q._id}
                                        className={`group relative overflow-hidden transition-all duration-500 hover:border-admin-primary/40 ${!q.isActive ? 'opacity-50 grayscale-[0.5]' : ''
                                            }`}
                                    >
                                        <div className="flex flex-col lg:flex-row items-stretch">
                                            {/* Sequence Number Tag */}
                                            <div className="w-full lg:w-20 bg-admin-primary/5 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-admin-border/50 group-hover:bg-admin-primary/10 transition-colors">
                                                <span className="text-2xl font-black text-admin-primary/40 group-hover:text-admin-primary font-mono">
                                                    {String(q.sequence).padStart(2, '0')}
                                                </span>
                                            </div>

                                            {/* Main Info */}
                                            <div className="flex-1 p-6 flex flex-col md:flex-row gap-6 items-center">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-lg font-bold text-admin-text group-hover:text-admin-primary transition-colors">
                                                            {q.title.en}
                                                        </h3>
                                                        {q.priority && (
                                                            <div className="flex h-2 w-2 rounded-full bg-admin-accent animate-pulse shadow-[0_0_8px_#ff4400]" title="High Priority" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-admin-text-dim font-georgian italic leading-relaxed">
                                                        {q.title.ka}
                                                    </p>
                                                </div>

                                                {/* Meta Indicators */}
                                                <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-admin-border/50 pt-4 md:pt-0 md:pl-6">
                                                    <div className="text-center min-w-20">
                                                        <p className="text-[9px] font-black text-admin-text-dim uppercase tracking-tighter">Options</p>
                                                        <p className="text-xl font-mono font-bold text-admin-text">{q.options.length}</p>
                                                    </div>
                                                    <div className="h-8 w-px bg-admin-border/30" />
                                                    <div className="text-center min-w-20">
                                                        <p className="text-[9px] font-black text-admin-text-dim uppercase tracking-tighter">Status</p>
                                                        <p className={`text-[10px] font-black uppercase ${q.isActive ? 'text-admin-primary' : 'text-admin-error'}`}>
                                                            {q.isActive ? 'Online' : 'Offline'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Side Actions */}
                                            <div className="flex lg:flex-col border-t lg:border-t-0 lg:border-l border-admin-border min-w-35">
                                                {/* EDIT BUTTON */}
                                                <button
                                                    onClick={() => { setEditingQuestion(q); setDrawerOpen(true); }}
                                                    className="flex-1 px-6 py-4 text-[10px] font-black text-admin-text hover:bg-admin-primary hover:text-black transition-all cursor-pointer uppercase tracking-[0.2em] flex items-center justify-center group"
                                                >
                                                    <span className="group-hover:translate-x-1 transition-transform">Edit_Node</span>
                                                </button>

                                                {/* PURGE BUTTON WRAPPER */}
                                                <AdminConfirmWrapper
                                                    title={`TERMINATE_QUESTION::0x${q.sequence}`}
                                                    description="CRITICAL_ACTION: This will permanently purge this question and its psychotype matrix from the central node."
                                                    onConfirm={() => handleDelete(q._id)}
                                                    variant="danger"
                                                    isFixed
                                                    confirmWord="delete"
                                                    isLoading={isDeleting}

                                                >
                                                    <button
                                                        className="w-full h-full px-6 py-4 text-[10px] font-black text-admin-error hover:bg-admin-error hover:text-white transition-all cursor-pointer uppercase tracking-[0.2em] border-l lg:border-l-0 lg:border-t border-admin-border flex items-center justify-center group"
                                                    >
                                                        <span className="group-hover:scale-110 transition-transform">Purge</span>
                                                    </button>
                                                </AdminConfirmWrapper>
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>

                            {/* Drawer */}
                            {isDrawerOpen && (
                                <QuestionEditorDrawer
                                    config={editingQuestion}
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