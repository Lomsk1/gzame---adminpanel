import { useState, Suspense } from "react";
import { useLoaderData, Await, Form, useSubmit, useNavigation } from "react-router";
import { GlassCard } from "../../components/cards/card-glass";
import { UserDetailDrawer } from "../../components/drawers/user-detail-drawer";
import { MetricCard, PsychotypeBadge } from "../../components/ui/psychotypeBadge";
import { NeuralDistributionCard } from "../../components/cards/psychotipe";
import { TopOperatorsCard } from "../../components/cards/top-operator";
import type { StatsUserTypes } from "../../types/stats/user";
import type { UsersDataType } from "../../types/user/user";
import { useDebounceCallback } from "usehooks-ts";

export default function UsersPage() {
    const { userStatsData, usersData, initialEmail } = useLoaderData() as {
        userStatsData: Promise<StatsUserTypes['data']>,
        usersData: Promise<UsersDataType>,
        initialEmail: string
    };
    const [selectedUser, setSelectedUser] = useState<UsersDataType['data'][0] | null>(null);

    const submit = useSubmit();
    const navigation = useNavigation();

    // 1. Create a debounced submit function
    // This function will only execute after 500ms of silence
    const debouncedSubmit = useDebounceCallback((target: HTMLFormElement) => {
        const isFirstSearch = initialEmail === "";
        submit(target, { replace: !isFirstSearch });
    }, 500);

    const isSearching = navigation.location && new URLSearchParams(navigation.location.search).has("email");

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-700 bg-admin-bg/50">

            {/* 1. INDEPENDENT STATS SECTION */}
            <Suspense fallback={<StatsLoadingSkeleton />}>
                <Await resolve={userStatsData}>
                    {(resolvedData) => {
                        const { stats } = resolvedData;
                        return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <MetricCard label="Population" value={stats.totals.totalUsers} subValue={`+${stats.growth.newThisWeek}`} variant="primary" />
                                <MetricCard label="Active" value={stats.totals.activeUsers} variant="primary" />
                                <MetricCard label="Blocked" value={stats.totals.blockedUsers} variant="error" />
                                <MetricCard label="Avg Intel" value={`L${stats.totals.avgLevel}`} variant="accent" />
                                <MetricCard label="Onboarding" value={`${stats.onboardingCompletionRate}%`} variant="warning" />
                                <MetricCard label="Streak" value={`${stats.totals.avgStreak}d`} variant="primary" />
                                <MetricCard label="Subscribers" value={stats.totals.subscribers} variant="accent" />
                                <MetricCard label="Sub Rate" value={`${stats.subscriptionRate}%`} variant="primary" />
                            </div>
                        );
                    }}
                </Await>
            </Suspense>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* 2. MAIN DIRECTORY COLUMN */}
                <div className="xl:col-span-8 space-y-4">
                    <GlassCard className="p-0 overflow-hidden border-admin-border/50 shadow-2xl">
                        <div className="p-4 border-b border-admin-border/50 flex justify-between items-center bg-admin-panel/40">
                            <h2 className="text-sm font-black text-admin-primary uppercase tracking-tighter italic">Directory_v1.0.0</h2>

                            {/* Refetch Trigger: Form auto-submits on change with debounce */}
                            <Form
                                method="get"
                                onChange={(e) => debouncedSubmit(e.currentTarget)}
                            >
                                <div className="relative">
                                    <input
                                        type="search"
                                        name="email"
                                        defaultValue={initialEmail}
                                        className="bg-admin-bg border border-admin-border rounded-lg px-3 py-1.5 text-[11px] w-64 outline-none focus:ring-1 ring-admin-primary/50 transition-all"
                                        placeholder="Filter by email address..."
                                    />
                                    {isSearching && (
                                        <div className="absolute right-2 top-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-admin-primary border-t-transparent" />
                                        </div>
                                    )}
                                </div>
                            </Form>
                        </div>

                        {/* TABLE LOADING BOUNDARY - This will show TableLoadingSkeleton only while searching */}
                        <Suspense fallback={<TableLoadingSkeleton />}>
                            <Await resolve={usersData} key={initialEmail}>
                                {(resolvedUsers) => (
                                    <div className="overflow-x-auto max-h-175 custom-scrollbar">
                                        <table className="w-full text-left">
                                            <thead className="sticky top-0 z-10 bg-admin-panel/95 backdrop-blur-md text-[9px] font-black text-admin-text-dim uppercase tracking-[0.2em] border-b border-admin-border/30">
                                                <tr>
                                                    <th className="px-6 py-4">Users</th>
                                                    <th className="px-6 py-4">Psychotype</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4">Streak</th>
                                                    <th className="px-6 py-4 text-right">Ops</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-admin-border/10">
                                                {resolvedUsers.data.map((user) => (
                                                    <tr
                                                        key={user._id}
                                                        onClick={() => setSelectedUser(user)}
                                                        className="hover:bg-admin-primary/5 transition-colors group cursor-pointer"
                                                    >
                                                        <td className="px-6 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <span className="flex items-center justify-center min-w-6 h-6 rounded bg-admin-card border border-admin-border text-[10px] font-bold text-admin-primary">
                                                                    {user.currentLevel}
                                                                </span>
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-bold text-admin-text">{user.nickname}</span>
                                                                    <span className="text-[9px] text-admin-text-dim font-mono">{user.email}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-3"><PsychotypeBadge type={user.psychotype} /></td>
                                                        <td className="px-6 py-3"><StatusBadge status={user.status} /></td>
                                                        <td className="px-6 py-3 text-xs font-mono text-admin-warning">{user.currentStreakDays}d</td>
                                                        <td className="px-6 py-3 text-right">
                                                            <button className="text-[10px] font-black text-admin-primary opacity-0 group-hover:opacity-100 uppercase transition-all">Inspect_&gt;</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Await>
                        </Suspense>
                    </GlassCard>
                </div>

                {/* 3. STRATEGIC ANALYSIS COLUMN */}
                <div className="xl:col-span-4 space-y-6">
                    <Suspense fallback={<SidebarLoadingSkeleton />}>
                        <Await resolve={userStatsData}>
                            {(resolvedData) => (
                                <>
                                    <NeuralDistributionCard
                                        primary={resolvedData.stats.psychotypeDistribution}
                                        subPsychotypeDistribution={resolvedData.stats.subPsychotypeDistribution}
                                        totalUsers={resolvedData.stats.totals.totalUsers}
                                        totalSubPsichotypeUsers={resolvedData.stats.totals.totalSubPsichotypeUsers}
                                    />
                                    <TopOperatorsCard users={resolvedData.topUsers} />
                                </>
                            )}
                        </Await>
                    </Suspense>
                </div>
            </div>

            {selectedUser && (
                <UserDetailDrawer
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    );
}

/** * SUB-COMPONENTS 
 */

const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        active: "border-admin-success/30 text-admin-success bg-admin-success/5",
        blocked: "border-admin-error/30 text-admin-error bg-admin-error/5",
        inactive: "border-admin-text-dim/30 text-admin-text-dim bg-admin-text-dim/5",
    };
    return <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${styles[status] || styles.inactive}`}>{status.toUpperCase()}</span>;
};

const StatsLoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse bg-admin-panel/20 rounded-xl border border-admin-border/30" />
        ))}
    </div>
);

const TableLoadingSkeleton = () => (
    <div className="p-4 space-y-4">
        {[...Array(10)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse bg-admin-panel/10 rounded-lg border border-admin-border/10" />
        ))}
    </div>
);

const SidebarLoadingSkeleton = () => (
    <div className="space-y-6">
        <div className="h-64 animate-pulse bg-admin-panel/20 rounded-2xl border border-admin-border/50" />
        <div className="h-96 animate-pulse bg-admin-panel/20 rounded-2xl border border-admin-border/50" />
    </div>
);