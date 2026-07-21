import { useState, useEffect } from "react";
import { getModels, promoteModel } from "../../api/mlflow";
import type { ModelRegistry } from "../../api/mlflow";
import { Server, Activity, ArrowUpCircle, CheckCircle2, ShieldAlert } from "lucide-react";

export function ModelsPage() {
  const [models, setModels] = useState<ModelRegistry[]>([]);
  const [loading, setLoading] = useState(true);
  const [promotingId, setPromotingId] = useState<number | null>(null);

  const loadModels = async () => {
    try {
      const data = await getModels();
      setModels(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const handlePromote = async (id: number) => {
    if (!confirm("Are you sure you want to promote this model to Production? This will demote the current production model.")) return;
    
    setPromotingId(id);
    try {
      await promoteModel(id);
      await loadModels(); // Refresh list to get updated statuses
    } catch (err) {
      alert("Failed to promote model");
    } finally {
      setPromotingId(null);
    }
  };

  const productionModel = models.find(m => m.status === "Production");
  const otherModels = models.filter(m => m.status !== "Production");

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading model registry...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Model Management (MLflow)</h2>
        <p className="text-muted-foreground">Track model iterations, review performance metrics, and manage production deployments.</p>
      </div>

      {productionModel && (
        <div className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Server size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-primary font-semibold mb-4">
              <CheckCircle2 size={20} /> Current Production Model
            </div>
            <div className="flex flex-col md:flex-row md:items-end gap-8">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Version & Algorithm</p>
                <h3 className="text-3xl font-bold font-heading">{productionModel.version} <span className="text-xl font-normal text-muted-foreground ml-2">({productionModel.algorithm})</span></h3>
              </div>
              <div className="flex gap-6 pb-1">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Accuracy</p>
                  <p className="text-xl font-semibold">{(productionModel.accuracy * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">F1-Score</p>
                  <p className="text-xl font-semibold">{(productionModel.f1_score * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2"><Activity size={18} /> Model Version History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Version</th>
                <th className="px-6 py-4 font-semibold">Algorithm</th>
                <th className="px-6 py-4 font-semibold">Accuracy</th>
                <th className="px-6 py-4 font-semibold">F1-Score</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Show production first, then others */}
              {models.map(model => (
                <tr key={model.id} className={`border-b hover:bg-muted/10 transition-colors ${model.status === 'Production' ? 'bg-primary/5' : ''}`}>
                  <td className="px-6 py-4 font-bold">{model.version}</td>
                  <td className="px-6 py-4">{model.algorithm}</td>
                  <td className="px-6 py-4 font-medium">{(model.accuracy * 100).toFixed(1)}%</td>
                  <td className="px-6 py-4 font-medium">{(model.f1_score * 100).toFixed(1)}%</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      model.status === 'Production' ? 'bg-primary text-white border-primary' : 
                      model.status === 'Staging' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                      'bg-muted text-muted-foreground border-muted-foreground/20'
                    }`}>
                      {model.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {model.status !== 'Production' && (
                      <button 
                        onClick={() => handlePromote(model.id)}
                        disabled={promotingId === model.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors disabled:opacity-50"
                      >
                        <ArrowUpCircle size={16} /> 
                        {promotingId === model.id ? 'Promoting...' : 'Promote'}
                      </button>
                    )}
                    {model.status === 'Production' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground">
                        <ShieldAlert size={16} /> Active
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
