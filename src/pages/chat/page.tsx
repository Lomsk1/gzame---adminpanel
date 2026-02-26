import { useState, useCallback, Suspense, useEffect } from "react";
import { Await, useFetcher, useLoaderData, useRevalidator, useNavigate } from "react-router";
import useUserStore from "../../store/user/user";
import { useChatSocket } from "../../hooks/useChatSocket";

// Sub-components
import { ChatRoomList } from "../../components/chat/room-list";
import { ChatHeader } from "../../components/chat/header";
import { MessageList } from "../../components/chat/message-list";
import { OnlineUsersPanel } from "../../components/chat/online-user-panel";
import { MessageInput } from "../../components/chat/message-input";
import { AvatarMenu } from "../../components/chat/avatar-menu";
import type { ChatMessage } from "../../types/chat/chat";
import {
    getOrCreateDirectConversation,
    getDirectMessages,
    getDirectConversations,
    sendDirectMessage as sendDirectMessageApi,
    type DirectMessagePayload,
    type DirectConversationListItem,
} from "../../features/chat/direct.api";
import { deleteRoom } from "../../features/chat/chats.loaders";
import { DirectConversationList } from "../../components/chat/direct-list";

// Types
import type { RoomsTypes } from "../../types/chat/chat";
import { ChatRoomEditorDrawer, type ChatRoomFormData } from "../../components/drawers/room-drawer";

// type RoomType = RoomsTypes["data"][number];

