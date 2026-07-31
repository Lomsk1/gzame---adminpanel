import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import type { DashboardStats } from "../../types/stats/dashboard";
import { useAdminT } from "../../store/locale/locale";

export const StatusFunnel = ({ data }: { data: DashboardStats["funnelData"] }) => {
  const { t } = useAdminT();
  const rows = Array.isArray(data) ? data : [];

  return (
    <div className="bg-admin-card border border-admin-border rounded-xl p-5 h-full flex flex-col admin-fade-up shadow-[var(--shadow-admin-sm)]">
      <h3 className="mb-5 text-xs font-semibold tracking-wider uppercase text-admin-text-muted">
        {t("home.chart.funnelTitle")}
      </h3>
      <div className="flex-1 w-full min-h-80">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 400, height: 300 }}>
          <BarChart data={rows} layout="vertical" margin={{ left: 20, right: 30 }}>
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fill: "var(--color-admin-text)", fontSize: 12 }}
              width={50}
              axisLine={false}
              tickLine={false}
              textAnchor="end"
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                backgroundColor: "var(--color-admin-panel)",
                border: "1px solid var(--color-admin-border)",
                borderRadius: "12px",
                color: "var(--color-admin-text)",
              }}
              labelStyle={{ color: "var(--color-admin-text-dim)", fontSize: "12px" }}
              itemStyle={{ color: "var(--color-admin-text)", fontSize: "14px", fontWeight: 600 }}
            />
            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
              {rows.map((_entry, index) => (
                <Cell
                  key={index}
                  fill={index === 2 ? "var(--color-admin-success)" : "var(--color-admin-primary)"}
                  opacity={1 - index * 0.2}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
