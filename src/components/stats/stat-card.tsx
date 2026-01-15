interface StatCardProps {
    title: string;
    value: string;
    trend?: string; // ✅ Made optional with "?"
    color: string;
}

export const StatCard = ({ title, value, trend = "", color }: StatCardProps) => (
    <div className="group relative bg-admin-panel border border-admin-border p-6 rounded-2xl transition-all duration-300 hover:border-admin-primary/50 hover:-translate-y-1">
        <div className="absolute inset-0 bg-admin-primary/5 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl rounded-full" />

        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-admin-text-dim">{title}</p>

        <div className="flex items-baseline gap-3 mt-3">
            <h2 className="text-3xl font-black text-admin-text">{value}</h2>

            {/* ✅ Only render if trend exists */}
            {trend && (
                <span className={`text-xs font-bold ${trend.startsWith('+') ? 'text-admin-success' : 'text-admin-error'}`}>
                    {trend}
                </span>
            )}
        </div>

        <div className="mt-4 h-1 w-full bg-admin-bg rounded-full overflow-hidden">
            {/* Fix: Directly use color prop or a mapping if needed */}
            <div className={`h-full ${color} w-2/3 transition-all duration-1000 ease-out group-hover:w-full`} />
        </div>
    </div>
);