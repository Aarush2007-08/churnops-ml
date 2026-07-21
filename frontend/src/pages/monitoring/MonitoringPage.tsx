import { useState, useEffect } from "react";
import { getSystemHealth } from "../../api/monitoring";
import type { SystemHealthResponse } from "../../api/monitoring";
import { Activity, Cpu, Database, Clock, Server, CheckCircle2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";

export function MonitoringPage() {
  const [data, setData] = useState<SystemHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const result = await getSystemHealth();
      setData(result);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to fetch monitoring data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll every 5 seconds for a live dashboard effect
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) return <div className="p-8 text-center text-muted-foreground">Initializing monitoring streams...</div>;
  if (error && !data) return <div className="p-8 text-center text-destructive">{error}</div>;
  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            System Monitoring 
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live
            </span>
          </h2>
          <p className="text-muted-foreground mt-1">Real-time observability into FastAPI prediction server health and resource utilization.</p>
        </div>
        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 bg-card border px-4 py-2 rounded-lg">
          <CheckCircle2 size={16} className="text-green-500" />
          Status: {data.status} (Uptime: {data.uptime})
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Cpu size={20} /></div>
            <span className={`text-xs font-bold px-2 py-1 rounded border ${data.cpu_usage > 80 ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-muted text-muted-foreground border-transparent'}`}>
              {data.cpu_usage > 80 ? 'HIGH' : 'NORMAL'}
            </span>
          </div>
          <h4 className="text-2xl font-bold font-heading">{data.cpu_usage}%</h4>
          <p className="text-sm text-muted-foreground font-medium mt-1">CPU Utilization</p>
        </div>

        <div className="bg-card border rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg"><Server size={20} /></div>
            <span className={`text-xs font-bold px-2 py-1 rounded border ${data.memory_usage > 85 ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-muted text-muted-foreground border-transparent'}`}>
              {data.memory_usage > 85 ? 'HIGH' : 'NORMAL'}
            </span>
          </div>
          <h4 className="text-2xl font-bold font-heading">{data.memory_usage}%</h4>
          <p className="text-sm text-muted-foreground font-medium mt-1">Memory Utilization</p>
        </div>

        <div className="bg-card border rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg"><Clock size={20} /></div>
            <span className={`text-xs font-bold px-2 py-1 rounded border ${data.api_latency_ms > 300 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-muted text-muted-foreground border-transparent'}`}>
              {data.api_latency_ms > 300 ? 'SLOW' : 'FAST'}
            </span>
          </div>
          <h4 className="text-2xl font-bold font-heading">{data.api_latency_ms} ms</h4>
          <p className="text-sm text-muted-foreground font-medium mt-1">Avg API Latency</p>
        </div>

        <div className="bg-card border rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-500/10 text-green-500 rounded-lg"><Activity size={20} /></div>
          </div>
          <h4 className="text-2xl font-bold font-heading">{data.prediction_volume.toLocaleString()}</h4>
          <p className="text-sm text-muted-foreground font-medium mt-1">Predictions (24h)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Resource Utilization Chart */}
        <div className="bg-card border rounded-xl shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-semibold mb-6">Server Resource Utilization (Last 15 Mins)</h3>
          <div className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.history} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--muted)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(val) => `${val}%`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Line type="monotone" dataKey="cpu" name="CPU %" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} isAnimationActive={false} />
                <Line type="monotone" dataKey="memory" name="Memory %" stroke="#a855f7" strokeWidth={3} dot={false} activeDot={{ r: 6 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* API Latency Chart */}
        <div className="bg-card border rounded-xl shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-semibold mb-6">Prediction API Latency</h3>
          <div className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.history} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--muted)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis domain={[0, 'dataMax + 100']} axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(val) => `${val}ms`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                />
                <Area type="monotone" dataKey="latency" name="Latency (ms)" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorLatency)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
