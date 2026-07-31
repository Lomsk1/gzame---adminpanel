import { useState, Suspense, useEffect } from "react";
import { useLoaderData, Await, Form, useSubmit, useNavigation, useLocation, useNavigate } from "react-router";
import { UserDetailDrawer } from "../../components/drawers/user-detail-drawer";
import { MetricCard, PsychotypeBadge } from "../../components/ui/psychotypeBadge";
import { NeuralDistributionCard } from "../../components/cards/psychotipe";
import { TopOperatorsCard } from "../../components/cards/top-operator";
import type { StatsUserTypes } from "../../types/stats/user";
import type { UsersDataType } from "../../types/user/user";
import { useDebounceCallback } from "usehooks-ts";
import axiosAuth from "../../helper/axios";
import {
    AdminBadge,
    AdminCard,
    AdminPageHeader,
    AdminPageShell,
    AdminTable,
    AdminTableBody,
    AdminTableHead,
    AdminTd,
    AdminTh,
    AdminToolbar,
    AdminTr,
} from "../../components/admin";
import { useAdminT } from "../../store/locale/locale";

export default function UsersPage() {
    const { t } = useAdminT();
    const { userStatsData, usersData, initialEmail } = useLoaderData() as {
        userStatsData: Promise<StatsUserTypes['data']>,
        usersData: Promise<UsersDataType>,
        initialEmail: string
    };
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedUser, setSelectedUser] = useState<UsersDataType['data'][0] | null>(null);

    const submit = useSubmit();
    const navigation = useNavigation();

    // Open user profile from chat (e.g. "Open user's profile" on avatar)
    useEffect(() => {
        const openUserId = (location.state as { openUserId?: string })?.openUserId;
        if (!openUserId) return;
        axiosAuth.get<{ data: UsersDataType["data"][0] }>(`/api/v1/auth/users/${openUserId}`)
            .then((res) => {
                setSelectedUser(res.data.data);
                navigate(location.pathname, { replace: true, state: {} });
            })
            .catch(() => {});
    }, [location.state, location.pathname, navigate]);

    // 1. Create a debounced submit function
    // This function will only execute after 500ms of silence
    const debouncedSubmit = useDebounceCallback((target: HTMLFormElement) => {
        const isFirstSearch = initialEmail === "";
        submit(target, { replace: !isFirstSearch });
    }, 500);

    const isSearching = navigation.location && new URLSearchParams(navigation.location.search).has("email");

    return (
        <AdminPageShell className="space-y-6">
            <AdminPageHeader title={t("pages.users.directory")} />

            <Suspense fallback={<StatsLoadingSkeleton />}>
                <Await resolve={userStatsData}>
                    {(resolvedData) => {
                        const stats = resolvedData?.stats;
                        const totals = stats?.totals ?? {
                            totalUsers: 0,
                            activeUsers: 0,
                            blockedUsers: 0,
                            subscribers: 0,
                            avgLevel: 0,
                            avgStreak: 0,
                            totalSubPsichotypeUsers: 0,
                        };
                        const growth = stats?.growth ?? { newToday: 0, newThisWeek: 0 };
                        return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <MetricCard label={t("pages.users.population")} value={totals.totalUsers ?? 0} subValue={`+${growth.newThisWeek ?? 0}`} variant="primary" />
                                <MetricCard label={t("pages.users.active")} value={totals.activeUsers ?? 0} variant="primary" />
                                <MetricCard label={t("pages.users.blocked")} value={totals.blockedUsers ?? 0} variant="error" />
                                <MetricCard label={t("pages.users.avgIntel")} value={`L${totals.avgLevel ?? 0}`} variant="accent" />
                                <MetricCard label={t("pages.users.onboarding")} value={`${stats?.onboardingCompletionRate ?? 0}%`} variant="warning" />
                                <MetricCard label={t("pages.users.streak")} value={`${totals.avgStreak ?? 0}d`} variant="primary" />
                                <MetricCard label={t("pages.users.subscribers")} value={totals.subscribers ?? 0} variant="accent" />
                                <MetricCard label={t("pages.users.subRate")} value={`${stats?.subscriptionRate ?? 0}%`} variant="primary" />
                            </div>
                        );
                    }}
                </Await>
            </Suspense>

            <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
                <div className="xl:col-span-8 space-y-4">
                    <AdminCard padding="none" className="overflow-hidden">
                        <AdminToolbar
                            className="rounded-none border-x-0 border-t-0"
                            left={<h2 className="text-sm font-semibold text-admin-text">{t("pages.users.directory")}</h2>}
                            right={
                            <Form
                                method="get"
                                onChange={(e) => debouncedSubmit(e.currentTarget)}
                            >
                                <div className="relative">
                                    <input
                                        type="search"
                                        name="email"
                                        defaultValue={initialEmail}
                                        className="w-64 rounded-lg border border-admin-border bg-admin-elevated px-3 py-2 text-[11px] text-admin-text outline-none transition-colors placeholder:text-admin-text-muted focus:border-admin-primary focus:ring-2 focus:ring-admin-primary/20"
                                        placeholder={t("pages.users.searchPlaceholder")}
                                    />
                                    {isSearching && (
                                        <div className="absolute right-2 top-2.5">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-admin-primary border-t-transparent" />
                                        </div>
                                    )}
                                </div>
                            </Form>
                            }
                        >{null}</AdminToolbar>

                        <Suspense fallback={<TableLoadingSkeleton />}>
                            <Await resolve={usersData} key={initialEmail}>
                                {(resolvedUsers) => {
                                    const rows = Array.isArray(resolvedUsers?.data) ? resolvedUsers.data : [];
                                    return (
                                    <AdminTable className="max-h-175 rounded-none border-x-0 border-b-0">
                                            <AdminTableHead>
                                                <tr>
                                                    <AdminTh>{t("pages.users.tableUsers")}</AdminTh>
                                                    <AdminTh>{t("pages.users.tablePsychotype")}</AdminTh>
                                                    <AdminTh>{t("pages.users.tableStatus")}</AdminTh>
                                                    <AdminTh>{t("pages.users.tableStreak")}</AdminTh>
                                                    <AdminTh className="text-right">{t("pages.users.tableOps")}</AdminTh>
                                                </tr>
                                            </AdminTableHead>
                                            <AdminTableBody>
                                                {rows.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="px-4 py-12 text-center text-sm text-admin-text-dim">
                                                            {t("common.noResults")}
                                                        </td>
                                                    </tr>
                                                ) : rows.map((user) => (
                                                    <AdminTr
                                                        key={user._id}
                                                        onClick={() => setSelectedUser(user)}
                                                        className="group cursor-pointer"
                                                    >
                                                        <AdminTd>
                                                            <div className="flex items-center gap-3">
                                                                <span className="flex h-7 min-w-7 items-center justify-center rounded-md border border-admin-primary/25 bg-admin-primary/10 text-[13px] font-semibold text-admin-primary">
                                                                    {user.currentLevel}
                                                                </span>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-semibold text-admin-text">{user.nickname}</span>
                                                                    <span className="text-[12px] text-admin-text-dim font-mono">{user.email}</span>
                                                                </div>
                                                            </div>
                                                        </AdminTd>
                                                        <AdminTd><PsychotypeBadge type={user.psychotype} /></AdminTd>
                                                        <AdminTd><StatusBadge status={user.status} /></AdminTd>
                                                        <AdminTd className="font-mono text-xs text-admin-warning">{user.currentStreakDays}d</AdminTd>
                                                        <AdminTd className="text-right">
                                                            <button className="text-[11px] font-semibold text-admin-primary opacity-0 transition-opacity group-hover:opacity-100">{t("pages.users.inspect")} &gt;</button>
                                                        </AdminTd>
                                                    </AdminTr>
                                                ))}
                                            </AdminTableBody>
                                    </AdminTable>
                                    );
                                }}
                            </Await>
                        </Suspense>
                    </AdminCard>
                </div>

                <div className="xl:col-span-4 space-y-6">
                    <Suspense fallback={<SidebarLoadingSkeleton />}>
                        <Await resolve={userStatsData}>
                            {(resolvedData) => (
                                <>
                                    <NeuralDistributionCard
                                        primary={resolvedData?.stats?.psychotypeDistribution ?? []}
                                        subPsychotypeDistribution={resolvedData?.stats?.subPsychotypeDistribution ?? []}
                                        totalUsers={resolvedData?.stats?.totals?.totalUsers ?? 0}
                                        totalSubPsichotypeUsers={resolvedData?.stats?.totals?.totalSubPsichotypeUsers ?? 0}
                                    />
                                    <TopOperatorsCard users={resolvedData?.topUsers ?? []} />
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
        </AdminPageShell>
    );
}

/** * SUB-COMPONENTS 
 */

const StatusBadge = ({ status }: { status: string }) => {
    const { t } = useAdminT();
    const tones: Record<string, "success" | "error" | "default"> = {
        active: "success",
        blocked: "error",
        inactive: "default",
    };
    const labelKey = `common.status.${status}` as "common.status.active" | "common.status.blocked" | "common.status.inactive";
    const label = ["active", "blocked", "inactive"].includes(status)
        ? t(labelKey)
        : status;
    return (
        <AdminBadge tone={tones[status] || tones.inactive}>
            {label.toUpperCase()}
        </AdminBadge>
    );
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