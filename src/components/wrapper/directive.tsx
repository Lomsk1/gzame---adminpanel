import { useState } from "react";
import { ButtonComponent } from "../form/button";
import { toast } from "sonner";
import axiosAuth from "../../helper/axios";

interface DirectiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipient: {
        id: string;
        nickname: string;
    };
}

export const DirectiveModal = ({ isOpen, onClose, recipient }: DirectiveModalProps) => {
    const [message, setMessage] = useState("");
    const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
    const [isSending, setIsSending] = useState(false);

    if (!isOpen) return null;

    const handleTransmit = async () => {
        if (!message.trim()) return toast.error("DIRECTIVE_MESSAGE_REQUIRED");

        setIsSending(true);
        const toastId = toast.loading("TRANSMITTING_SIGNAL...");

        try {
            await axiosAuth.post("/api/v1/notifications/send", {
                recipientId: recipient.id,
                content: message,
                priority,
                type: "SYSTEM_DIRECTIVE"
            });

            toast.success("SIGNAL_BROADCAST_COMPLETE", {
                id: toastId,
                description: `Directive pushed to ${recipient.nickname}`
            });
            setMessage("");
            onClose();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error("TRANSMISSION_FAILED", {
                id: toastId,
                description: err.response?.data?.message || "Uplink error."
            });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />

            {/* Modal Body */}
            <div className="relative w-full max-w-md bg-admin-panel border border-admin-border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-4 border-b border-admin-border bg-admin-primary/5 flex justify-between items-center text-admin-primary">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-admin-primary animate-pulse" />
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest italic">Broadcast_Directive</h3>
                            <p className="text-[10px] text-admin-text-dim font-mono tracking-tight uppercase">Target: {recipient.nickname}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-admin-text-dim hover:text-white transition-colors cursor-pointer text-sm">✕</button>
                </div>

                <div className="p-6 space-y-6 bg-admin-bg/20">
                    {/* Priority Selector */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-admin-text-dim uppercase tracking-widest">Priority_Level</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPriority(p)}
                                    className={`py-2 text-[10px] font-black border transition-all cursor-pointer ${priority === p
                                        ? 'border-admin-primary bg-admin-primary/20 text-admin-primary shadow-[0_0_10px_rgba(var(--admin-primary-rgb),0.2)]'
                                        : 'border-admin-border bg-admin-bg/50 text-admin-text-dim hover:border-admin-text-dim'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message Input */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-admin-text-dim uppercase tracking-widest text-right block">Message_Payload</label>
                        <textarea
                            autoFocus
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Input system directive or warning..."
                            className="w-full h-32 bg-admin-bg border border-admin-border p-4 text-xs text-admin-text placeholder:text-admin-text-dim/20 focus:outline-none focus:border-admin-primary transition-colors resize-none font-mono custom-scrollbar"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-admin-bg/60 border-t border-admin-border flex gap-3">
                    <ButtonComponent variant="secondary" onClick={onClose} className="flex-1 text-[10px] uppercase font-black">
                        ABORT
                    </ButtonComponent>
                    <ButtonComponent
                        variant="oracle"
                        onClick={handleTransmit}
                        isLoading={isSending}
                        className="flex-2 text-[10px] uppercase font-black"
                    >
                        TRANSMIT_SIGNAL
                    </ButtonComponent>
                </div>
            </div>
        </div>
    );
};