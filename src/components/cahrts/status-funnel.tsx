import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import type { DashboardStats } from "../../types/stats/dashboard";

export const StatusFunnel = ({ data }: { data: DashboardStats['funnelData'] }) => (
    <div className="bg-admin-card border border-admin-border rounded-3xl p-6 h-full flex flex-col">
        <h3 className="font-bold text-admin-text mb-6 uppercase text-xs tracking-widest">Onboarding Funnel</h3>
        <div className="flex-1 w-full min-h-80">
            <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 400, height: 300 }}>
                {/* 1. Added more margin-left to prevent cutting off text */}
                <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30 }}>
                    <XAxis type="number" hide />

                    {/* 2. Added width and textAnchor to YAxis */}
                    <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fill: "#fff", fontSize: 12, }}
                        width={50}
                        axisLine={false}
                        tickLine={false}
                        textAnchor="end"
                    />

                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                            backgroundColor: '#0d163d',
                            border: '1px solid var(--color-admin-border)',
                            borderRadius: '12px',
                        }}
                        labelStyle={{ color: 'var(--color-admin-text-dim)', fontSize: '12px' }}
                        itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}
                    />

                    <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={30}>
                        {data.map((_entry, index) => (
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