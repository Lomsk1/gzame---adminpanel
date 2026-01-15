const SkeletonCard = () => (
    <div className="h-32 bg-admin-card/50 border border-admin-border/50 rounded-2xl animate-pulse relative overflow-hidden">
        <div className="absolute inset-0  from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
    </div>
);

export const DashboardSkeleton = () => (
    <div className="space-y-6">
        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-12 gap-6 h-112.5">
            <div className="col-span-12 lg:col-span-7 bg-admin-card/50 rounded-3xl animate-pulse" />
            <div className="col-span-12 lg:col-span-5 bg-admin-card/50 rounded-3xl animate-pulse" />
        </div>

        {/* Table Row */}
        <div className="grid grid-cols-12 gap-6 h-64">
            <div className="col-span-8 bg-admin-card/50 rounded-3xl animate-pulse" />
            <div className="col-span-4 bg-admin-card/50 rounded-3xl animate-pulse" />
        </div>
    </div>
);