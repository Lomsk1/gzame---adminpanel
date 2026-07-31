import { useState, useCallback, Suspense, useEffect, useMemo } from "react";
import { Await, useFetcher, useLoaderData, useNavigate, useRevalidator } from "react-router";
import useUserStore from "../../store/user/user";
import { useChatSocket } from "../../hooks/useChatSocket";
import { GlassCard } from "../../components/cards/card-glass";
import { ChatRoomList } from "../../components/chat/room-list";
import { ChatHeader } from "../../components/chat/header";
import { MessageList } from "../../components/chat/message-list";
import { MessageInput } from "../../components/chat/message-input";
import { OnlineUsersPanel } from "../../components/chat/online-user-panel";
import { AvatarMenu } from "../../components/chat/avatar-menu";
import { ChatRoomEditorDrawer, type ChatRoomFormData } from "../../components/drawers/room-drawer";
import { deleteRoom } from "../../features/chat/chats.loaders";
import {
  addBlockedWord,
  adminBlockUserFromChat,
  adminUnblockUserFromChat,
  deleteBlockedWord,
  getBlockedWords,
  getChatBlockedUsers,
  type ChatBlockedUserItem,
  type ChatBlockedWordItem,
} from "../../features/chat/moderation.api";
import type { RoomsTypes } from "../../types/chat/chat";
import { AdminPageHeader, AdminPageShell } from "../../components/admin";
import { useAdminT } from "../../store/locale/locale";

type AdminRoom = RoomsTypes["data"][number];

const isPublicRoom = (room: AdminRoom) => room.is_public && room.type !== "private";

