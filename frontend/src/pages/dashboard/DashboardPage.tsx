import { useState, useEffect } from "react";
import { Users, TrendingUp, AlertTriangle, Target } from "lucide-react";
import { getAnalyticsSummary } from "../../api/analytics";
import type { AnalyticsSummaryResponse } from "../../api/analytics";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function DashboardPage() {
  const [data, setData] = useState<AnalyticsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const summary = await getAnalyticsSummary();
        setData(summary);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const kpis = [
    { title: "Total Customers", value: data?.total_customers?.toLocaleString() || "0", change: "+12%", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Avg. Churn Rate", value: data ? `${(data.avg_churn_risk * 100).toFixed(1)}%` : "0%", change: "-0.5%", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "High-Risk Customers", value: data?.high_risk_total?.toLocaleString() || "0", change: "+4", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Model Accuracy", value: "94.2%", change: "+1.1%", icon: Target, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your customers today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.title} className="bg-card p-6 rounded-xl border shadow-sm flex items-start gap-4">
            <div className={`p-3 rounded-lg ${kpi.bg} ${kpi.color}`}>
              <kpi.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold font-heading">{kpi.value}</h3>
                <span className={`text-xs font-medium ${kpi.change.startsWith('+') && kpi.title !== 'High-Risk Customers' ? 'text-green-500' : (kpi.title === 'High-Risk Customers' && kpi.change.startsWith('+') ? 'text-destructive' : 'text-green-500')}`}>
                  {kpi.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-card rounded-xl border shadow-sm p-6 min-h-[400px] flex flex-col">
          <h3 className="text-lg font-semibold font-heading mb-6">High-Risk Churn Trend</h3>
          {loading ? (
             <div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground animate-pulse">Loading trend data...</p></div>
          ) : (
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHighRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}
                  />
                  <Area type="monotone" dataKey="high_risk_count" name="High Risk Customers" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorHighRisk)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <div className="bg-card rounded-xl border shadow-sm p-6 min-h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Recent High-Risk Customers</p>
        </div>
      </div>
    </div>
  );
}