export default function AdminChatPage() {
    const user = useUserStore((state) => state.user);
    const navigate = useNavigate();
    const { roomsData } = useLoaderData() as { roomsData: Promise<RoomsTypes> };
    const fetcher = useFetcher();
    const revalidator = useRevalidator();

    const [activeRoom, setActiveRoom] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [replyTo, setReplyTo] = useState<any>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const [editingRooms, setEditingRooms] = useState<ChatRoomFormData | null>(null);

    // Avatar menu (admin click on avatar)
    const [avatarMenuUser, setAvatarMenuUser] = useState<{ _id: string; nickname?: string; avatar_url?: string } | null>(null);
    const [avatarMenuAnchor, setAvatarMenuAnchor] = useState<HTMLElement | null>(null);

    // Sidebar: "rooms" | "direct"
    const [viewMode, setViewMode] = useState<"rooms" | "direct">("rooms");

    // Direct messages
    const [activeDirectUserId, setActiveDirectUserId] = useState<string | null>(null);
    const [directUserName, setDirectUserName] = useState<string>("");
    const [directConversationId, setDirectConversationId] = useState<string | null>(null);
    const [directMessages, setDirectMessages] = useState<DirectMessagePayload[]>([]);
    const [directLoading, setDirectLoading] = useState(false);
    const [directSending, setDirectSending] = useState(false);
    const [directConversations, setDirectConversations] = useState<DirectConversationListItem[]>([]);
    const [directListLoading, setDirectListLoading] = useState(false);
    const [directHasMoreOlder, setDirectHasMoreOlder] = useState(true);
    const [directLoadingOlder, setDirectLoadingOlder] = useState(false);

    // Socket Hook - Automatically connects/disconnects based on activeRoom
    const socketData = useChatSocket(activeRoom);

    // Load direct conversations list when switching to Direct tab
    useEffect(() => {
        if (viewMode !== "direct" || !user) return;
        setDirectListLoading(true);
        getDirectConversations()
            .then((res) => {
                const data = res.data || [];
                // Clear unread for the conversation we have open so the badge doesn't stick
                setDirectConversations(
                    data.map((c) => {
                        const other = c.other_user;
                        if (!other || other._id !== activeDirectUserId) return c;
                        return { ...c, unread_count: 0 };
                    })
                );
            })
            .catch(console.error)
            .finally(() => setDirectListLoading(false));
    }, [viewMode, user?._id, activeDirectUserId]);

    // Load direct conversation and messages when opening DM with a user
    useEffect(() => {
        if (!activeDirectUserId || !user) return;
        setDirectLoading(true);
        setDirectConversationId(null);
        setDirectMessages([]);
        getOrCreateDirectConversation(activeDirectUserId)
            .then(({ data: conv }) => {
                setDirectConversationId(conv._id);
                const other = conv.participants?.find((p) => p._id !== user._id);
                setDirectUserName(other?.nickname || "User");
                return getDirectMessages(conv._id, { limit: 30 });
            })
            .then((res) => {
                const list = res.data || [];
                setDirectMessages(list);
                setDirectHasMoreOlder(res.hasMore ?? list.length >= 30);
                // Fix list preview: backend may send wrong order — use actual last message for this conversation
                if (activeDirectUserId && list.length > 0) {
                    const last = list[list.length - 1];
                    setDirectConversations((prev) =>
                        prev.map((c) => {
                            const other = c.other_user;
                            if (!other || other._id !== activeDirectUserId) return c;
                            return {
                                ...c,
                                last_message: { content: last.content, created_at: last.created_at },
                                unread_count: 0,
                            };
                        })
                    );
                }
            })
            .catch(console.error)
            .finally(() => setDirectLoading(false));
    }, [activeDirectUserId, user?._id]);

    const handleOpenChatWithUser = useCallback((userId: string) => {
        setAvatarMenuUser(null);
        setAvatarMenuAnchor(null);
        setViewMode("direct");
        setActiveDirectUserId(userId);
        getDirectConversations()
            .then((res) => {
                const data = res.data || [];
                setDirectConversations(
                    data.map((c) => {
                        const other = c.other_user;
                        if (!other || other._id !== userId) return c;
                        return { ...c, unread_count: 0 };
                    })
                );
            })
            .catch(console.error);
    }, []);

    const handleSelectDirectConversation = useCallback((userId: string, nickname: string) => {
        setActiveDirectUserId(userId);
        setDirectUserName(nickname);
        // Mark as read when opening: clear unread badge for this conversation
        setDirectConversations((prev) =>
            prev.map((c) => {
                const other = c.other_user;
                if (!other || other._id !== userId) return c;
                return { ...c, unread_count: 0 };
            })
        );
    }, []);

    const handleBackFromDirect = useCallback(() => {
        setActiveDirectUserId(null);
        setDirectConversationId(null);
        setDirectMessages([]);
        setDirectHasMoreOlder(true);
    }, []);

    const handleLoadOlderDirect = useCallback(() => {
        if (!directConversationId || directLoadingOlder || !directHasMoreOlder) return;
        const beforeId = directMessages[0]?._id;
        if (!beforeId) return;
        setDirectLoadingOlder(true);
        getDirectMessages(directConversationId, { limit: 30, before: beforeId })
            .then((res) => {
                const older = res.data || [];
                setDirectMessages((prev) => [...older, ...prev]);
                setDirectHasMoreOlder(res.hasMore ?? false);
            })
            .catch(console.error)
            .finally(() => setDirectLoadingOlder(false));
    }, [directConversationId, directLoadingOlder, directHasMoreOlder, directMessages]);

    const handleOpenProfile = useCallback((userId: string) => {
        setAvatarMenuUser(null);
        setAvatarMenuAnchor(null);
        navigate("/users", { state: { openUserId: userId } });
    }, [navigate]);

    const handleAvatarClick = useCallback((u: { _id: string; nickname?: string; avatar_url?: string }, anchorEl: HTMLElement) => {
        if (u._id === user?._id) return;
        setAvatarMenuUser(u);
        setAvatarMenuAnchor(anchorEl);
    }, [user?._id]);

    const handleSendDirectMessage = useCallback(async (content: string) => {
        if (!directConversationId || directSending) return;
        setDirectSending(true);
        try {
            const { data: newMsg } = await sendDirectMessageApi(directConversationId, content);
            setDirectMessages((prev) => [...prev, newMsg]);
        } catch (e) {
            console.error(e);
        } finally {
            setDirectSending(false);
        }
    }, [directConversationId, directSending]);

    const handleTerminateRoom = useCallback(async () => {
        if (!activeRoom) return;
        try {
            await deleteRoom(activeRoom);
            setActiveRoom(null);
            setReplyTo(null);
            revalidator.revalidate();
        } catch (e) {
            console.error(e);
        }
    }, [activeRoom, revalidator]);

    const directMessagesAsChat: ChatMessage[] = directMessages.map((m) => ({
        _id: m._id,
        content: m.content,
        user_id: m.user_id as ChatMessage["user_id"],
        room_id: directConversationId!,
        message_type: "text" as const,
        moderation_status: "approved" as const,
        created_at: m.created_at,
        updated_at: m.created_at,
    }));


    const handleSave = (data: ChatRoomFormData) => {
        const isUpdate = !!editingRooms?._id;
        const formData = new FormData();

        formData.append("intent", isUpdate ? "update" : "create");
        if (isUpdate) formData.append("id", editingRooms._id!);
        if (!isUpdate) formData.append("created_by", user!._id);

        formData.append("payload", JSON.stringify(data));

        fetcher.submit(formData, { method: "POST" });
        setIsDrawerOpen(false);
        setEditingRooms(null);
    };

    /**
     * EFFECT: Initial Room Selection
     * Resolves the bad setState() call by waiting for the loader promise
     * to resolve outside of the render cycle.
     */
    useEffect(() => {
        roomsData.then((resolved) => {
            if (!activeRoom && resolved.data && resolved.data.length > 0) {
                setActiveRoom(resolved.data[0]._id);
            }
        }).catch(console.error);
    }, [roomsData, activeRoom]);

    // Revalidate room list after create/update so new rooms appear
    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data && (fetcher.data as { success?: boolean }).success) {
            revalidator.revalidate();
        }
    }, [fetcher.state, fetcher.data, revalidator]);

    const handleSendMessage = useCallback((content: string) => {
        socketData.sendMessage(content, replyTo?.messageId);
        setReplyTo(null);
    }, [socketData, replyTo]);

    if (!user) {
        return (
            <div className="h-screen bg-black flex items-center justify-center text-admin-primary font-mono tracking-widest animate-pulse">
                [!] AUTH_REQUIRED_ACCESS_DENIED
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-admin-bg text-admin-text overflow-hidden font-mono relative">

            {/* LEFT SIDEBAR - ROOMS + DIRECT */}
            <div className="w-72 border-r border-admin-border/30 bg-black flex flex-col shrink-0">
                <div className="p-2 border-b border-admin-border/20 flex gap-1">
                    <button
                        type="button"
                        onClick={() => {
                            setViewMode("rooms");
                            handleBackFromDirect();
                        }}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${viewMode === "rooms"
                                ? "bg-admin-primary/20 text-admin-primary border border-admin-primary/40"
                                : "text-admin-text-dim hover:bg-white/5 border border-transparent"
                            }`}
                    >
                        Rooms
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("direct")}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${viewMode === "direct"
                                ? "bg-admin-primary/20 text-admin-primary border border-admin-primary/40"
                                : "text-admin-text-dim hover:bg-white/5 border border-transparent"
                            }`}
                    >
                        Direct
                    </button>
                </div>
                {viewMode === "rooms" ? (
                    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                        <Suspense fallback={
                            <div className="p-4 space-y-4 animate-pulse flex-1">
                                <div className="h-4 w-24 bg-admin-primary/20 rounded" />
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-12 w-full bg-white/5 rounded" />
                                ))}
                            </div>
                        }>
                            <Await resolve={roomsData}>
                                {(resolvedData: RoomsTypes) => (
                                    <ChatRoomList
                                        rooms={Array.isArray(resolvedData?.data) ? resolvedData.data : []}
                                        activeRoom={activeRoom}
                                        onSelectRoom={(id) => {
                                            setActiveRoom(id);
                                            setReplyTo(null);
                                        }}
                                        onCreateRoom={() => setIsDrawerOpen(true)}
                                    />
                                )}
                            </Await>
                        </Suspense>
                    </div>
                ) : (
                    <>
                        <div className="p-2 border-b border-admin-border/20">
                            <h3 className="text-xs font-bold text-admin-primary uppercase tracking-widest">
                                Direct chats
                            </h3>
                        </div>
                        <DirectConversationList
                            conversations={directConversations}
                            activeUserId={activeDirectUserId}
                            onSelect={handleSelectDirectConversation}
                            loading={directListLoading}
                        />
                    </>
                )}
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col border-x border-admin-border/20 relative">
                {/* Direct Messages view */}
                {activeDirectUserId ? (
                    <>
                        <div className="border-b border-admin-border/40 bg-black/60 backdrop-blur-xl p-4 flex items-center gap-4">
                            <button
                                type="button"
                                onClick={handleBackFromDirect}
                                className="text-sm text-admin-primary hover:bg-admin-primary/10 px-3 py-1.5 rounded border border-admin-primary/30"
                            >
                                ← Back
                            </button>
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">
                                Direct: {directUserName || "..."}
                            </h2>
                        </div>
                        <div className="flex-1 flex flex-col min-h-0">
                            {directLoading ? (
                                <div className="flex-1 flex items-center justify-center text-sm text-admin-primary opacity-60">
                                    Loading conversation...
                                </div>
                            ) : (
                                <>
                                    <MessageList
                                        messages={directMessagesAsChat}
                                        currentUserId={user._id}
                                        onLoadOlder={handleLoadOlderDirect}
                                        hasMoreOlder={directHasMoreOlder}
                                        loadingOlder={directLoadingOlder}
                                        className="flex-1 overflow-y-auto"
                                    />
                                    <div className="p-4 border-t border-admin-border/30 bg-black/40 backdrop-blur-sm">
                                        <MessageInput
                                            onSubmit={handleSendDirectMessage}
                                            onTypingStart={() => { }}
                                            onTypingStop={() => { }}
                                            isConnected={!directSending}
                                            replyTo={null}
                                            onCancelReply={() => { }}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                ) : viewMode === "direct" ? (
                    <div className="flex-1 flex items-center justify-center text-admin-text-dim">
                        <p className="text-base">Select a conversation from the list</p>
                    </div>
                ) : (
                    <Suspense fallback={
                        <div className="flex-1 flex items-center justify-center text-sm text-admin-primary opacity-40">
                            ESTABLISHING_ENCRYPTED_UPLINK...
                        </div>
                    }>
                        <Await resolve={roomsData}>
                            {(resolvedData: RoomsTypes) => {
                                const currentRoom = resolvedData.data.find(r => r._id === activeRoom);

                                if (!activeRoom) return (
                                    <div className="flex-1 flex items-center justify-center opacity-20 tracking-[1em] text-base italic">
                                        SELECT_TARGET_NODE
                                    </div>
                                );

                                return (
                                    <>
                                        <ChatHeader
                                            roomName={currentRoom?.name || "Initializing..."}
                                            roomType={currentRoom?.type || "PUBLIC"}
                                            participantCount={socketData.onlineUsers.length}
                                            isConnected={socketData.isConnected}
                                            onRefresh={socketData.reconnect}
                                            onDelete={handleTerminateRoom}
                                        />

                                        <div className="flex-1 flex flex-col min-h-0 relative">
                                            <MessageList
                                                messages={socketData.messages}
                                                currentUserId={user._id}
                                                canDeleteAnyMessage={user?.role === "admin"}
                                                onDeleteMessage={socketData.deleteMessage}
                                                onReply={(m) => setReplyTo({
                                                    messageId: m._id,
                                                    username: m.user_id?.nickname
                                                })}
                                                onAvatarClick={user?.role === "admin" ? handleAvatarClick : undefined}
                                                onLoadOlder={socketData.loadOlderMessages}
                                                hasMoreOlder={socketData.hasMoreOlder}
                                                loadingOlder={socketData.loadingOlder}
                                            />

                                            {/* INPUT AREA */}
                                            <div className="p-4 border-t border-admin-border/30 bg-black/40 backdrop-blur-sm">
                                                <MessageInput
                                                    onSubmit={handleSendMessage}
                                                    onTypingStart={socketData.startTyping}
                                                    onTypingStop={socketData.stopTyping}
                                                    isConnected={socketData.isConnected}
                                                    replyTo={replyTo}
                                                    onCancelReply={() => setReplyTo(null)}
                                                />
                                            </div>
                                        </div>
                                    </>
                                );
                            }}
                        </Await>
                    </Suspense>
                )}
            </div>

            {/* RIGHT SIDEBAR - USER TELEMETRY */}
            <aside className="w-64 hidden xl:flex flex-col p-4 bg-black/20">
                <OnlineUsersPanel
                    users={socketData.onlineUsers}
                    title="ACTIVE_IDENTITIES"
                    onAvatarClick={user?.role === "admin" ? (u, el) => handleAvatarClick(u, el) : undefined}
                />

                {/* System Stats Block */}
                <div className="mt-auto p-4 border border-admin-primary/10 bg-admin-primary/5 text-sm font-mono space-y-2">
                    <div className="flex justify-between">
                        <span className="text-admin-text-dim">LATENCY:</span>
                        <span className="text-admin-primary">14ms</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-admin-text-dim">BUFFER_LOAD:</span>
                        <span className="text-admin-primary">0.02%</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 mt-2">
                        <div className="w-3/4 h-full bg-admin-primary animate-pulse" />
                    </div>
                </div>
            </aside>

            {/* GLOBAL CRT OVERLAY EFFECTS */}
            <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
                {/* Scanlines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,118,0.02))] bg-size-[100%_3px,3px_100%]" />
                {/* Static Noise */}
                <div className="absolute inset-0 opacity-[0.015] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>

            {isDrawerOpen && (
                <ChatRoomEditorDrawer
                    config={editingRooms}
                    onClose={() => setIsDrawerOpen(false)}
                    onSave={handleSave}
                    isSubmitting={fetcher.state !== "idle"}
                />
            )}

            <AvatarMenu
                open={!!avatarMenuUser && !!avatarMenuAnchor}
                anchorEl={avatarMenuAnchor}
                user={avatarMenuUser}
                onClose={() => {
                    setAvatarMenuUser(null);
                    setAvatarMenuAnchor(null);
                }}
                onOpenChat={handleOpenChatWithUser}
                onOpenProfile={handleOpenProfile}
            />
        </div>
    );
}


