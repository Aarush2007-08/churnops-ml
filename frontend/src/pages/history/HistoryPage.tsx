import React, { useState, useEffect } from "react";
import { getPredictionHistory } from "../../api/history";
import type { PredictionLog } from "../../api/history";
import { Search, History, ChevronDown, ChevronUp, Code } from "lucide-react";

export function HistoryPage() {
  const [logs, setLogs] = useState<PredictionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadHistory = async (searchTerm = "") => {
    setLoading(true);
    try {
      const data = await getPredictionHistory(0, 100, searchTerm);
      setLogs(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadHistory(search);
  };

  const toggleExpand = (id: number) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', second: '2-digit'
    }).format(d);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Prediction History</h2>
        <p className="text-muted-foreground">Audit log of all model predictions (Single & Batch) over time.</p>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-muted/20">
          <form onSubmit={handleSearch} className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Search by Customer ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </form>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <History size={16} /> Showing {logs.length} records
          </div>
        </div>
        
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
                <th className="px-6 py-4 font-semibold">Customer ID</th>
                <th className="px-6 py-4 font-semibold">Source</th>
                <th className="px-6 py-4 font-semibold">Risk Probability</th>
                <th className="px-6 py-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading history...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No prediction logs found.</td>
                </tr>
              ) : (
                logs.map(log => (
                  <React.Fragment key={log.id}>
                    <tr className={`border-b hover:bg-muted/10 transition-colors ${expandedId === log.id ? 'bg-muted/5' : ''}`}>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(log.created_at)}</td>
                      <td className="px-6 py-4 font-medium">{log.customer_id}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.prediction_type === 'Batch' ? 'bg-blue-500/10 text-blue-600' : 'bg-primary/10 text-primary'}`}>
                          {log.prediction_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            log.churn_probability > 0.7 ? "bg-destructive" : 
                            log.churn_probability > 0.4 ? "bg-amber-500" : "bg-green-500"
                          }`}></span>
                          <span className="font-semibold">{(log.churn_probability * 100).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => toggleExpand(log.id)}
                          className="p-1.5 hover:bg-muted rounded text-muted-foreground inline-flex items-center gap-1"
                        >
                          {expandedId === log.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </td>
                    </tr>
                    {expandedId === log.id && (
                      <tr className="border-b bg-muted/20">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 bg-background border rounded p-4 overflow-x-auto">
                              <h5 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1 mb-2">
                                <Code size={14} /> Feature Snapshot
                              </h5>
                              <pre className="text-xs text-foreground/80 font-mono">
                                {log.features_json ? JSON.stringify(JSON.parse(log.features_json), null, 2) : "No snapshot available"}
                              </pre>
                            </div>
                            <div className="w-64 space-y-2 text-sm text-muted-foreground">
                              <p><strong>Log ID:</strong> {log.id}</p>
                              <p>This snapshot represents the exact customer data state at the moment the prediction was made.</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
