import React, { useEffect, useRef } from "react";
import { format } from "date-fns";
import type { ChatMessage } from "../../types/chat/chat";

interface MessageListProps {
    messages: ChatMessage[];
    currentUserId: string;
    onDeleteMessage?: (messageId: string) => void;
    onReply?: (message: ChatMessage) => void;
    className?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
    messages,
    currentUserId,
    onDeleteMessage,
    onReply,
    className = "",
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const formatTime = (dateString: string) => {
        try {
            return format(new Date(dateString), "HH:mm:ss");
        } catch { return "??:??"; }
    };

    return (
        <div className={`flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/10 ${className}`}>
            {messages.map((message, index) => {
                const isCurrentUser = message.user_id?._id === currentUserId;
                const isSystem = message.message_type === "system";

                if (isSystem) return (
                    <div key={message._id || index} className="flex justify-center">
                        <div className="text-[11px] text-admin-primary/60 font-mono tracking-widest uppercase bg-admin-primary/5 px-4 py-1 border-y border-admin-primary/10 w-full text-center">
                            {`// SYSTEM_LOG [${formatTime(message.created_at)}]: ${message.content}`}
                        </div>
                    </div>
                );

                return (
                    <div key={message._id || index} className={`group flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
                        {/* Header Info */}
                        <div className="flex items-center gap-2 mb-1 px-1">
                            {!isCurrentUser && (
                                <span className="text-admin-primary text-[12px] font-bold tracking-tighter uppercase">
                                    {message.user_id?.nickname}
                                </span>
                            )}
                            <span className="text-[10px] text-gray-600 font-mono">[{formatTime(message.created_at)}]</span>
                            {message.user_id?.psychotype && (
                                <span className="text-[9px] text-admin-primary/50 border border-admin-primary/20 px-1 italic">
                                    {message.user_id.psychotype}
                                </span>
                            )}
                        </div>

                        {/* Message Bubble */}
                        <div className="relative max-w-[85%]">
                            <div className={`p-3 border ${isCurrentUser
                                ? "bg-admin-primary/5 border-admin-primary/30 text-admin-primary"
                                : "bg-white/5 border-white/10 text-admin-text"
                                } transition-all group-hover:border-admin-primary/50`}>

                                {/* Reply Context */}
                                {message.replied_to && (
                                    <div className="mb-2 pl-2 border-l border-admin-primary/40 opacity-50 text-[11px] italic">
                                        RE: CMD_STREAM_ID_{message.replied_to.substring(0, 4)}
                                    </div>
                                )}

                                <p className="text-[11px] leading-relaxed font-mono whitespace-pre-wrap">
                                    {message.content}
                                </p>

                                {/* Moderation Telemetry */}
                                {message.moderation_status && message.moderation_status !== "approved" && (
                                    <div className="mt-2 pt-2 border-t border-white/5 flex gap-2 items-center">
                                        <span className={`text-[9px] px-1 font-bold uppercase ${message.moderation_status === 'flagged' ? 'text-admin-warning' : 'text-admin-error'
                                            }`}>
                                            MOD_{message.moderation_status}
                                        </span>
                                        <span className="text-[9px] text-gray-600 font-mono italic">
                                            BIOMETRIC_SCORE: {message.moderation_score || 'N/A'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Action Floating Buttons */}
                            <div className={`absolute top-0 ${isCurrentUser ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1`}>
                                <button onClick={() => onReply?.(message)} className="text-gray-500 hover:text-admin-primary text-[12px]">↪</button>
                                {isCurrentUser && (
                                    <button onClick={() => onDeleteMessage?.(message._id)} className="text-gray-500 hover:text-admin-error text-[12px]">✕</button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
};