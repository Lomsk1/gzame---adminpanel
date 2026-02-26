import React, { useEffect, useRef } from "react";

export interface ChatUserMinimal {
  _id: string;
  nickname?: string;
  avatar_url?: string;
}

interface AvatarMenuProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  user: ChatUserMinimal | null;
  onClose: () => void;
  onOpenChat: (userId: string) => void;
  onOpenProfile: (userId: string) => void;
}

const defaultAvatar = "https://api.dicebear.com/7.x/identicon/svg?seed=user";

export const AvatarMenu: React.FC<AvatarMenuProps> = ({
  open,
  anchorEl,
  user,
  onClose,
  onOpenChat,
  onOpenProfile,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        anchorEl &&
        !anchorEl.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, anchorEl, onClose]);

  if (!open || !user) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" aria-hidden />
      <div
        ref={menuRef}
        className="fixed z-50 min-w-56 rounded-xl border border-admin-border bg-admin-panel p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150"
        style={
          anchorEl
            ? {
                top: anchorEl.getBoundingClientRect().bottom + 6,
                left: anchorEl.getBoundingClientRect().left,
              }
            : undefined
        }
        role="menu"
      >
        <div className="flex items-center gap-3 border-b border-admin-border/50 pb-2 mb-2">
          <img
            src={user.avatar_url || defaultAvatar}
            alt=""
            className="w-10 h-10 rounded-lg border border-admin-primary/20 object-cover"
          />
          <span className="text-sm font-bold text-admin-text truncate">
            {user.nickname}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            onOpenChat(user._id);
            onClose();
          }}
          className="w-full text-left px-3 py-2 text-sm text-admin-text hover:bg-admin-primary/10 rounded-lg transition-colors flex items-center gap-2"
          role="menuitem"
        >
          <span className="text-admin-primary">💬</span>
          Open chat with him
        </button>
        <button
          type="button"
          onClick={() => {
            onOpenProfile(user._id);
            onClose();
          }}
          className="w-full text-left px-3 py-2 text-sm text-admin-text hover:bg-admin-primary/10 rounded-lg transition-colors flex items-center gap-2"
          role="menuitem"
        >
          <span className="text-admin-primary">👤</span>
          Open user&apos;s profile
        </button>
      </div>
    </>
  );
};
