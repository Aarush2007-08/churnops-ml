import { useState, useEffect } from "react";
import { getCustomers } from "../../api/customers";
import type { Customer } from "../../api/customers";
import { predictSingleCustomer } from "../../api/predict";
import type { SinglePredictionResponse } from "../../api/predict";
import { Target, Search, AlertCircle, Info, Zap } from "lucide-react";

export function SinglePredictPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<SinglePredictionResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load a few customers to populate the dropdown
    getCustomers(0, 100, search).then(data => setCustomers(data.items));
  }, [search]);

  const handlePredict = async () => {
    if (!selectedCustomerId) return;
    setLoading(true);
    setError("");
    setPrediction(null);
    try {
      const result = await predictSingleCustomer(selectedCustomerId);
      setPrediction(result);
    } catch (err: any) {
      setError(err.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Single Customer Prediction</h2>
        <p className="text-muted-foreground">Select a customer to run the churn prediction model and view AI-powered retention recommendations.</p>
      </div>

      <div className="bg-card border rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium mb-2">Select Customer (ID)</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search to filter..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 bg-background border rounded-md text-sm mb-2"
              />
              <select 
                className="w-full p-2 bg-background border rounded-md"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">-- Choose a Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.customer_id}>{c.customer_id} ({c.gender}, {c.tenure}mo)</option>
                ))}
              </select>
            </div>
          </div>
          <button 
            onClick={handlePredict}
            disabled={!selectedCustomerId || loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Analyzing..." : <><Target size={18} /> Run Prediction</>}
          </button>
        </div>
        {error && <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}
      </div>

      {prediction && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Gauge Card */}
          <div className="bg-card border rounded-xl shadow-sm p-6 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold mb-6 w-full text-center">Churn Risk</h3>
            
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted" />
                <circle 
                  cx="50" cy="50" r="40" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - prediction.churn_probability)}`}
                  className={`${
                    prediction.churn_probability > 0.7 ? "text-destructive" : 
                    prediction.churn_probability > 0.4 ? "text-amber-500" : "text-green-500"
                  } transition-all duration-1000 ease-out`} 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-heading font-bold">
                  {(prediction.churn_probability * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground mt-1">Probability</span>
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Info size={16} /> Model Confidence: {(prediction.confidence * 100).toFixed(1)}%
            </div>
          </div>

          {/* Recommendation Card */}
          <div className="md:col-span-2 bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b bg-muted/20 flex items-center gap-2">
              <Zap size={20} className="text-primary" />
              <h3 className="text-lg font-semibold">AI-Powered Recommendation</h3>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-center">
              <div className="mb-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  prediction.recommendation.priority === 'High' ? 'bg-destructive/10 text-destructive' :
                  prediction.recommendation.priority === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                  'bg-green-500/10 text-green-600'
                }`}>
                  {prediction.recommendation.priority === 'High' && <AlertCircle size={14} />}
                  {prediction.recommendation.priority} Priority Action
                </span>
              </div>
              
              <div className="bg-primary/5 border border-primary/20 p-5 rounded-lg mb-6">
                <p className="text-xl font-medium text-foreground leading-snug">
                  "{prediction.recommendation.action}"
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Key Risk Factor Identified</h4>
                <p className="text-foreground">{prediction.recommendation.reason}</p>
              </div>
            </div>
            
            <div className="p-4 border-t text-xs text-muted-foreground">
              Model Version: {prediction.model_version}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
