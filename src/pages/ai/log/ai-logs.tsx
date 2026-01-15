import { useState } from "react";
import { PsychotypeBadge } from "../../../components/ui/psychotypeBadge";
import { GlassCard } from "../../../components/cards/card-glass";

const MOCK_LOGS = [
    {
        _id: "log_1",
        user_nickname: "Stalker_77",
        finalPsychotype: "STALKER",
        subPsychotype: "WARRIOR",
        isCombinedClass: true,
        gemini_decisionReason: "User shows high adaptability (85%) with aggressive problem-solving tendencies. Transition from observation to action is seamless.",
        created_at: "2026-01-10T22:15:00Z",
        status: "approved"
    },
    {
        _id: "log_2",
        user_nickname: "Nexus_Prime",
        finalPsychotype: "ARCHITECT",
        isCombinedClass: false,
        gemini_decisionReason: "Strong preference for structural integrity and system-based logic. Minimal emotional variance detected in response set.",
        created_at: "2026-01-10T22:10:00Z",
        status: "flagged"
    }
];

export default function AIGeminiLogsPage() {
    const [selectedLog, setSelectedLog] = useState<typeof MOCK_LOGS[0] | null>(null);

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black text-admin-text uppercase tracking-tighter italic">
                    Neural <span className="text-admin-primary">Decision Logs</span>
                </h1>
                <div className="text-[10px] font-bold text-admin-text-dim uppercase bg-admin-panel border border-admin-border px-3 py-1 rounded-full">
                    Live Stream: <span className="text-admin-success">Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Logs Table (Main Stream) */}
                <div className="lg:col-span-2 space-y-4">
                    {MOCK_LOGS.map((log) => (
                        <div
                            key={log._id}
                            onClick={() => setSelectedLog(log)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer group
                                ${selectedLog?._id === log._id
                                    ? 'bg-admin-primary/10 border-admin-primary'
                                    : 'bg-admin-panel/40 border-admin-border hover:border-admin-text-dim/30'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-admin-card border border-admin-border flex items-center justify-center text-[10px] font-bold text-admin-primary">
                                        ID
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-admin-text italic">{log.user_nickname}</p>
                                        <p className="text-[10px] text-admin-text-dim">{new Date(log.created_at).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                                <PsychotypeBadge type={log.finalPsychotype} />
                            </div>
                            <p className="text-xs text-admin-text-dim line-clamp-1 italic opacity-60 group-hover:opacity-100 transition-opacity">
                                "{log.gemini_decisionReason}"
                            </p>
                        </div>
                    ))}
                </div>

                {/* Detail View (The "Black Box" Inspector) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        {selectedLog ? (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <GlassCard glow hoverable className="border-admin-primary/20">
                                    <h3 className="text-xs font-black text-admin-primary uppercase tracking-[0.2em] mb-4">Decision Path</h3>

                                    <div className="space-y-4">
                                        <div className="p-3 bg-admin-bg/50 rounded-lg border border-admin-border">
                                            <p className="text-[10px] text-admin-text-dim uppercase font-bold mb-1">Reasoning Architecture</p>
                                            <p className="text-xs text-admin-text leading-relaxed italic">
                                                {selectedLog.gemini_decisionReason}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-admin-bg/50 rounded-lg border border-admin-border">
                                                <p className="text-[10px] text-admin-text-dim uppercase font-bold mb-1">Combined Class</p>
                                                <p className={`text-xs font-black ${selectedLog.isCombinedClass ? 'text-admin-success' : 'text-admin-text-muted'}`}>
                                                    {selectedLog.isCombinedClass ? "TRUE" : "FALSE"}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-admin-bg/50 rounded-lg border border-admin-border">
                                                <p className="text-[10px] text-admin-text-dim uppercase font-bold mb-1">Sub-Type</p>
                                                <p className="text-xs font-black text-admin-accent uppercase">
                                                    {selectedLog.subPsychotype || "None"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="w-full mt-6 py-2 bg-admin-card hover:bg-admin-error/10 border border-admin-border hover:border-admin-error/50 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer">
                                        Flag Decision for Review
                                    </button>
                                </GlassCard>
                            </div>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-admin-border rounded-2xl text-admin-text-dim">
                                <div className="w-12 h-12 rounded-full border border-admin-border animate-ping mb-4 opacity-20" />
                                <p className="text-[10px] uppercase tracking-widest font-bold">Select Log to Inspect</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}