const SkeletonCard = () => (
    <div className="relative h-32 overflow-hidden rounded-xl border border-admin-border bg-admin-card/50 animate-pulse">
        <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-admin-primary/10 to-transparent animate-[shimmer_2s_infinite]" />
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
            <div className="col-span-12 rounded-xl border border-admin-border bg-admin-card/50 animate-pulse lg:col-span-7" />
            <div className="col-span-12 rounded-xl border border-admin-border bg-admin-card/50 animate-pulse lg:col-span-5" />
        </div>

        {/* Table Row */}
        <div className="grid grid-cols-12 gap-6 h-64">
            <div className="col-span-8 rounded-xl border border-admin-border bg-admin-card/50 animate-pulse" />
            <div className="col-span-4 rounded-xl border border-admin-border bg-admin-card/50 animate-pulse" />
        </div>
    </div>
);