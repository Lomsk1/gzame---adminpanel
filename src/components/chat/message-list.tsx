import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { format } from "date-fns";
import type { ChatMessage } from "../../types/chat/chat";
import { ConfirmDialog } from "../ui/confirm-dialog";

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/identicon/svg?seed=user";
const SCROLL_LOAD_THRESHOLD = 100;

interface MessageListProps {
    messages: ChatMessage[];
    currentUserId: string;
    /** When true (e.g. admin), delete button is shown on every message. Otherwise only on own messages. */
    canDeleteAnyMessage?: boolean;
    onDeleteMessage?: (messageId: string) => void;
    onReply?: (message: ChatMessage) => void;
    /** When provided, clicking an author avatar opens this callback with user and anchor for menu. */
    onAvatarClick?: (user: { _id: string; nickname?: string; avatar_url?: string }, anchorEl: HTMLElement) => void;
    /** Load more (older) messages when user scrolls to top. */
    onLoadOlder?: () => void | Promise<void>;
    hasMoreOlder?: boolean;
    loadingOlder?: boolean;
    className?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
    messages,
    currentUserId,
    canDeleteAnyMessage = false,
    onDeleteMessage,
    onReply,
    onAvatarClick,
    onLoadOlder,
    hasMoreOlder = false,
    loadingOlder = false,
    className = "",
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [messageIdToDelete, setMessageIdToDelete] = useState<string | null>(null);
    const prevLastIdRef = useRef<string | null>(null);
    const prevFirstIdRef = useRef<string | null>(null);
    const savedScrollHeightRef = useRef<number | null>(null);
    const savedScrollTopRef = useRef<number | null>(null);
    const loadOlderRequestedRef = useRef(false);

    // Scroll to bottom only when the last message changed (new message or initial load), never when we prepended
    useEffect(() => {
        const lastId = messages.length ? messages[messages.length - 1]?._id : null;
        const firstId = messages.length ? messages[0]?._id : null;
        const prevFirst = prevFirstIdRef.current;
        // If first message changed, we prepended — do not scroll to bottom
        if (firstId != null && prevFirst != null && firstId !== prevFirst) {
            prevFirstIdRef.current = firstId;
            prevLastIdRef.current = lastId;
            return;
        }
        if (lastId && lastId !== prevLastIdRef.current) {
            prevLastIdRef.current = lastId;
            prevFirstIdRef.current = firstId;
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        } else {
            if (lastId) prevLastIdRef.current = lastId;
            if (firstId != null) prevFirstIdRef.current = firstId;
        }
    }, [messages]);

