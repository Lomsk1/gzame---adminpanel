
interface TypingIndicatorProps {
    users: Array<{ id: string; name: string }>;
    className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
    users,
    className = "",
}) => {
    if (users.length === 0) return null;

    return (
        <div className={`text-[9px] text-admin-primary flex items-center gap-2 ${className}`}>
            {/* Animated dots */}
            <div className="flex gap-0.5">
                <span className="w-1 h-1 bg-admin-primary rounded-full opacity-30 animate-bounce" />
                <span className="w-1 h-1 bg-admin-primary rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="w-1 h-1 bg-admin-primary rounded-full opacity-90 animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>

            {/* User names */}
            <span className="font-bold uppercase">
                {users.length === 1
                    ? `${users[0].name} is typing...`
                    : users.length === 2
                        ? `${users[0].name} and ${users[1].name} are typing...`
                        : `${users[0].name} and ${users.length - 1} others are typing...`}
            </span>
        </div>
    );
};