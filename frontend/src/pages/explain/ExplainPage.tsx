import { useState, useEffect } from "react";
import { getCustomers } from "../../api/customers";
import type { Customer } from "../../api/customers";
import { explainCustomerPrediction } from "../../api/explain";
import type { ExplainResponse } from "../../api/explain";
import { Search, BrainCircuit, Activity, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

export function ExplainPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getCustomers(0, 100, search).then(data => setCustomers(data.items));
  }, [search]);

  const handleExplain = async () => {
    if (!selectedCustomerId) return;
    setLoading(true);
    setError("");
    setExplanation(null);
    try {
      const result = await explainCustomerPrediction(selectedCustomerId);
      setExplanation(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate explanation");
    } finally {
      setLoading(false);
    }
  };

  // Format data for Recharts diverging bar chart
  const chartData = explanation?.features.map(f => ({
    name: f.feature,
    value: f.direction === 'positive' ? f.impact : f.impact,
    displayValue: f.value,
    direction: f.direction
  })) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Explainable AI (SHAP)</h2>
        <p className="text-muted-foreground">Demystify model predictions. See exactly which features are driving churn risk up or down.</p>
      </div>

      <div className="bg-card border rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium mb-2">Select Customer to Analyze</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <select 
                className="w-full pl-10 pr-4 py-2 bg-background border rounded-md"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">-- Choose a Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.customer_id}>{c.customer_id}</option>
                ))}
              </select>
            </div>
          </div>
          <button 
            onClick={handleExplain}
            disabled={!selectedCustomerId || loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Analyzing..." : <><BrainCircuit size={18} /> Generate Explanation</>}
          </button>
        </div>
        {error && <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}
      </div>

      {explanation && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border rounded-xl p-6 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-muted rounded-lg"><Activity size={24} /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Base Model Probability</p>
                <h4 className="text-2xl font-bold">{(explanation.base_value * 100).toFixed(1)}%</h4>
              </div>
            </div>
            <div className="md:col-span-2 bg-card border rounded-xl p-6 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-lg ${explanation.final_probability > 0.5 ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-500'}`}>
                <BarChart2 size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Final Predicted Risk for {explanation.customer_id}</p>
                <div className="flex items-end gap-2">
                  <h4 className="text-3xl font-bold font-heading">{(explanation.final_probability * 100).toFixed(1)}%</h4>
                  <span className="text-sm text-muted-foreground mb-1">
                    ({explanation.final_probability > explanation.base_value ? '+' : ''}{((explanation.final_probability - explanation.base_value) * 100).toFixed(1)}% vs Base)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-xl shadow-sm p-6">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Feature Impact Analysis (SHAP Approximation)</h3>
                <p className="text-sm text-muted-foreground">Red bars push risk higher. Green bars push risk lower.</p>
              </div>
              <div className="flex items-center gap-4 text-sm font-medium">
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-500"></div> Decreases Risk</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-destructive"></div> Increases Risk</span>
              </div>
            </div>
            
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--muted)" />
                  <XAxis type="number" domain={[-0.4, 0.4]} tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} />
                  <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12}} />
                  <Tooltip 
                    formatter={(value: number, name: string, props: any) => [
                      `${value > 0 ? '+' : ''}${(value * 100).toFixed(1)}% (Value: ${props.payload.displayValue})`, 
                      'Impact'
                    ]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                  <ReferenceLine x={0} stroke="var(--foreground)" strokeOpacity={0.3} />
                  <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={24}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#ef4444' : '#22c55e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Feature</th>
                  <th className="px-6 py-4 font-semibold">Customer Value</th>
                  <th className="px-6 py-4 font-semibold text-right">Risk Impact</th>
                </tr>
              </thead>
              <tbody>
                {explanation.features.map((f, i) => (
                  <tr key={i} className="border-b hover:bg-muted/10">
                    <td className="px-6 py-4 font-medium">{f.feature}</td>
                    <td className="px-6 py-4">{f.value}</td>
                    <td className={`px-6 py-4 text-right font-semibold ${f.direction === 'positive' ? 'text-destructive' : 'text-green-500'}`}>
                      {f.impact > 0 ? '+' : ''}{(f.impact * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
}
