import type { RecentAnswer } from "../../types/stats/dashboard";

export const CalibrationTable = ({ items }: { items: RecentAnswer[] }) => (
    <div className="bg-admin-card border border-admin-border rounded-3xl overflow-hidden h-full">
        <div className="p-5 border-b border-admin-border bg-admin-panel/50">
            <h3 className="font-bold text-admin-text text-sm uppercase tracking-wider">Calibration Watch (2026)</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="text-[10px] uppercase text-admin-text-dim bg-admin-bg/30">
                    <tr>
                        <th className="p-4">Subject</th>
                        <th className="p-4">Psychometric Result</th>
                        <th className="p-4">AI Consensus</th>
                        <th className="p-4">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-admin-border/50">
                    {items.map((answer) => (
                        <tr key={answer._id} className="hover:bg-admin-primary/5 transition-colors group">
                            <td className="p-4">
                                <div className="text-sm font-semibold text-admin-text">
                                    {answer.user_id?.nickname || "Unknown"}
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-bold text-admin-primary uppercase tracking-tight">
                                        {answer.finalPsychotype}
                                    </span>
                                    {/* Handle the optional subPsychotype safely */}
                                    {answer.subPsychotype && (
                                        <span className="text-[10px] text-admin-text-dim font-medium uppercase italic">
                                            Sub: {answer.subPsychotype}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${answer.geminiVote === answer.finalPsychotype
                                        ? 'bg-admin-success/10 border-admin-success text-admin-success'
                                        : 'bg-admin-warning/10 border-admin-warning text-admin-warning'
                                        }`}>
                                        {answer.geminiVote}
                                    </span>
                                </div>
                            </td>
                            <td className="p-4 text-[11px] text-admin-text-dim">
                                {new Date(answer.created_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);