    // Preserve scroll position when prepending older messages
    useLayoutEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const prevFirst = prevFirstIdRef.current;
        const newFirst = messages[0]?._id ?? null;
        if (prevFirst != null && newFirst != null && prevFirst !== newFirst && savedScrollHeightRef.current != null && savedScrollTopRef.current != null) {
            const delta = el.scrollHeight - savedScrollHeightRef.current;
            el.scrollTop = savedScrollTopRef.current + delta;
        }
        prevFirstIdRef.current = newFirst;
        savedScrollHeightRef.current = el.scrollHeight;
        savedScrollTopRef.current = el.scrollTop;
    }, [messages]);

    const handleScroll = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        // Always keep saved scroll position so we can restore it correctly when prepending
        savedScrollHeightRef.current = el.scrollHeight;
        savedScrollTopRef.current = el.scrollTop;
        if (!onLoadOlder || !hasMoreOlder || loadingOlder || loadOlderRequestedRef.current) return;
        if (el.scrollTop <= SCROLL_LOAD_THRESHOLD) {
            loadOlderRequestedRef.current = true;
            Promise.resolve(onLoadOlder()).finally(() => {
                loadOlderRequestedRef.current = false;
            });
        }
    }, [onLoadOlder, hasMoreOlder, loadingOlder]);

    const formatTime = (dateString: string) => {
        try {
            return format(new Date(dateString), "HH:mm:ss");
        } catch { return "??:??"; }
    };

    return (
        <div
            ref={scrollContainerRef}
            className={`flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/10 ${className}`}
            onScroll={handleScroll}
        >
            {onLoadOlder && hasMoreOlder && (
                <div className="flex justify-center py-2">
                    {loadingOlder ? (
                        <span className="text-xs text-admin-text-dim">Loading older messages…</span>
                    ) : (
                        <span className="text-xs text-admin-text-dim">Scroll up for more</span>
                    )}
                </div>
            )}
            {messages.map((message, index) => {
                const isCurrentUser = message.user_id?._id === currentUserId;
                const isSystem = message.message_type === "system";

                if (isSystem) return (
                    <div key={message._id || index} className="flex justify-center">
                        <div className="text-sm text-admin-primary/60 font-mono tracking-widest uppercase bg-admin-primary/5 px-4 py-2 border-y border-admin-primary/10 w-full text-center">
                            {`// SYSTEM_LOG [${formatTime(message.created_at)}]: ${message.content}`}
                        </div>
                    </div>
                );

                const author = message.user_id;
                const avatarUrl = (author as { avatar_url?: string })?.avatar_url || DEFAULT_AVATAR;

                return (
                    <div key={message._id || index} className={`group flex gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                        {/* Author avatar - clickable for admin */}
                        <div className="shrink-0">
                            {onAvatarClick && author?._id ? (
                                <button
                                    type="button"
                                    onClick={(e) => onAvatarClick({ _id: author._id, nickname: author.nickname, avatar_url: avatarUrl }, e.currentTarget)}
                                    className="rounded-lg border border-admin-primary/20 overflow-hidden hover:border-admin-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-admin-primary/50"
                                >
                                    <img src={avatarUrl} alt="" className="w-10 h-10 object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }} />
                                </button>
                            ) : (
                                <img src={avatarUrl} alt="" className="w-10 h-10 rounded-lg border border-admin-primary/20 object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }} />
                            )}
                        </div>

                        <div className={`flex flex-col min-w-0 flex-1 ${isCurrentUser ? "items-end" : "items-start"}`}>
                            {/* Header Info */}
                            <div className="flex items-center gap-2 mb-1.5 px-1 flex-wrap">
                                {!isCurrentUser && (
                                    <span className="text-admin-primary text-base font-bold tracking-tighter uppercase">
                                        {author?.nickname}
                                    </span>
                                )}
                                <span className="text-sm text-gray-600 font-mono">[{formatTime(message.created_at)}]</span>
                                {author?.psychotype && (
                                    <span className="text-xs text-admin-primary/50 border border-admin-primary/20 px-1.5 py-0.5 italic">
                                        {author.psychotype}
                                    </span>
                                )}
                            </div>

                            {/* Message Bubble */}
                            <div className="relative max-w-[85%]">
                            <div className={`p-4 border ${isCurrentUser
                                ? "bg-admin-primary/5 border-admin-primary/30 text-admin-primary"
                                : "bg-white/5 border-white/10 text-admin-text"
                                } transition-all group-hover:border-admin-primary/50`}>

                                {/* Reply Context */}
                                {message.replied_to && (
                                    <div className="mb-2 pl-2 border-l border-admin-primary/40 opacity-50 text-sm italic">
                                        RE: CMD_STREAM_ID_{message.replied_to.substring(0, 4)}
                                    </div>
                                )}

                                <p className="text-base leading-relaxed font-mono whitespace-pre-wrap">
                                    {message.content}
                                </p>

                                {/* Moderation Telemetry */}
                                {message.moderation_status && message.moderation_status !== "approved" && (
                                    <div className="mt-2 pt-2 border-t border-white/5 flex gap-2 items-center">
                                        <span className={`text-xs px-1.5 font-bold uppercase ${message.moderation_status === 'flagged' ? 'text-admin-warning' : 'text-admin-error'
                                            }`}>
                                            MOD_{message.moderation_status}
                                        </span>
                                        <span className="text-xs text-gray-600 font-mono italic">
                                            BIOMETRIC_SCORE: {message.moderation_score || 'N/A'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Action Floating Buttons */}
                            <div className={`absolute top-0 ${isCurrentUser ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1`}>
                                <button onClick={() => onReply?.(message)} className="text-gray-500 hover:text-admin-primary text-sm">↪</button>
                                {(isCurrentUser || canDeleteAnyMessage) && (
                                    <button onClick={() => setMessageIdToDelete(message._id)} className="text-gray-500 hover:text-admin-error text-sm" title={canDeleteAnyMessage && !isCurrentUser ? "Delete message (admin)" : "Delete message"}>✕</button>
                                )}
                            </div>
                        </div>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />

            <ConfirmDialog
                open={messageIdToDelete !== null}
                title="Delete message?"
                message="This message will be permanently removed from the database. This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
                onConfirm={() => {
                    if (messageIdToDelete) {
                        onDeleteMessage?.(messageIdToDelete);
                        setMessageIdToDelete(null);
                    }
                }}
                onCancel={() => setMessageIdToDelete(null)}
            />
        </div>
    );
};