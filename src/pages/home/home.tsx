import { Await, useLoaderData } from "react-router";
import { StatCard } from "../../components/stats/stat-card";
import { OracleWidget } from "../../components/oracle/widget";
import { PsychotypeRadar } from "../../components/cahrts/psychotype-radar";
import { StatusFunnel } from "../../components/cahrts/status-funnel";
import { CalibrationTable } from "../../components/table/calibration";
import type { dashboardLoader } from "../../features/stats/dashboard.loaders";
import { Suspense } from "react";
import type { DashboardStats } from "../../types/stats/dashboard";
import { DashboardSkeleton } from "../../components/skeletons/dashboard";

export default function HomePage() {
    const { dashboardData } = useLoaderData<typeof dashboardLoader>();

    return (
        <Suspense fallback={<DashboardSkeleton />}>
            {/* 2. Resolve the promise. 'data' is now type 'DashboardStats' */}
            <Await resolve={dashboardData}>
                {(data: DashboardStats) => (
                    <div className="space-y-6 animate-in fade-in duration-700">
                        {/* ROW 1: Vital Signs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Total Awakened"
                                value={data.vitalSigns.totalAwakened.toLocaleString()}
                                color="bg-admin-primary"
                            />
                            <StatCard
                                title="Energy Burn"
                                value={(data.vitalSigns.globalEnergy / 1000).toFixed(1) + "k"}
                                color="bg-admin-accent"
                            />
                            <StatCard
                                title="Avg. Streak"
                                value={`${data.vitalSigns.avgStreak.toFixed(1)} Days`}
                                color="bg-admin-success"
                            />
                            <StatCard
                                title="Quest Success"
                                value={`${data.vitalSigns.questSuccess}%`}
                                color="bg-admin-warning"
                            />
                        </div>

                        {/* ROW 2: Psychometrics */}
                        <div className="grid grid-cols-12 gap-6 min-h-112.5">
                            {/* Add min-h-0 here */}
                            <div className="col-span-12 lg:col-span-7 h-full min-h-0 overflow-hidden">
                                <PsychotypeRadar data={data.psychotypeBalance} />
                            </div>
                            {/* Add min-h-0 here */}
                            <div className="col-span-12 lg:col-span-5 h-full min-h-0">
                                <StatusFunnel data={data.funnelData} />
                            </div>
                        </div>
                        {/* ROW 3: Activity */}
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-12 lg:col-span-8">
                                <CalibrationTable items={data.recentAnswers} />
                            </div>
                            <div className="col-span-12 lg:col-span-4">
                                <OracleWidget />
                            </div>
                        </div>
                    </div>
                )}
            </Await>
        </Suspense>
    );
}