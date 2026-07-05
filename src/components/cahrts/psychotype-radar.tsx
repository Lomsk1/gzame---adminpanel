import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import type { DashboardStats } from "../../types/stats/dashboard";
import { useAdminT } from "../../store/locale/locale";

export const PsychotypeRadar = ({ data }: { data: DashboardStats["psychotypeBalance"] }) => {
  const { t } = useAdminT();

  return (
    <div className="bg-admin-card border border-admin-border rounded-3xl p-6 h-full flex flex-col admin-fade-up">
      <h3 className="font-bold text-admin-text mb-4 uppercase text-xs tracking-widest">
        {t("home.chart.radarTitle")}
      </h3>
      <div className="relative flex-1 w-full min-h-80">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 400, height: 300 }}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="var(--color-admin-border)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "var(--color-admin-text-dim)", fontSize: 10 }}
            />
            <Radar
              name={t("home.chart.primary")}
              dataKey="primary"
              stroke="var(--color-admin-primary)"
              fill="var(--color-admin-primary)"
              fillOpacity={0.5}
            />
            <Radar
              name={t("home.chart.secondary")}
              dataKey="secondary"
              stroke="var(--color-admin-accent)"
              fill="var(--color-admin-accent)"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
