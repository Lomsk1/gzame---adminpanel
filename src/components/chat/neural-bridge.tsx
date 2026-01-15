import { GlassCard } from "../cards/card-glass";
import { useEffect, useRef } from "react";

interface NeuralBridgeProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeChat: { user: string; messages: any[] };
    onSendMessage: (msg: string) => void;
    onClose: () => void;
}

export const NeuralBridge = ({ activeChat, onSendMessage, onClose }: NeuralBridgeProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to latest transmission
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activeChat.messages]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
            onSendMessage(e.currentTarget.value);
            e.currentTarget.value = "";
        }
    };

    return (
        <GlassCard className="fixed bottom-6 right-6 w-96 h-130 flex flex-col p-0 overflow-hidden border-admin-primary/40 shadow-[0_0_50px_rgba(59,130,246,0.15)] animate-in slide-in-from-bottom-10 z-100">
            <div className="p-4 bg-admin-primary/10 border-b border-admin-border/50 flex justify-between items-center backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-admin-success animate-pulse shadow-[0_0_8px_#10b981]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-admin-text italic">Bridge: {activeChat.user}</span>
                </div>
                <button onClick={onClose} className="text-admin-text-dim hover:text-admin-error transition-colors text-[10px] font-bold cursor-pointer">DISCONNECT</button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-admin-bg/20">
                {activeChat.messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col gap-1.5 max-w-[85%] ${msg.role === 'admin' ? 'self-end' : 'self-start'}`}>
                        <span className={`text-[7px] font-black uppercase px-2 tracking-widest ${msg.role === 'admin' ? 'text-admin-primary text-right' : 'text-admin-text-dim'}`}>
                            {msg.role === 'admin' ? 'Oracle Command' : 'Agent Response'}
                        </span>
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed ${msg.role === 'admin'
                            ? 'bg-admin-primary text-white rounded-tr-none shadow-lg'
                            : 'bg-admin-card border border-admin-border text-admin-text rounded-tl-none'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-admin-panel border-t border-admin-border">
                <input
                    className="w-full bg-admin-bg border border-admin-border rounded-xl px-4 py-3 text-xs outline-none focus:border-admin-primary/50 focus:ring-4 focus:ring-admin-primary/5 transition-all text-admin-text placeholder:text-admin-text-muted"
                    placeholder="Enter system command..."
                    onKeyDown={handleKeyDown}
                />
            </div>
        </GlassCard>
    );
};