// const deleteMessage = useCallback((messageId: string, reason?: string) => {
//   if (!socketRef.current?.connected || !roomIdRef.current || !user?.role?.includes("admin")) {
//     return;
//   }

//   socketRef.current.emit(
//     "admin_delete_message",
//     { roomId: roomIdRef.current, messageId, reason },
//     (response: any) => {
//       if (response?.success) {
//         setMessages((prev) => prev.filter((m) => m._id !== messageId));
//       }
//     }
//   );
// }, [user]);

// const getRoomStats = useCallback(() => {
//   if (!socketRef.current?.connected || !roomIdRef.current || !user?.role?.includes("admin")) {
//     return Promise.reject("Admin access required");
//   }

//   return new Promise((resolve, reject) => {
//     socketRef.current!.emit("admin_get_room_stats", roomIdRef.current, (stats: any) => {
//       resolve(stats);
//     });
//   });
// }, [user]);

// const createRoom = useCallback((roomData: any) => {
//   if (!socketRef.current?.connected || !user?.role?.includes("admin")) {
//     return Promise.reject("Admin access required");
//   }

//   return new Promise((resolve, reject) => {
//     socketRef.current!.emit("admin_create_room", roomData, (response: any) => {
//       if (response?.success) {
//         resolve(response.room);
//       } else {
//         reject(response?.error || "Failed to create room");
//       }
//     });
//   });
// }, [user]);

// // Add these to return object
// return {
//   // ... existing returns ...
//   deleteMessage,
//   getRoomStats,
//   createRoom,
//   isAdmin: user?.role?.includes("admin") || false,
// };