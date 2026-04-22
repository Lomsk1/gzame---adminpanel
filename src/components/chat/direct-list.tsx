import React from "react";
import type { DirectConversationListItem } from "../../features/chat/direct.api";

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/identicon/svg?seed=user";

interface DirectListProps {
  conversations: DirectConversationListItem[];
  activeConversationId: string | null;
  onSelect: (conversationId: string, nickname: string) => void;
  loading?: boolean;
}

export const DirectConversationList: React.FC<DirectListProps> = ({
  conversations,
  activeConversationId,
  onSelect,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 bg-white/5 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-center">
        <p className="text-sm text-admin-text-dim">
          No direct chats yet.
          <br />
          <span className="text-xs">Click an avatar in a room and choose &quot;Open chat with him&quot;</span>
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
      {conversations.map((conv) => {
        const other =
          conv.other_user ??
          conv.participants?.[0] ?? { _id: conv._id, nickname: "Conversation" };
        const isActive = activeConversationId === conv._id;
        const avatarUrl = other.avatar_url || DEFAULT_AVATAR;
        // Don't show unread for the conversation we're currently viewing
        const hasUnread = (conv.unread_count ?? 0) > 0 && !isActive;

        return (
          <button
            key={conv._id}
            type="button"
            onClick={() => onSelect(conv._id, other.nickname || "User")}
            className={`w-full text-left transition-all duration-150 rounded-lg border overflow-hidden ${
              isActive
                ? "bg-admin-primary/10 border-admin-primary/50 border-l-2 border-l-admin-primary"
                : "border-admin-border/10 hover:bg-white/5 hover:border-admin-border/30"
            }`}
          >
            <div className="p-3 flex items-center gap-3">
              <div className="shrink-0 relative">
                <img
                  src={avatarUrl}
                  alt=""
                  className="w-10 h-10 rounded-lg border border-admin-primary/20 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_AVATAR;
                  }}
                />
                {hasUnread && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-admin-primary rounded-full border border-admin-panel" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-sm font-bold truncate ${isActive ? "text-admin-primary" : "text-admin-text"}`}>
                    {other.nickname || "User"}
                  </span>
                  {hasUnread && (
                    <span className="text-[10px] bg-admin-primary text-admin-bg px-1.5 py-0.5 rounded shrink-0">
                      {conv.unread_count > 99 ? "99+" : conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
