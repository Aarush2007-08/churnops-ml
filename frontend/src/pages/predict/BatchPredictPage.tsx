import { useState, useRef } from "react";
import { predictBatchCSV } from "../../api/batch";
import type { BatchPredictionResponse } from "../../api/batch";
import { UploadCloud, FileText, AlertTriangle, CheckCircle, Target, Users, BarChart } from "lucide-react";

export function BatchPredictPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<BatchPredictionResponse | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile);
        setError("");
      } else {
        setError("Please upload a valid CSV file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.type === "text/csv" || selected.name.endsWith(".csv")) {
        setFile(selected);
        setError("");
      } else {
        setError("Please upload a valid CSV file.");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResults(null);
    
    try {
      const data = await predictBatchCSV(file);
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Batch prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setResults(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Batch Prediction</h2>
        <p className="text-muted-foreground">Upload a CSV file to run churn predictions on multiple customers at once.</p>
      </div>

      {!results ? (
        <div className="max-w-3xl">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
            }`}
          >
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
            />
            
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <UploadCloud size={32} />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-1">Drag and drop your CSV file here</h3>
                <p className="text-sm text-muted-foreground mb-4">or click to browse from your computer (Max size: 5MB)</p>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 border bg-background hover:bg-muted rounded-md text-sm font-medium transition-colors"
                >
                  Browse Files
                </button>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm flex items-start gap-2">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          {file && !error && (
            <div className="mt-6 bg-card border rounded-lg p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleClear} disabled={loading} className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
                  Cancel
                </button>
                <button 
                  onClick={handleUpload} 
                  disabled={loading}
                  className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? "Processing..." : "Run Batch"}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-heading font-bold">Batch Results Summary</h3>
            <button onClick={handleClear} className="px-4 py-2 border bg-background hover:bg-muted rounded-md text-sm font-medium transition-colors">
              Process Another File
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border rounded-xl p-5 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg"><Users size={24} /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Processed</p>
                <h4 className="text-2xl font-bold">{results.total_processed}</h4>
              </div>
            </div>
            <div className="bg-card border rounded-xl p-5 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-lg"><BarChart size={24} /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Risk</p>
                <h4 className="text-2xl font-bold">{(results.average_probability * 100).toFixed(1)}%</h4>
              </div>
            </div>
            <div className="bg-card border rounded-xl p-5 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg"><AlertTriangle size={24} /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk (&gt;70%)</p>
                <h4 className="text-2xl font-bold">{results.high_risk_count}</h4>
              </div>
            </div>
            <div className="bg-card border rounded-xl p-5 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-green-500/10 text-green-500 rounded-lg"><CheckCircle size={24} /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Risk (&lt;40%)</p>
                <h4 className="text-2xl font-bold">{results.low_risk_count}</h4>
              </div>
            </div>
          </div>
          
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/20">
              <h4 className="font-semibold">Detailed Customer Predictions (Sorted by Risk)</h4>
            </div>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b sticky top-0">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Customer ID</th>
                    <th className="px-6 py-4 font-semibold">Risk Level</th>
                    <th className="px-6 py-4 font-semibold">Churn Probability</th>
                  </tr>
                </thead>
                <tbody>
                  {results.predictions.map((p, i) => (
                    <tr key={i} className="border-b hover:bg-muted/20">
                      <td className="px-6 py-4 font-medium">{p.customer_id}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          p.risk_level === 'High' ? 'bg-destructive/10 text-destructive' :
                          p.risk_level === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                          'bg-green-500/10 text-green-600'
                        }`}>
                          {p.risk_level}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="w-12">{(p.churn_probability * 100).toFixed(1)}%</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[200px]">
                            <div 
                              className={`h-full ${
                                p.risk_level === 'High' ? 'bg-destructive' :
                                p.risk_level === 'Medium' ? 'bg-amber-500' :
                                'bg-green-500'
                              }`} 
                              style={{ width: `${p.churn_probability * 100}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
