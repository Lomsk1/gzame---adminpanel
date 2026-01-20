import React, { useState, useRef } from "react";

interface MessageInputProps {
    onSubmit: (content: string, repliedTo?: string) => void;
    onTypingStart: () => void;
    onTypingStop: () => void;
    isConnected: boolean;
    placeholder?: string;
    maxLength?: number;
    replyTo?: {
        messageId: string;
        username: string;
        preview: string;
    };
    onCancelReply?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
    onSubmit, isConnected, replyTo, onCancelReply
}) => {
    const [input, setInput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || !isConnected) return;
        onSubmit(input.trim(), replyTo?.messageId);
        setInput("");
        onCancelReply?.();
    };

    return (
        <div className="relative font-mono">
            {replyTo && (
                <div className="absolute bottom-full left-0 right-0 bg-admin-primary/10 border-x border-t border-admin-primary/30 p-2 flex justify-between items-center animate-in slide-in-from-bottom-2">
                    <span className="text-[9px] text-admin-primary uppercase tracking-widest font-bold">
                        {`> RE_LINKING: ${replyTo.username}`}
                    </span>
                    <button onClick={onCancelReply} className="text-[10px] text-admin-primary hover:text-white px-2">ABORT</button>
                </div>
            )}

            <div className={`border ${isConnected ? 'border-admin-primary/30' : 'border-admin-error/30'} bg-black p-2 flex items-end gap-3`}>
                <span className="text-admin-primary pb-2 font-bold animate-pulse">{'>'}</span>
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                    placeholder={isConnected ? "ENTER_COMMAND..." : "CONNECTION_LOST"}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-[12px] text-admin-primary placeholder:text-admin-primary/20 resize-none py-1 custom-scrollbar min-h-8"
                    rows={1}
                />
                <button
                    onClick={() => handleSubmit()}
                    disabled={!input.trim()}
                    className="bg-admin-primary/10 border border-admin-primary/40 text-admin-primary px-4 py-1 text-[10px] font-bold hover:bg-admin-primary hover:text-black transition-all"
                >
                    EXECUTE
                </button>
            </div>
        </div>
    );
};