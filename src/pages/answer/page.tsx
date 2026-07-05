import { Suspense, useState } from "react";
import { useLoaderData, Await, useSearchParams } from "react-router";
import { GlassCard } from "../../components/cards/card-glass";
import { Search, Activity, Cpu, ChevronLeft, ChevronRight } from "lucide-react";
import type { AnswersTypes } from "../../types/answer/answer";
import { AdminPageHeader, AdminPageShell } from "../../components/admin";
import { useAdminT } from "../../store/locale/locale";

type AnswerSession = AnswersTypes["data"][number];

export default function AnswersManagementPage() {
    const { t } = useAdminT();
    const { answersData } = useLoaderData() as { answersData: Promise<AnswersTypes> };
    const [searchParams, setSearchParams] = useSearchParams();

    /* --- Pagination Control --- */
    const currentPage = Number(searchParams.get("page")) || 1;
    const currentLimit = Number(searchParams.get("limit")) || 20;

    /* --- Local UI State --- */
    const [searchTerm, setSearchTerm] = useState("");

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", newPage.toString());
        setSearchParams(params);
    };

    return (
        <AdminPageShell className="space-y-8">
            <AdminPageHeader
                title={t("pages.answers.title")}
                icon={<Cpu className="text-admin-primary w-5 h-5" />}
                actions={
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-admin-primary" />
                        <input
                            type="text"
                            placeholder={t("answers.searchPlaceholder")}
                            className="w-full bg-admin-panel border border-admin-border rounded-lg pl-10 pr-4 py-2.5 text-[10px] font-mono text-admin-text focus:border-admin-primary outline-none"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                }
            />

            <Suspense fallback={<LoadingState />}>
                <Await resolve={answersData}>
                    {(resolved: AnswersTypes) => {
                        const totalPages = Math.ceil(resolved.total / currentLimit);

                        // Local filter for the already-fetched batch
                        const filteredData = resolved.data.filter(session =>
                            session.user_id?.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            session.user_id?.email?.toLowerCase().includes(searchTerm.toLowerCase())
                        );

                        return (
                            <div className="space-y-6">
                                {/* --- VITAL STATS --- */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatsMini label={t("answers.stats.globalRecords")} val={resolved.total.toLocaleString()} />
                                    <StatsMini label={t("answers.stats.currentBatch")} val={filteredData.length} color="text-admin-primary" />
                                    <StatsMini label={t("answers.stats.totalPages")} val={totalPages} />
                                    <StatsMini label={t("answers.stats.dataSource")} val={resolved.fromCache ? t("answers.stats.cache") : t("answers.stats.dbLive")} />
                                </div>

                                {/* --- DATA LIST --- */}
                                <div className="grid grid-cols-1 gap-4">
                                    {filteredData.length > 0 ? (
                                        filteredData.map((session) => (
                                            <AnswerRow key={session._id} session={session} />
                                        ))
                                    ) : (
                                        <div className="h-40 border border-dashed border-admin-border rounded-xl flex items-center justify-center text-admin-text-dim text-[10px] uppercase font-bold">
                                            {t("answers.empty")}
                                        </div>
                                    )}
                                </div>

                                {/* --- PAGINATION NAV --- */}
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-admin-panel/40 p-4 border border-admin-border rounded-xl mt-12">
                                    <button
                                        disabled={currentPage <= 1}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        className="flex items-center gap-2 px-6 py-2 bg-admin-bg border border-admin-border rounded text-[10px] font-black uppercase hover:border-admin-primary transition-all disabled:opacity-20"
                                    >
                                        <ChevronLeft size={14} /> {t("answers.prevBatch")}
                                    </button>

                                    <div className="flex items-center gap-4 font-mono">
                                        <div className="text-center">
                                            <p className="text-[11px] text-admin-text-dim uppercase leading-none mb-1">{t("answers.currentIndex")}</p>
                                            <p className="text-lg font-black text-admin-primary">{currentPage} <span className="text-admin-text-dim text-xs">/ {totalPages}</span></p>
                                        </div>
                                    </div>

                                    <button
                                        disabled={currentPage >= totalPages}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        className="flex items-center gap-2 px-6 py-2 bg-admin-bg border border-admin-border rounded text-[10px] font-black uppercase hover:border-admin-primary transition-all disabled:opacity-20"
                                    >
                                        {t("answers.nextBatch")} <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    }}
                </Await>
            </Suspense>
        </AdminPageShell>
    );
}

/* --- SUB-COMPONENTS --- */

function AnswerRow({ session }: { session: AnswerSession }) {
    const { t } = useAdminT();
    const [showRaw, setShowRaw] = useState(false);

    return (
        <GlassCard className={`overflow-hidden transition-all duration-300 ${session.isCombinedClass ? 'border-l-4 border-l-admin-accent' : 'border-l-4 border-l-admin-primary'}`}>
            <div className="p-5 flex flex-col xl:flex-row gap-6">
                {/* 1. Subject Info (Handles NULL User) */}
                <div className="xl:w-72 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center font-black text-lg ${session.user_id ? 'bg-admin-primary/10 text-admin-primary border border-admin-primary/20' : 'bg-admin-error/10 text-admin-error border border-admin-error/20'}`}>
                            {session.user_id?.nickname?.charAt(0) || "?"}
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="text-sm font-black text-admin-text uppercase truncate">
                                {session.user_id?.nickname || t("answers.redactedSubject")}
                            </h4>
                            <p className="text-[11px] font-mono text-admin-text-dim truncate">
                                {session.user_id?.email || "ID: " + session._id}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-mono">
                        <div className="p-2 bg-admin-bg/50 border border-admin-border rounded flex flex-col items-center">
                            <span className="text-[9px] text-admin-text-dim uppercase font-bold">{t("answers.archetype")}</span>
                            <span className="text-[12px] font-black text-admin-accent italic">{session.finalPsychotype}</span>
                        </div>
                        <div className="p-2 bg-admin-bg/50 border border-admin-border rounded flex flex-col items-center">
                            <span className="text-[9px] text-admin-text-dim uppercase font-bold">{t("answers.vote")}</span>
                            <span className="text-[12px] font-black text-admin-primary">{session.geminiVote}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Intelligence Area */}
                <div className="flex-1 space-y-4">
                    <div className="bg-admin-bg/40 p-4 rounded-xl border border-admin-border/50 relative">
                        <Activity className="absolute right-3 top-3 w-3 h-3 text-admin-primary/30" />
                        <p className="text-[10px] font-black text-admin-primary uppercase mb-2">{t("answers.geminiReasoning")}</p>
                        <p className="text-[12px] text-admin-text leading-relaxed italic opacity-80">
                            "{session.gemini_decisionReason}"
                        </p>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        {Object.entries(session?.percentageScores ?? {}).map(([key, val]) => (
                            <div key={key} className="space-y-1.5">
                                <div className="flex justify-between text-[9px] font-black uppercase text-admin-text-dim">
                                    <span>{key.slice(0, 3)}</span>
                                    <span>{val}%</span>
                                </div>
                                <div className="h-1 w-full bg-admin-border rounded-full overflow-hidden">
                                    <div className="h-full bg-admin-primary" style={{ width: `${val}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Metadata & Actions */}
                <div className="xl:w-48 flex flex-row xl:flex-col justify-between items-center xl:items-end border-t xl:border-t-0 xl:border-l border-admin-border/30 pt-4 xl:pt-0 xl:pl-6">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-admin-text-dim uppercase">{t("answers.syncDate")}</p>
                        <p className="text-[12px] font-mono text-admin-text">{new Date(session.created_at).toLocaleDateString()}</p>
                    </div>
                    <button
                        onClick={() => setShowRaw(!showRaw)}
                        className="px-4 py-2 bg-admin-panel border border-admin-border text-[10px] font-black text-admin-primary rounded uppercase hover:bg-admin-primary hover:text-black transition-all"
                    >
                        {showRaw ? t("answers.closeScan") : t("answers.rawData")}
                    </button>
                </div>
            </div>

            {showRaw && (
                <div className="bg-black/40 border-t border-admin-border p-5 grid grid-cols-2 md:grid-cols-5 gap-3 animate-in slide-in-from-top duration-300">
                    {session.answers.map((ans, i) => (
                        <div key={ans._id} className="p-2 border border-admin-border/30 rounded flex items-center justify-between bg-admin-panel/20">
                            <span className="text-[10px] font-bold text-admin-text-dim">{t("answers.questionLabel", { num: i + 1 })}</span>
                            <span className="text-[12px] font-mono text-admin-primary">SEQ_{ans.selectedOptionSequence}</span>
                        </div>
                    ))}
                </div>
            )}
        </GlassCard>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StatsMini({ label, val, color = "text-admin-text" }: { label: string, val: any, color?: string }) {
    return (
        <div className="bg-admin-panel/50 border border-admin-border p-4 rounded-xl flex justify-between items-center">
            <span className="text-[11px] font-black text-admin-text-dim uppercase tracking-widest">{label}</span>
            <span className={`text-sm font-mono font-bold ${color}`}>{val}</span>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-admin-panel/50 border border-admin-border rounded-xl animate-pulse" />
            ))}
        </div>
    );
}