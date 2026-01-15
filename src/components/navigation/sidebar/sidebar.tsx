import { NavLink } from "react-router";

export default function MainSidebar() {
    const navGroups = [
        { label: "Intelligence", links: [{ to: "/", label: "Dashboard" }, { to: "/ai", label: "AI Gemini" }] },
        { label: "Users & Progression", links: [{ to: "/users", label: "Users" }, { to: "/levels", label: "Level Config" }] }, // Added
        { label: "Psychometry", links: [{ to: "/questions", label: "Questions" }, { to: "/answers", label: "Answer Logs" }] },
        { label: "Operations", links: [{ to: "/quests", label: "Quest Templates" }, { to: "/rooms", label: "Chat Rooms" }] }, // Added
    ];

    return (
        <aside className="w-64 h-screen bg-admin-panel border-r border-admin-border flex flex-col sticky top-0">
            {/* Logo Section */}
            <div className="h-20 flex items-center px-6 border-b border-admin-border">
                <div className="w-8 h-8 bg-admin-primary rounded-lg mr-3 shadow-[0_0_15px_rgba(59,130,246,0.4)]" />
                <span className="text-xl font-bold tracking-tighter">ANOMALY</span>
            </div>

            {/* Navigation Groups */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-8">
                {navGroups.map((group) => (
                    <div key={group.label} className="space-y-2">
                        <h3 className="px-3 text-xs font-semibold text-admin-text-dim uppercase tracking-widest">
                            {group.label}
                        </h3>
                        {group.links.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) => `
                                    flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group
                                    ${isActive
                                        ? "bg-admin-primary/10 text-admin-primary border border-admin-primary/20 shadow-[inset_0_0_10px_rgba(59,130,246,0.05)]"
                                        : "text-admin-text-dim hover:text-admin-text hover:bg-admin-card"}
                                `}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>
        </aside>
    );
}