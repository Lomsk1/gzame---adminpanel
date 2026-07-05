import { Await, useLoaderData } from "react-router";
import { Suspense } from "react";
import { StatCard } from "../../components/stats/stat-card";
import { OracleWidget } from "../../components/oracle/widget";
import { PsychotypeRadar } from "../../components/cahrts/psychotype-radar";
import { StatusFunnel } from "../../components/cahrts/status-funnel";
import { CalibrationTable } from "../../components/table/calibration";
import type { dashboardLoader } from "../../features/stats/dashboard.loaders";
import type { DashboardStats } from "../../types/stats/dashboard";
import { DashboardSkeleton } from "../../components/skeletons/dashboard";
import { AdminPageShell, AdminStagger } from "../../components/admin";
import { useAdminT } from "../../store/locale/locale";

export default function HomePage() {
  const { dashboardData } = useLoaderData<typeof dashboardLoader>();
  const { t } = useAdminT();

  return (
    <AdminPageShell>
      <Suspense fallback={<DashboardSkeleton />}>
        <Await resolve={dashboardData}>
          {(data: DashboardStats) => (
            <div className="space-y-6">
              <AdminStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title={t("pages.home.stats.totalAwakened")}
                  value={data.vitalSigns.totalAwakened.toLocaleString()}
                  color="bg-admin-primary"
                />
                <StatCard
                  title={t("pages.home.stats.energyBurn")}
                  value={(data.vitalSigns.globalEnergy / 1000).toFixed(1) + "k"}
                  color="bg-admin-accent"
                />
                <StatCard
                  title={t("pages.home.stats.avgStreak")}
                  value={`${data.vitalSigns.avgStreak.toFixed(1)}${t("common.daysSuffix")}`}
                  color="bg-admin-success"
                />
                <StatCard
                  title={t("pages.home.stats.questSuccess")}
                  value={`${data.vitalSigns.questSuccess}%`}
                  color="bg-admin-warning"
                />
              </AdminStagger>

              <div className="grid grid-cols-12 gap-6 min-h-112.5 admin-fade-up" style={{ animationDelay: "120ms" }}>
                <div className="col-span-12 lg:col-span-7 h-full min-h-0 overflow-hidden">
                  <PsychotypeRadar data={data.psychotypeBalance} />
                </div>
                <div className="col-span-12 lg:col-span-5 h-full min-h-0">
                  <StatusFunnel data={data.funnelData} />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6 admin-fade-up" style={{ animationDelay: "180ms" }}>
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
    </AdminPageShell>
  );
}
