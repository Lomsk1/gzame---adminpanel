import { useState, useCallback, Suspense, useEffect } from "react";
import { Await, useFetcher, useLoaderData } from "react-router";
import useUserStore from "../../store/user/user";
import { useChatSocket } from "../../hooks/useChatSocket";

// Sub-components
import { ChatRoomList } from "../../components/chat/room-list";
import { ChatHeader } from "../../components/chat/header";
import { MessageList } from "../../components/chat/message-list";
import { OnlineUsersPanel } from "../../components/chat/online-user-panel";
import { MessageInput } from "../../components/chat/message-input";

// Types
import type { RoomsTypes } from "../../types/chat/chat";
import { ChatRoomEditorDrawer, type ChatRoomFormData } from "../../components/drawers/room-drawer";

// type RoomType = RoomsTypes["data"][number];

export default function AdminChatPage() {
    const user = useUserStore((state) => state.user);
    const { roomsData } = useLoaderData() as { roomsData: Promise<RoomsTypes> };
    const fetcher = useFetcher();

    const [activeRoom, setActiveRoom] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [replyTo, setReplyTo] = useState<any>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
    const [editingRooms, setEditingRooms] = useState<ChatRoomFormData | null>(null);

    // Socket Hook - Automatically connects/disconnects based on activeRoom
    const socketData = useChatSocket(activeRoom);


    const handleSave = (data: ChatRoomFormData) => {
        const isUpdate = !!editingRooms?._id;
        const formData = new FormData();

        formData.append("intent", isUpdate ? "update" : "create");
        if (isUpdate) formData.append("id", editingRooms._id!)
        if (!isUpdate) formData.append("created_by", user!._id)

        // Match your action's requirement: JSON stringified payload
        formData.append("payload", JSON.stringify(data));


        fetcher.submit(formData, { method: "POST" });
        setIsDrawerOpen(false);
        setEditingRooms(editingRooms)
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

            {/* LEFT SIDEBAR - ROOM LIST */}
            <Suspense fallback={
                <div className="w-72 border-r border-admin-border/20 p-4 space-y-4 animate-pulse">
                    <div className="h-4 w-24 bg-admin-primary/20 rounded" />
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 w-full bg-white/5 rounded" />
                    ))}
                </div>
            }>
                <Await resolve={roomsData}>
                    {(resolvedData: RoomsTypes) => (
                        <ChatRoomList
                            rooms={resolvedData.data}
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

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col border-x border-admin-border/20 relative">
                <Suspense fallback={
                    <div className="flex-1 flex items-center justify-center text-[10px] text-admin-primary opacity-40">
                        ESTABLISHING_ENCRYPTED_UPLINK...
                    </div>
                }>
                    <Await resolve={roomsData}>
                        {(resolvedData: RoomsTypes) => {
                            const currentRoom = resolvedData.data.find(r => r._id === activeRoom);

                            if (!activeRoom) return (
                                <div className="flex-1 flex items-center justify-center opacity-20 tracking-[1em] text-sm italic">
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
                                        onDelete={() => { }}
                                    />

                                    <div className="flex-1 flex flex-col min-h-0 relative">
                                        <MessageList
                                            messages={socketData.messages}
                                            currentUserId={user._id}
                                            onDeleteMessage={socketData.deleteMessage}
                                            onReply={(m) => setReplyTo({
                                                messageId: m._id,
                                                username: m.user_id?.nickname
                                            })}
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
            </div>

            {/* RIGHT SIDEBAR - USER TELEMETRY */}
            <aside className="w-64 hidden xl:flex flex-col p-4 bg-black/20">
                <OnlineUsersPanel users={socketData.onlineUsers} title="ACTIVE_IDENTITIES" />

                {/* System Stats Block */}
                <div className="mt-auto p-4 border border-admin-primary/10 bg-admin-primary/5 text-[9px] font-mono space-y-2">
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