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
}

export const OnlineUsersPanel: React.FC<OnlineUsersPanelProps> = ({ users = [], title }) => {
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
            <div className="h-full flex flex-col font-mono">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-admin-primary mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-admin-primary animate-pulse" />
                    {title || "Online Users"}
                </h3>
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500 text-sm italic">No users online</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col font-mono">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-admin-primary mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-admin-primary animate-pulse" />
                {title || `Online Users (${validUsers.length})`}
            </h3>

            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
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
                        <div key={userId} className="group border border-white/5 p-2 hover:border-admin-primary/30 transition-all bg-white/2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 border border-admin-primary/20 p-0.5 relative">
                                    <img
                                        src={avatarUrl}
                                        className="w-full h-full grayscale hover:grayscale-0 transition-all"
                                        alt={`${nickname}'s avatar`}
                                        onError={(e) => {
                                            // Fallback if image fails to load
                                            e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${nickname}`;
                                        }}
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-admin-primary border border-black" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[11px] font-bold text-white uppercase truncate tracking-tighter">
                                        {nickname}
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[8px] text-admin-primary/60">LVL_{currentLevel}</span>
                                        <span className="text-[7px] text-gray-600">ID: {shortId}</span>
                                    </div>
                                </div>
                            </div>
                            {psychotype && (
                                <div className="mt-2 text-[8px] text-center bg-admin-primary/5 border border-admin-primary/10 py-0.5 text-admin-primary/70 uppercase italic tracking-widest">
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