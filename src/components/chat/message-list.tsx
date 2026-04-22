import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Zap } from "lucide-react";
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
            className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-admin-bg/20 ${className}`}
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
                        <div className="w-full rounded-lg border border-admin-border/30 bg-admin-panel/30 px-4 py-2 text-center text-xs text-admin-text-dim">
                            {`[${formatTime(message.created_at)}] ${message.content}`}
                        </div>
                    </div>
                );

                if (message.message_type === "impulse") {
                    const author = message.user_id;
                    const avatarUrl = (author as { avatar_url?: string })?.avatar_url || DEFAULT_AVATAR;
                    return (
                        <div key={message._id || index} className={`group flex gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                            <div className="relative shrink-0">
                                {onAvatarClick && author?._id ? (
                                    <button
                                        type="button"
                                        onClick={(e) => onAvatarClick({ _id: author._id, nickname: author.nickname, avatar_url: avatarUrl }, e.currentTarget)}
                                        className="rounded-xl border border-admin-border/40 overflow-hidden hover:border-admin-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-admin-primary/50"
                                    >
                                        <img src={avatarUrl} alt="" className="h-10 w-10 object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }} />
                                    </button>
                                ) : (
                                    <img src={avatarUrl} alt="" className="h-10 w-10 rounded-xl border border-admin-border/40 object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }} />
                                )}
                                <span className="pointer-events-none absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-md border border-admin-accent/40 bg-admin-bg text-admin-accent shadow-sm">
                                    <Zap className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                                </span>
                            </div>

                            <div className={`flex min-w-0 flex-1 flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
                                <div className="mb-1.5 flex w-full max-w-[92%] flex-wrap items-center justify-between gap-2 px-0.5">
                                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                                        {!isCurrentUser && (
                                            <span className="truncate text-sm font-semibold text-admin-text">
                                                {author?.nickname ?? "User"}
                                            </span>
                                        )}
                                        <span className="inline-flex items-center gap-1 rounded-full border border-admin-accent/35 bg-admin-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-admin-accent">
                                            <Zap className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                                            Impulse
                                        </span>
                                        {author?.psychotype && (
                                            <span className="rounded border border-admin-primary/25 bg-admin-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-admin-primary">
                                                {author.psychotype}
                                            </span>
                                        )}
                                    </div>
                                    <span className="shrink-0 text-xs text-admin-text-muted">{formatTime(message.created_at)}</span>
                                </div>

                                <div className="relative w-full max-w-[92%] overflow-hidden rounded-2xl border border-admin-accent/35 bg-linear-to-br from-admin-accent/12 via-admin-panel/35 to-admin-primary/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-b from-admin-accent via-admin-primary to-admin-accent opacity-80" />
                                    <div className="pl-3">
                                        <p className="text-sm leading-relaxed text-admin-text whitespace-pre-wrap">
                                            {message.content}
                                        </p>

                                        {message.quest_title ? (
                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-admin-text-dim">
                                                    Linked quest
                                                </span>
                                                <span className="inline-flex max-w-full items-center truncate rounded-lg border border-admin-accent/40 bg-admin-bg/40 px-2.5 py-1 text-xs font-semibold text-admin-accent">
                                                    {message.quest_title}
                                                </span>
                                            </div>
                                        ) : null}

                                        {(isCurrentUser || canDeleteAnyMessage) && (
                                            <button
                                                type="button"
                                                onClick={() => setMessageIdToDelete(message._id)}
                                                className="absolute right-2 top-2 text-sm text-admin-text-muted opacity-0 transition-opacity hover:text-admin-error group-hover:opacity-100"
                                                title={canDeleteAnyMessage && !isCurrentUser ? "Delete message (admin)" : "Delete message"}
                                                aria-label={canDeleteAnyMessage && !isCurrentUser ? "Delete message (admin)" : "Delete message"}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }

                const author = message.user_id;
                const avatarUrl = (author as { avatar_url?: string })?.avatar_url || DEFAULT_AVATAR;

                return (
                    <div key={message._id || index} className={`group flex gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                        <div className="shrink-0">
                            {onAvatarClick && author?._id ? (
                                <button
                                    type="button"
                                    onClick={(e) => onAvatarClick({ _id: author._id, nickname: author.nickname, avatar_url: avatarUrl }, e.currentTarget)}
                                    className="rounded-lg border border-admin-border/40 overflow-hidden hover:border-admin-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-admin-primary/50"
                                >
                                    <img src={avatarUrl} alt="" className="w-10 h-10 object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }} />
                                </button>
                            ) : (
                                <img src={avatarUrl} alt="" className="w-10 h-10 rounded-lg border border-admin-border/40 object-cover" onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }} />
                            )}
                        </div>

                        <div className={`flex flex-col min-w-0 flex-1 ${isCurrentUser ? "items-end" : "items-start"}`}>
                            <div className="flex items-center gap-2 mb-1.5 px-1 flex-wrap">
                                {!isCurrentUser && (
                                    <span className="text-admin-text text-sm font-semibold">
                                        {author?.nickname}
                                    </span>
                                )}
                                <span className="text-xs text-admin-text-muted">{formatTime(message.created_at)}</span>
                                {author?.psychotype && (
                                    <span className="text-[10px] text-admin-primary border border-admin-primary/20 rounded px-1.5 py-0.5">
                                        {author.psychotype}
                                    </span>
                                )}
                            </div>

                            <div className="relative max-w-[85%]">
                            <div className={`rounded-xl p-3 border ${isCurrentUser
                                ? "bg-admin-primary/10 border-admin-primary/30 text-admin-text"
                                : "bg-admin-panel/40 border-admin-border/40 text-admin-text"
                                } transition-colors group-hover:border-admin-primary/40`}>

                                {message.replied_to && (
                                    <div className="mb-2 pl-2 border-l-2 border-admin-primary/40 text-xs text-admin-text-dim">
                                        Reply to #{message.replied_to.substring(0, 6)}
                                    </div>
                                )}

                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {message.content}
                                </p>

                                {message.moderation_status && message.moderation_status !== "approved" && (
                                    <div className="mt-2 pt-2 border-t border-white/5 flex gap-2 items-center">
                                        <span className={`text-[10px] px-1.5 font-semibold uppercase ${message.moderation_status === "flagged" ? "text-admin-warning" : "text-admin-error"
                                            }`}>
                                            {message.moderation_status}
                                        </span>
                                        <span className="text-[10px] text-admin-text-muted">
                                            score: {message.moderation_score || "N/A"}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className={`absolute top-0 ${isCurrentUser ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1`}>
                                {(isCurrentUser || canDeleteAnyMessage) && (
                                    <button type="button" onClick={() => setMessageIdToDelete(message._id)} className="text-admin-text-muted hover:text-admin-error text-sm" title={canDeleteAnyMessage && !isCurrentUser ? "Delete message (admin)" : "Delete message"}>✕</button>
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