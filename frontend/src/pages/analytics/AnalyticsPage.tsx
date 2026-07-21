import { useState, useEffect } from "react";
import { getAnalyticsSummary } from "../../api/analytics";
import type { AnalyticsSummaryResponse } from "../../api/analytics";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, AlertTriangle } from "lucide-react";

export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsSummary()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading analytics...</div>;
  if (!data) return <div className="p-8 text-center text-destructive">Failed to load analytics data.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Global Analytics & Reports</h2>
        <p className="text-muted-foreground">High-level view of customer demographics and churn risk across the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 text-muted-foreground mb-2">
            <Users size={20} />
            <span className="font-medium">Total Tracked Customers</span>
          </div>
          <h3 className="text-3xl font-bold">{data.total_customers.toLocaleString()}</h3>
        </div>
        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 text-muted-foreground mb-2">
            <TrendingUp size={20} />
            <span className="font-medium">Avg. Churn Probability</span>
          </div>
          <h3 className="text-3xl font-bold">{(data.avg_churn_risk * 100).toFixed(1)}%</h3>
        </div>
        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 text-destructive mb-2">
            <AlertTriangle size={20} />
            <span className="font-medium">Total High Risk</span>
          </div>
          <h3 className="text-3xl font-bold">{data.high_risk_total.toLocaleString()}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pie Chart */}
        <div className="bg-card border rounded-xl shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-semibold mb-6">Global Churn Risk Distribution</h3>
          <div className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} Customers`, 'Count']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-card border rounded-xl shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-semibold mb-6">Risk Breakdown by Contract Type</h3>
          <div className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.contract_risk} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--muted)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                />
                <Legend />
                <Bar dataKey="high_risk" name="High Risk" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
                <Bar dataKey="medium_risk" name="Medium Risk" stackId="a" fill="#f59e0b" />
                <Bar dataKey="low_risk" name="Low Risk" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