export default function AdminChatPage() {
  const { t } = useAdminT();
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const { roomsData } = useLoaderData() as { roomsData: Promise<RoomsTypes> };
  const fetcher = useFetcher();
  const revalidator = useRevalidator();

  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingRooms, setEditingRooms] = useState<ChatRoomFormData | null>(null);
  const [publicRoomCount, setPublicRoomCount] = useState(0);

  const [avatarMenuUser, setAvatarMenuUser] = useState<{ _id: string; nickname?: string; avatar_url?: string } | null>(null);
  const [avatarMenuAnchor, setAvatarMenuAnchor] = useState<HTMLElement | null>(null);

  const [blockedUsers, setBlockedUsers] = useState<ChatBlockedUserItem[]>([]);
  const [blockedWords, setBlockedWords] = useState<ChatBlockedWordItem[]>([]);
  const [newBlockedWord, setNewBlockedWord] = useState("");
  const isAdmin = user?.role === "admin";

  const socketData = useChatSocket(activeRoom);

  useEffect(() => {
    roomsData
      .then((resolved) => {
        const publicRooms = (Array.isArray(resolved?.data) ? resolved.data : []).filter(isPublicRoom);
        setPublicRoomCount(publicRooms.length);
        if (publicRooms.length === 0) {
          if (activeRoom) setActiveRoom(null);
          return;
        }
        if (!activeRoom || !publicRooms.some((room) => room._id === activeRoom)) {
          setActiveRoom(publicRooms[0]._id);
        }
      })
      .catch(console.error);
  }, [roomsData, activeRoom, user]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && (fetcher.data as { success?: boolean }).success) {
      revalidator.revalidate();
    }
  }, [fetcher.state, fetcher.data, revalidator, user]);

  const refreshModerationData = useCallback(() => {
    if (!isAdmin) return;
    getChatBlockedUsers()
      .then((res) => setBlockedUsers(Array.isArray(res.data) ? res.data : []))
      .catch(console.error);
    getBlockedWords()
      .then((res) => setBlockedWords(Array.isArray(res.data) ? res.data : []))
      .catch(console.error);
  }, [isAdmin]);

  useEffect(() => {
    refreshModerationData();
  }, [refreshModerationData]);

  const blockedUserIdSet = useMemo(
    () => new Set(blockedUsers.map((x) => x.user_id?._id).filter(Boolean)),
    [blockedUsers]
  );

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

  const handleTerminateRoom = useCallback(async () => {
    if (!activeRoom) return;
    try {
      await deleteRoom(activeRoom);
      setActiveRoom(null);
      revalidator.revalidate();
    } catch (error) {
      console.error(error);
    }
  }, [activeRoom, revalidator]);

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

  const handleToggleChatBlock = useCallback(async (userId: string, shouldBlock: boolean) => {
    try {
      if (shouldBlock) {
        await adminBlockUserFromChat(userId, "Blocked by admin from public room panel");
      } else {
        await adminUnblockUserFromChat(userId);
      }
      refreshModerationData();
    } catch (error) {
      console.error(error);
    }
  }, [refreshModerationData]);

  const handleAddBlockedWord = useCallback(async () => {
    const value = newBlockedWord.trim();
    if (!value) return;
    try {
      await addBlockedWord(value);
      setNewBlockedWord("");
      refreshModerationData();
    } catch (error) {
      console.error(error);
    }
  }, [newBlockedWord, refreshModerationData]);

  const handleSendMessage = useCallback((content: string) => {
    socketData.sendMessage(content);
  }, [socketData]);

  if (!user) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-admin-primary font-mono tracking-widest animate-pulse">
        [!] {t("chat.authRequired")}
      </div>
    );
  }

  return (
    <AdminPageShell noPadding className="space-y-6 p-2">
      <AdminPageHeader
        title={t("pages.chat.title")}
        badge={
          <div className="inline-flex items-center gap-2 rounded-xl border border-admin-primary/30 bg-admin-primary/10 px-3 py-2 text-xs text-admin-primary mb-2">
            <span className="h-2 w-2 rounded-full bg-admin-success" />
            {t("chat.liveModeration")}
          </div>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 admin-fade-up" style={{ animationDelay: "80ms" }}>
        <MetricCard label={t("chat.scope")} value={t("chat.scopePublic")} />
        <MetricCard label={t("chat.rooms")} value={String(publicRoomCount)} />
        <MetricCard label={t("chat.onlineUsers")} value={String(socketData.onlineUsers.length)} />
        <MetricCard label={t("chat.connection")} value={socketData.isConnected ? t("chat.healthy") : t("chat.reconnecting")} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 min-h-[70vh]">
        <div className="xl:col-span-3">
          <div className="h-full min-h-[65vh]">
            <Suspense
              fallback={
                <GlassCard className="h-full">
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 w-32 rounded bg-admin-primary/20" />
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-12 rounded-lg bg-admin-bg/40" />
                    ))}
                  </div>
                </GlassCard>
              }
            >
              <Await resolve={roomsData}>
                {(resolvedData: RoomsTypes) => {
                  const publicRooms = (Array.isArray(resolvedData?.data) ? resolvedData.data : []).filter(isPublicRoom);
                  return (
                    <ChatRoomList
                      rooms={publicRooms}
                      activeRoom={activeRoom}
                      onSelectRoom={(id) => {
                        setActiveRoom(id);
                      }}
                      onCreateRoom={() => setIsDrawerOpen(true)}
                      title={t("chat.roomDirectory")}
                      description={t("chat.roomDirectoryDesc")}
                      emptyMessage={t("chat.noPublicRooms")}
                    />
                  );
                }}
              </Await>
            </Suspense>
          </div>
        </div>

        <div className="xl:col-span-6">
          <GlassCard className="h-[70vh] overflow-hidden border-admin-border/40" noContentPadding>
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center text-sm text-admin-text-dim">
                  {t("chat.loadingRoom")}
                </div>
              }
            >
              <Await resolve={roomsData}>
                {(resolvedData: RoomsTypes) => {
                  const publicRooms = (Array.isArray(resolvedData?.data) ? resolvedData.data : []).filter(isPublicRoom);
                  const currentRoom = publicRooms.find((room) => room._id === activeRoom);

                  if (!currentRoom) {
                    return (
                      <div className="h-full flex items-center justify-center p-6 text-center">
                        <div>
                          <h3 className="text-lg font-bold text-admin-text">{t("chat.noRoomSelected")}</h3>
                          <p className="mt-2 text-sm text-admin-text-dim">
                            {t("chat.selectRoomHint")}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="h-full min-h-0 flex flex-col">
                      <ChatHeader
                        roomName={currentRoom.name}
                        roomType={t("chat.roomTypePublic")}
                        participantCount={socketData.onlineUsers.length}
                        isConnected={socketData.isConnected}
                        onRefresh={socketData.reconnect}
                        onDelete={handleTerminateRoom}
                      />

                      <MessageList
                        messages={socketData.messages}
                        currentUserId={user._id}
                        canDeleteAnyMessage={user.role === "admin"}
                        onDeleteMessage={socketData.deleteMessage}
                        onAvatarClick={user.role === "admin" ? handleAvatarClick : undefined}
                        onLoadOlder={socketData.loadOlderMessages}
                        hasMoreOlder={socketData.hasMoreOlder}
                        loadingOlder={socketData.loadingOlder}
                      />

                      <div className="border-t border-admin-border/30 bg-admin-panel/30 p-4">
                        <MessageInput
                          onSubmit={handleSendMessage}
                          onTypingStart={socketData.startTyping}
                          onTypingStop={socketData.stopTyping}
                          isConnected={socketData.isConnected}
                        />
                      </div>
                    </div>
                  );
                }}
              </Await>
            </Suspense>
          </GlassCard>
        </div>

        <div className="xl:col-span-3 space-y-4">
          <GlassCard className="h-[38vh] overflow-hidden border-admin-border/40">
            <OnlineUsersPanel
              users={socketData.onlineUsers}
              title={t("chat.participants")}
              onAvatarClick={user.role === "admin" ? (u, el) => handleAvatarClick(u, el) : undefined}
            />
          </GlassCard>

          {isAdmin && (
            <GlassCard className="border-admin-border/40">
              <h4 className="text-sm font-semibold text-admin-text mb-3">{t("chat.blockedWords")}</h4>
              <div className="flex gap-2">
                <input
                  value={newBlockedWord}
                  onChange={(e) => setNewBlockedWord(e.target.value)}
                  placeholder={t("chat.addBlockedWordPh")}
                  className="flex-1 rounded-lg border border-admin-border bg-admin-bg/40 px-2 py-1.5 text-xs text-admin-text outline-none focus:ring-1 ring-admin-primary/40"
                />
                <button
                  type="button"
                  onClick={handleAddBlockedWord}
                  className="rounded-lg bg-admin-primary px-3 py-1.5 text-xs font-semibold text-admin-bg hover:bg-admin-accent transition-colors"
                >
                  {t("common.add")}
                </button>
              </div>
              <div className="mt-3 max-h-24 space-y-1 overflow-y-auto custom-scrollbar">
                {blockedWords.map((word) => (
                  <div key={word._id} className="flex items-center justify-between rounded border border-admin-border/30 bg-admin-bg/20 px-2 py-1 text-xs">
                    <span className="truncate">{word.word}</span>
                    <button
                      type="button"
                      onClick={() => deleteBlockedWord(word._id).then(refreshModerationData).catch(console.error)}
                      className="text-admin-error hover:underline"
                    >
                      {t("chat.remove")}
                    </button>
                  </div>
                ))}
                {blockedWords.length === 0 && <p className="text-xs text-admin-text-dim">{t("chat.noBlockedWords")}</p>}
              </div>
            </GlassCard>
          )}

          {isAdmin && (
            <GlassCard className="border-admin-border/40">
              <h4 className="text-sm font-semibold text-admin-text mb-3">{t("chat.blockedUsers")}</h4>
              <div className="max-h-28 overflow-y-auto custom-scrollbar space-y-1">
                {blockedUsers.length === 0 && <p className="text-xs text-admin-text-dim">{t("chat.noBlockedUsers")}</p>}
                {blockedUsers.map((item) => (
                  <div key={item._id} className="flex items-center justify-between gap-2 rounded border border-admin-border/30 bg-admin-bg/20 px-2 py-1 text-xs">
                    <span className="truncate">{item.user_id?.nickname || item.user_id?._id}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleChatBlock(item.user_id._id, false)}
                      className="text-admin-success hover:underline"
                    >
                      {t("chat.unblock")}
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </section>

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
        onOpenProfile={handleOpenProfile}
        isChatBlocked={avatarMenuUser ? blockedUserIdSet.has(avatarMenuUser._id) : false}
        onToggleChatBlock={handleToggleChatBlock}
      />
    </AdminPageShell>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-admin-border/40 bg-admin-panel/40 px-4 py-3">
      <p className="text-[10px] uppercase tracking-widest text-admin-text-dim">{label}</p>
      <p className="mt-1 text-lg font-bold text-admin-text">{value}</p>
    </div>
  );
}
