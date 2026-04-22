interface User {
    _id: string;
    nickname: string;
    avatar_url?: string;
    currentLevel?: number;
    psychotype?: string;
}

interface OnlineUsersPanelProps {
    users: User[];
    title?: string;
    className?: string;
    /** When provided, clicking an avatar opens menu (e.g. for admin). */
    onAvatarClick?: (user: User, anchorEl: HTMLElement) => void;
}

export const OnlineUsersPanel: React.FC<OnlineUsersPanelProps> = ({ users = [], title, onAvatarClick }) => {
    // Filter out invalid users
    const validUsers = users?.filter(user =>
        user &&
        typeof user === 'object' &&
        user._id &&
        typeof user._id === 'string'
    ) || [];


    // If no valid users, show empty state
    if (validUsers.length === 0) {
        return (
            <div className="h-full flex flex-col">
                <h3 className="text-sm font-semibold text-admin-text mb-3 flex items-center justify-between">
                    {title || "Online Users"}
                    <span className="text-xs text-admin-text-dim">0</span>
                </h3>
                <div className="flex-1 flex items-center justify-center rounded-xl border border-admin-border/30 bg-admin-bg/30 px-3">
                    <p className="text-admin-text-dim text-sm">No users online</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-sm font-semibold text-admin-text mb-3 flex items-center justify-between">
                <span>{title || "Online Users"}</span>
                <span className="text-xs text-admin-text-dim">{validUsers.length}</span>
            </h3>

            <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
                {validUsers.map((user) => {
                    // Safe access to properties with defaults
                    const userId = user._id || 'unknown';
                    const nickname = user.nickname || 'Unknown User';
                    const avatarUrl = user.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${nickname}`;
                    const currentLevel = user.currentLevel || 1;
                    const psychotype = user.psychotype;

                    // Safe ID shortening
                    const shortId = userId.length >= 6 ? userId.substring(0, 6) : userId;

                    return (
                        <div key={userId} className="group rounded-xl border border-admin-border/30 bg-admin-bg/30 p-2.5 hover:border-admin-primary/30 transition-colors">
                            <div className="flex items-center gap-3">
                                {onAvatarClick ? (
                                    <button
                                        type="button"
                                        onClick={(e) => onAvatarClick(user, e.currentTarget)}
                                        className="w-9 h-9 border border-admin-border/40 p-0.5 relative shrink-0 rounded-lg overflow-hidden hover:border-admin-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-admin-primary/50"
                                    >
                                        <img
                                            src={avatarUrl}
                                            className="w-full h-full object-cover"
                                            alt={`${nickname}'s avatar`}
                                            onError={(e) => {
                                                e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${nickname}`;
                                            }}
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-admin-success border border-admin-panel rounded-full" />
                                    </button>
                                ) : (
                                    <div className="w-9 h-9 border border-admin-border/40 p-0.5 relative shrink-0 rounded-lg overflow-hidden">
                                        <img
                                            src={avatarUrl}
                                            className="w-full h-full object-cover"
                                            alt={`${nickname}'s avatar`}
                                            onError={(e) => {
                                                e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${nickname}`;
                                            }}
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-admin-success border border-admin-panel rounded-full" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-admin-text truncate">
                                        {nickname}
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-xs text-admin-text-dim">Lvl {currentLevel}</span>
                                        <span className="text-xs text-admin-text-muted">{shortId}</span>
                                    </div>
                                </div>
                            </div>
                            {psychotype && (
                                <div className="mt-2 rounded border border-admin-primary/20 bg-admin-primary/10 py-1 text-center text-[10px] text-admin-primary">
                                    {psychotype}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};