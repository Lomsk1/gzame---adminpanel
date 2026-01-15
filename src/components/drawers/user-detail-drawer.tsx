import useSWR from "swr";
import axiosAuth from "../../helper/axios";
import type { AnswersTypes } from "../../types/answer/answer";
import { PSYCHOTYPE_CONFIG, type Psychotype, type UsersDataType } from "../../types/user/user";
import { ButtonComponent } from "../form/button";
import { AdminConfirmWrapper } from "../wrapper/wrapper";
import { useState } from "react";
import { toast } from "sonner";
import { useRevalidator } from "react-router";
import type { UserActivityLogsType } from "../../types/logs/log";
import useUserStore from "../../store/user/user";
import ButtonCloseDrawer from "../ui/button-close-drawer";


interface UserDetailDrawerProps {
    user: UsersDataType['data'][0]
    onClose: () => void;
}

const fetcher = (url: string) => axiosAuth.get(url).then(res => res.data);

export const UserDetailDrawer = ({ user, onClose }: UserDetailDrawerProps) => {
    const revalidator = useRevalidator();

    /* Store */
    const adminStore = useUserStore((state) => state.user);

    /* States */
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [adminNote, setAdminNote] = useState(user.admin_notes || "");
    const [showDirectiveModal, setShowDirectiveModal] = useState<boolean>(false);
    const [directiveMessage, setDirectiveMessage] = useState("");
    const [actionUrlMessage, setActionUrlMessage] = useState("");
    const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");

    // Neural Analysis Fetch (Lazy)
    const { data: response, isLoading } = useSWR<AnswersTypes>(
        user._id ? `/api/v1/answer?user_id=${user._id}` : null,
        user._id ? fetcher : null,
        {
            revalidateOnFocus: false,
            errorRetryCount: 3,
            dedupingInterval: 300000,
            revalidateOnReconnect: true,
            onError: () => {
                toast.error("NEURAL_LINK_FAILURE", {
                    description: "Could not retrieve psychotype matrix."
                });
            }
        }
    );

    /* User Activity */
    const { data: userActivity, isLoading: userActivityIsLoading } = useSWR<UserActivityLogsType>(
        user._id ? `/api/v1/log/user-activity/${user._id}` : null,
        user._id ? fetcher : null,
        {
            revalidateOnFocus: false,
            errorRetryCount: 3,
            dedupingInterval: 300000,
            revalidateOnReconnect: true,
            onError: () => {

            }
        }
    );

    const latestSession = response?.data?.[0];

    const scoreMatrix = Object.entries(PSYCHOTYPE_CONFIG)
        .filter(([key]) => key !== 'PENDING')
        .map(([key, config]) => ({
            label: key as Exclude<Psychotype, 'PENDING'>,
            val: response?.data[0]['percentageScores'][key as Exclude<Psychotype, 'PENDING'>] || 0,
            color: config.bg
        }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAction = async (apiEndpoint: string, body: any, successMsg: string) => {
        setIsProcessing(true);

        // Create a unique ID for the toast so we can update it
        const toastId = toast.loading("INITIALIZING_COMMAND...");

        try {
            await axiosAuth.patch(apiEndpoint, body);
            revalidator.revalidate();

            toast.success(successMsg.toUpperCase(), {
                id: toastId,
                description: `Neural parameters updated for ${user.nickname}`,
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Operation Failed:", err);
            toast.error("COMMAND_REJECTED", {
                id: toastId,
                description: err.response?.data?.message || "System uplink failure.",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    /* Notification Handler */
    const handleSendNotification = async () => {
        if (!directiveMessage.trim()) return toast.error("DIRECTIVE_REQUIRED");

        setIsProcessing(true);
        const toastId = toast.loading("TRANSMITTING_SIGNAL...");

        try {
            await axiosAuth.post('/api/v1/notification', {
                user_id: user._id,
                sender_id: adminStore?._id,
                content: directiveMessage,
                type: 'SYSTEM_DIRECTIVE',
                priority: priority,
                actionUrl: actionUrlMessage
            });

            toast.success("SIGNAL_RECEIVED", { id: toastId });
            setShowDirectiveModal(false);
            setDirectiveMessage("");
            setActionUrlMessage("")
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            toast.error("SIGNAL_LOST", { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };

    /* Admin Log */

    const saveNote = async () => {
        const toastId = toast.loading("SYNCING_INTERNAL_LOG...");
        try {
            // await axiosAuth.patch(`/api/v1/admin/users/${user._id}/notes`, { note: adminNote });
            toast.success("LOG_UPDATED", { id: toastId });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            toast.error("SYNC_FAILURE", { id: toastId });
        }
    };
    const executeMacro = async (type: string) => {
        const toastId = toast.loading(`INITIATING_${type}_SEQUENCE...`);

        try {
            // Example: logic to determine endpoint based on type
            // const endpoint = type === 'STABILIZE'
            //     ? `/api/v1/admin/users/${user._id}/stabilize`
            //     : `/api/v1/admin/users/${user._id}/elevate`;

            // await axiosAuth.post(endpoint);
            // revalidator.revalidate();

            toast.success(`${type}_COMPLETE`, {
                id: toastId,
                description: `System parameters for ${user.nickname} have been recalibrated.`
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            toast.error(`${type}_FAILED`, { id: toastId });
        }
    };

    const handleWarn = async () => {
        const toastId = toast.loading("ISSUING_FORMAL_WARNING...");
        try {
            // 1. Update the database flag
            // await axiosAuth.patch(`/api/v1/admin/users/${user._id}/status`, {
            //     isFlagged: true,
            //     warningLevel: 'MEDIUM'
            // });

            // 2. Trigger the "Neural Inconsistency" Alert
            // await axiosAuth.post('/api/v1/notifications/send', {
            //     recipientId: user._id,
            //     content: "Neural Inconsistency Detected. Your account has been flagged for manual review by the Oversight.",
            //     type: 'SYSTEM_DIRECTIVE',
            //     priority: 'HIGH'
            // });

            // revalidator.revalidate();
            toast.error("ENTITY_WARNED", {
                id: toastId,
                description: "Warning signal transmitted and account flagged."
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            toast.error("TRANSMISSION_FAILED", { id: toastId });
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex justify-end">
                <div className="absolute inset-0 bg-admin-bg/85 backdrop-blur-md animate-in fade-in" onClick={onClose} />

                <div className="relative w-full max-w-md h-screen bg-admin-panel border-l border-admin-border flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">

                    {/* --- HEADER --- */}
                    <div className="p-6 border-b border-admin-border flex justify-between items-center bg-admin-bg/20">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-black uppercase tracking-tighter italic text-admin-primary">User Dossier</h2>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded border font-black tracking-widest ${user.role === 'admin' ? 'bg-admin-accent/20 border-admin-accent text-admin-accent' : 'bg-admin-text-dim/10 border-admin-border text-admin-text-dim'}`}>
                                    {user.role.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-[10px] font-mono text-admin-text-dim">{user._id} / IP: {user.signup_ip || "0.0.0.0"}</p>
                        </div>
                        <ButtonCloseDrawer onClose={onClose} />
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {/* --- 1. NEURAL DATA (SWR) --- */}
                        <section className="space-y-4">
                            <label className="text-[9px] font-black text-admin-primary uppercase tracking-[0.2em] block">AI Neural Analysis</label>
                            {isLoading ? (
                                <div className="h-24 animate-pulse bg-admin-bg rounded-xl border border-admin-border" />
                            ) : latestSession ? (
                                <div className="space-y-3">
                                    <div className="p-4 rounded-xl bg-admin-primary/5 border border-admin-primary/20">
                                        <p className="text-[8px] font-black text-admin-primary uppercase mb-2">Gemini_Decision_Log:</p>
                                        <p className="text-[11px] text-admin-text italic leading-relaxed">"{latestSession.gemini_decisionReason}"</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-2 bg-admin-card border border-admin-border rounded flex flex-col items-center">
                                            <span className="text-[7px] text-admin-text-dim uppercase font-bold">Class</span>
                                            <span className="text-xs font-black text-admin-accent">{latestSession.finalPsychotype}</span>
                                        </div>
                                        <div className="p-2 bg-admin-card border border-admin-border rounded flex flex-col items-center">
                                            <span className="text-[7px] text-admin-text-dim uppercase font-bold">Combined</span>
                                            <span className="text-xs font-black text-admin-text">{latestSession.isCombinedClass ? "YES" : "NO"}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-[10px] text-admin-text-dim italic border border-dashed border-admin-border p-4 rounded-xl text-center">NO_SESSION_DATA</div>
                            )}
                        </section>

                        {/* --- 2. PROGRESSION & ENERGY --- */}
                        <section className="space-y-4">
                            <label className="text-[9px] font-black text-admin-accent uppercase tracking-[0.2em] block">Vital Stats & Progression</label>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-2 bg-admin-bg border border-admin-border rounded">
                                    <p className="text-[7px] font-bold text-admin-text-dim uppercase">Energy</p>
                                    <p className="text-sm font-black text-admin-warning">{user.energyPoints} <span className="text-[8px]">PTS</span></p>
                                </div>
                                <div className="p-2 bg-admin-bg border border-admin-border rounded">
                                    <p className="text-[7px] font-bold text-admin-text-dim uppercase">Level</p>
                                    <p className="text-sm font-black text-admin-primary">LVL {user.currentLevel}</p>
                                </div>
                                <div className="p-2 bg-admin-bg border border-admin-border rounded">
                                    <p className="text-[7px] font-bold text-admin-text-dim uppercase">EXP</p>
                                    <p className="text-sm font-black text-admin-text">{user.currentEXP}</p>
                                </div>
                            </div>
                        </section>

                        {/* --- 3. PSYCHOTYPE MATRIX --- */}
                        <section className="space-y-4">
                            <label className="text-[9px] font-black text-admin-accent uppercase tracking-[0.2em] block">Calibration Matrix</label>
                            <div className="space-y-3 bg-admin-bg/40 p-4 rounded-xl border border-admin-border/50">
                                {scoreMatrix.map((m) => (
                                    <div key={m.label} className="space-y-1">
                                        <div className="flex justify-between text-[9px] font-black uppercase">
                                            <span className="text-admin-text-dim">{m.label}</span>
                                            <span className="text-admin-text">{m.val}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-admin-border rounded-full overflow-hidden">
                                            <div className={`h-full ${m.color} transition-all duration-1000`} style={{ width: `${m.val}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* --- 4. TRAUMA & BIO & WORKING_SPACE --- */}
                        <section className="space-y-4">
                            <div className="p-4 rounded-xl bg-admin-error/5 border border-admin-error/20">
                                <label className="text-[8px] font-black text-admin-error uppercase mb-1 block">Core Trauma</label>
                                <p className="text-xs font-bold text-admin-text leading-tight">{user.greatestPain || "UNSTATED"}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-admin-bg border border-admin-border">
                                <label className="text-[8px] font-black text-admin-primary uppercase mb-1 block">Bio Packet</label>
                                <p className="text-xs text-admin-text-dim italic leading-relaxed">"{user.bio || "No directive established."}"</p>
                            </div>
                            <div className="p-4 rounded-xl bg-admin-bg border border-admin-border">
                                <label className="text-[8px] font-black text-admin-primary uppercase mb-1 block">Working Space</label>
                                <p className="text-xs text-admin-text-dim italic leading-relaxed">"{user.profile.workingSpace || "No directive established."}"</p>
                            </div>
                        </section>

                        {/* --- 5. TECHNICAL/SECURITY --- */}
                        <section className="p-4 rounded-xl bg-admin-bg/40 border border-admin-border/50 space-y-2">
                            <div className="flex justify-between text-[10px] font-mono">
                                <span className="text-admin-text-dim">CREATED:</span>
                                <span className="text-admin-text">{new Date(user.created_at).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-mono">
                                <span className="text-admin-text-dim">ACTIVATED:</span>
                                <span className={`font-bold ${user.email_activation ? 'text-admin-success' : 'text-admin-error'}`}>
                                    {user.email_activation ? 'TRUE' : 'FALSE'}
                                </span>
                            </div>
                            <div className="flex justify-between text-[10px] font-mono">
                                <span className="text-admin-text-dim">SUB_STATUS:</span>
                                <span className={`font-bold ${user.isSubscribed ? 'text-admin-accent' : 'text-admin-text-dim'}`}>
                                    {user.isSubscribed ? 'ACTIVE_SUBSCRIBER' : 'FREE_TIER'}
                                </span>
                            </div>
                            <div className="flex justify-between text-[10px] font-mono">
                                <span className="text-admin-text-dim">BIRTH_DATE:</span>
                                <span className="text-admin-text">{new Date(user.created_at).toLocaleString()}</span>
                            </div>
                        </section>

                        {/* --- ACTIONS --- */}
                        <div className="pt-6 space-y-3">
                            {user.role === "user" && (
                                <AdminConfirmWrapper
                                    title="Elevate Permissions"
                                    description={`You are about to grant ${user.nickname} administrative privileges. This entity will be able to modify system parameters.`}
                                    confirmText="GRANT_ACCESS"
                                    onConfirm={() => handleAction(`/api/v1/auth/users/give-admin/${user._id}`, { role: "admin" }, "Permissions Elevated")}
                                    isLoading={isProcessing}
                                >
                                    <ButtonComponent
                                        variant="secondary"
                                        className="w-full text-[10px] border-admin-accent/50 text-admin-accent hover:bg-admin-accent/10"
                                    >
                                        PROMOTE_TO_ADMIN
                                    </ButtonComponent>
                                </AdminConfirmWrapper>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                                <ButtonComponent variant="secondary" size="sm" className="bg-admin-card border-admin-border text-[10px]">
                                    RESET_ENERGY
                                </ButtonComponent>
                                <ButtonComponent variant="secondary" size="sm" className="bg-admin-card border-admin-border text-[10px]">
                                    BLOCK_ENTITY
                                </ButtonComponent>
                            </div>
                            <ButtonComponent variant="oracle" size="sm" className="w-full text-[10px]" onClick={() => setShowDirectiveModal(true)}>
                                BROADCAST_DIRECTIVE
                            </ButtonComponent>
                        </div>

                        {/* Admin Note */}
                        <div className="pt-6 space-y-3">
                            <section className="space-y-3 pt-4 border-t border-admin-border/30">
                                <label className="text-[9px] font-black text-admin-primary uppercase tracking-widest block">Internal_Admin_Notes</label>
                                <textarea
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder="Enter internal observations..."
                                    className="w-full h-20 bg-black/40 border border-admin-border/50 p-2 text-[10px] text-admin-text-dim font-mono focus:border-admin-accent outline-none"
                                />
                                <ButtonComponent variant="secondary" size="sm" className="w-full text-[9px]" onClick={saveNote}>
                                    SAVE_INTERNAL_LOG
                                </ButtonComponent>
                            </section>
                        </div>

                        {/* --- SESSION HISTORY (TREND ANALYSIS) --- */}
                        <section className="space-y-2">
                            <label className="text-[9px] font-black text-admin-primary uppercase tracking-widest block">
                                Neural_Trend_Analysis
                            </label>
                            <div className="h-20 w-full flex items-end gap-1 px-2 bg-admin-bg/20 border border-admin-border/30 rounded relative group">
                                {userActivityIsLoading ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-[10px] animate-pulse">CALCULATING_TRAJECTORY...</span>
                                    </div>
                                ) : userActivity?.data.sessionHistory && userActivity.data.sessionHistory.length > 0 ? (
                                    (() => {
                                        // Calculate max value to normalize bar heights
                                        const maxVal = Math.max(...userActivity.data.sessionHistory, 1);

                                        return userActivity.data.sessionHistory.map((count, i) => {
                                            const heightPercent = (count / maxVal) * 100;
                                            return (
                                                <div
                                                    key={i}
                                                    className="flex-1 bg-admin-primary/20 border-t border-admin-primary/40 hover:bg-admin-primary/60 transition-all cursor-crosshair relative group/bar"
                                                    style={{ height: `${Math.max(heightPercent, 5)}%` }} // Minimum 5% height for visibility
                                                >
                                                    {/* Hover Tooltip */}
                                                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-admin-panel border border-admin-border text-[10px] px-1.5 py-0.5 opacity-0 group-hover/bar:opacity-100 transition-opacity z-10 whitespace-nowrap">
                                                        {count} ACTIONS
                                                    </span>
                                                </div>
                                            );
                                        });
                                    })()
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-admin-text-dim italic">
                                        NO_HISTORY_FOUND
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between text-[10px] text-admin-text-dim uppercase font-mono px-1">
                                <span>Oldest_Record</span>
                                <span className="text-admin-primary/60 italic">Trajectory: {
                                    userActivity?.data.sessionHistory && userActivity.data.sessionHistory.length > 1
                                        ? (userActivity.data.sessionHistory.slice(-1)[0] >= userActivity.data.sessionHistory.slice(-2, -1)[0] ? 'STABLE/RISING' : 'DECLINING')
                                        : 'INSUFFICIENT_DATA'
                                }</span>
                                <span>Latest</span>
                            </div>
                        </section>

                        {/* --- INTERACTION HEATMAP --- */}
                        <section className="space-y-2">
                            <label className="text-[9px] font-black text-admin-primary uppercase tracking-widest block">Activity_Density_Matrix</label>
                            <div className="flex gap-1 h-12 items-center bg-admin-bg/20 p-2 border border-admin-border/30 rounded relative">
                                {userActivityIsLoading ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-admin-panel/50">
                                        <span className="text-[8px] animate-pulse">SYNCING_MATRIX...</span>
                                    </div>
                                ) : (
                                    userActivity?.data.hourlyActivity.map((density, i) => {
                                        const opacity = Math.min(density * 0.2 + 0.1, 1);

                                        return (
                                            <div
                                                key={i}
                                                className="flex-1 h-full rounded-sm transition-all hover:scale-y-125 origin-bottom cursor-help"
                                                style={{
                                                    backgroundColor: density > 0
                                                        ? `rgba(0, 255, 157, ${opacity})`
                                                        : `rgba(255, 255, 255, 0.05)`,
                                                    borderBottom: i === new Date().getHours() ? '2px solid white' : 'none'
                                                }}
                                                title={`Hour ${i}:00 | Activity: ${density} events`}
                                            />
                                        );
                                    })
                                )}
                            </div>
                            <div className="flex justify-between text-[10px] text-admin-text-dim uppercase font-mono">
                                <span>00:00</span>
                                <span>Peak_Intensity_Map</span>
                                <span>23:59</span>
                            </div>
                        </section>

                        {/* --- REAL-TIME PULSE (ACTIVITY FEED) --- */}
                        <section className="space-y-3">
                            <label className="text-[9px] font-black text-admin-accent uppercase tracking-widest block">Neural_Pulse_Feed</label>
                            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2 min-h-20">
                                {userActivityIsLoading ? (
                                    <div className="text-[10px] text-admin-text-dim animate-pulse">READING_PULSE_DATA...</div>
                                ) : userActivity?.data.logs && userActivity.data.logs.length > 0 ? (
                                    userActivity.data.logs.map((log) => {
                                        // Determine color based on status
                                        const statusColor = {
                                            SUCCESS: 'text-admin-success',
                                            ERROR: 'text-admin-error',
                                            WARNING: 'text-admin-warning',
                                            SYSTEM: 'text-admin-primary'
                                        }[log.status] || 'text-admin-text';

                                        return (
                                            <div key={log._id} className="flex gap-3 items-start text-[10px] font-mono border-l border-admin-border/50 pl-3 py-1.5 hover:bg-white/5 transition-colors group">
                                                <span className="text-admin-text-dim italic whitespace-nowrap">
                                                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <div className="flex flex-col">
                                                    <span className={`${statusColor} font-bold tracking-tighter`}>{log.event}</span>
                                                    <span className="text-[8px] text-admin-text-dim uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                                                        ID: {log._id.slice(-6)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-[10px] text-admin-text-dim italic">NO_PULSE_DETECTED</div>
                                )}
                            </div>
                        </section>

                        {/* --- UPDATED TACTICAL MACROS --- */}
                        <div className="space-y-2 pt-4 border-t border-admin-border/30">
                            <label className="text-[9px] font-black text-admin-error uppercase tracking-widest block">Tactical_Command_Suite</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => executeMacro('STABILIZE')}
                                    className="flex flex-col items-center p-2 border border-admin-success/30 bg-admin-success/5 hover:bg-admin-success/20 transition-all cursor-pointer"
                                >
                                    <span className="text-[9px] font-black text-admin-success">STABILIZE</span>
                                    <span className="text-[6px] text-admin-text-dim uppercase">Fix Energy</span>
                                </button>

                                <button
                                    onClick={() => executeMacro('ELEVATE')}
                                    className="flex flex-col items-center p-2 border border-admin-primary/30 bg-admin-primary/5 hover:bg-admin-primary/20 transition-all cursor-pointer"
                                >
                                    <span className="text-[9px] font-black text-admin-primary">ELEVATE</span>
                                    <span className="text-[6px] text-admin-text-dim uppercase">+500 EXP</span>
                                </button>

                                <button
                                    onClick={handleWarn}
                                    className="flex flex-col items-center p-2 border border-admin-error/30 bg-admin-error/5 hover:bg-admin-error/20 transition-all cursor-pointer"
                                >
                                    <span className="text-[9px] font-black text-admin-error">WARN</span>
                                    <span className="text-[6px] text-admin-text-dim uppercase">Issue Flag</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- INTEGRATED MODAL (Logic added here!) --- */}
            {showDirectiveModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    {/* Backdrop with heavier blur for focus */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in"
                        onClick={() => setShowDirectiveModal(false)}
                    />

                    <div className="relative w-full max-w-sm bg-admin-panel border border-admin-border shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200 overflow-hidden">
                        {/* Top Scanning Bar Effect */}
                        <div className="absolute top-0 left-0 w-full h-px bg-admin-primary/50 animate-pulse" />

                        {/* Header */}
                        <div className="p-4 border-b border-admin-border bg-admin-primary/5 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-admin-primary animate-ping rounded-full" />
                                <h3 className="text-[10px] font-black uppercase text-admin-primary italic tracking-[0.2em]">Transmit_Directive</h3>
                            </div>
                            <button onClick={() => setShowDirectiveModal(false)} className="text-admin-text-dim hover:text-white transition-colors cursor-pointer text-xs">✕</button>
                        </div>

                        <div className="p-5 space-y-5">
                            {/* 1. Priority Selection */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-admin-text-dim uppercase tracking-widest">Priority_Matrix</label>
                                    <span className="text-[9px] font-mono text-admin-primary/50">LVL: {priority}</span>
                                </div>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPriority(p)}
                                            className={`py-2 text-[8px] font-black border transition-all cursor-pointer ${priority === p
                                                ? p === 'CRITICAL' ? 'border-admin-error bg-admin-error/20 text-admin-error shadow-[0_0_10px_rgba(255,0,0,0.2)]'
                                                    : 'border-admin-primary bg-admin-primary/20 text-admin-primary'
                                                : 'border-admin-border text-admin-text-dim bg-admin-bg/40 hover:bg-admin-bg'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 2. Directive Message */}
                            <div className="space-y-1.5">
                                <label className="text-[8px] font-black text-admin-text-dim uppercase tracking-widest">Message_Payload</label>
                                <textarea
                                    autoFocus
                                    value={directiveMessage}
                                    onChange={(e) => setDirectiveMessage(e.target.value)}
                                    placeholder="Neural directive instructions..."
                                    className="w-full h-28 bg-black/40 border border-admin-border p-3 text-[11px] text-admin-text focus:outline-none focus:border-admin-primary font-mono resize-none custom-scrollbar placeholder:text-admin-text-dim/30"
                                />
                            </div>

                            {/* 3. Action URL (Now streamlined) */}
                            <div className="space-y-1.5">
                                <label className="text-[8px] font-black text-admin-text-dim uppercase tracking-widest flex justify-between">
                                    Redirect_Link
                                    <span className="text-[7px] italic text-admin-text-dim/40 lowercase">optional</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-admin-primary/50 font-mono italic">URL{'>'}</div>
                                    <input
                                        value={actionUrlMessage}
                                        onChange={(e) => setActionUrlMessage(e.target.value)}
                                        placeholder="https://terminal.access/..."
                                        type="url"
                                        className="w-full bg-black/40 border border-admin-border py-2.5 pl-10 pr-3 text-[10px] text-admin-primary focus:outline-none focus:border-admin-primary font-mono transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 bg-admin-bg/60 border-t border-admin-border grid grid-cols-5 gap-3">
                            <ButtonComponent
                                variant="secondary"
                                onClick={() => setShowDirectiveModal(false)}
                                className="col-span-2 text-[9px] font-black uppercase tracking-tighter border-admin-border/50"
                            >
                                Abort_Signal
                            </ButtonComponent>
                            <ButtonComponent
                                variant="oracle"
                                onClick={handleSendNotification}
                                isLoading={isProcessing}
                                className="col-span-3 text-[9px] font-black uppercase tracking-tighter shadow-[0_0_15px_rgba(0,255,255,0.1)]"
                            >
                                Execute_Transmission
                            </ButtonComponent>
                        </div>

                        {/* Aesthetic Bottom Bar */}
                        <div className="h-1 w-full bg-linear-to-r from-transparent via-admin-primary/20 to-transparent" />
                    </div>
                </div>
            )}
        </>
    );
};


// 1. The STABILIZE Macro
// This is your "Player Retention" button. You use this when you see a user is struggling, out of energy, or has a "messy" psychotype profile.

// What it does (The Logic):

// Refills Energy: Instantly sets energyPoints back to 100%.

// Clears Cooldowns: Removes any "wait times" the user currently has.

// Transmits Signal: Sends an automated notification: "System Anomaly Corrected. Your energy has been restored by the Oversight."

// When to use it: When a high-value user is about to quit because they ran out of resources.

// 2. The ELEVATE Macro
// This is your "Reward & Level Up" button. You use this to "gamify" your administration.

// What it does (The Logic):

// Injects EXP: Adds a specific amount (e.g., 500 or 1000) of currentEXP.

// Calculates Level: Forces the system to check if they leveled up.

// Transmits Signal: Sends a high-priority notification: "Performance Excellence Recognized. Neural clearance level increased."

// When to use it: When a user provides great feedback, wins a community event, or reaches a milestone that the automated system missed.