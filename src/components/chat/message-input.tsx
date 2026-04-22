import React, { useState, useRef } from "react";

interface MessageInputProps {
    onSubmit: (content: string) => void;
    onTypingStart: () => void;
    onTypingStop: () => void;
    isConnected: boolean;
    placeholder?: string;
    maxLength?: number;
}

export const MessageInput: React.FC<MessageInputProps> = ({
    onSubmit, isConnected
}) => {
    const [input, setInput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || !isConnected) return;
        onSubmit(input.trim());
        setInput("");
    };

    return (
        <div className="relative">
            <div className={`rounded-xl border ${isConnected ? "border-admin-border/50" : "border-admin-error/40"} bg-admin-panel/40 p-3 flex items-end gap-3`}>
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
                    placeholder={isConnected ? "Type a message for this public room..." : "Connection lost"}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-admin-text placeholder:text-admin-text-dim resize-none py-1 custom-scrollbar min-h-10"
                    rows={1}
                />
                <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={!input.trim() || !isConnected}
                    className="rounded-lg bg-admin-primary px-4 py-2 text-xs font-bold text-admin-bg transition-all hover:bg-admin-accent disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </div>
        </div>
    );
};