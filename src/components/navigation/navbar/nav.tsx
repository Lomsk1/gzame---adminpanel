import useUserStore from "../../../store/user/user";

export default function NavBarMain() {
    const user = useUserStore((state) => state.user);
    const logout = useUserStore((state) => state.logout);

    return (
        <header className="h-20 bg-admin-panel/50 backdrop-blur-md border-b border-admin-border flex items-center justify-between px-8 sticky top-0 z-40">
            <h2 className="text-sm font-medium text-admin-text-dim">
                System Status: <span className="text-admin-success">Online</span>
            </h2>

            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm font-bold leading-none">{user?.nickname}</p>
                    <p className="text-[10px] text-admin-primary uppercase tracking-widest">{user?.role}</p>
                </div>

                <button
                    onClick={logout}
                    className="p-2 bg-admin-card border border-admin-border rounded-lg hover:border-admin-error transition-colors group cursor-pointer"
                >
                    <span className="text-xs group-hover:text-admin-error transition-colors">Logout</span>
                </button>
            </div>
        </header>
    );
}