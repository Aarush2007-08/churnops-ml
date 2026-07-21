import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCustomer, createCustomer, updateCustomer, deleteCustomer } from "../../api/customers";
import type { Customer } from "../../api/customers";
import { ArrowLeft, Trash2 } from "lucide-react";

export function CustomerFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState<Partial<Customer>>({
    customer_id: "",
    gender: "Female",
    senior_citizen: 0,
    tenure: 0,
    contract: "Month-to-month",
    monthly_charges: 0,
    total_charges: 0,
    churn: "No"
  });

  useEffect(() => {
    if (isEdit && id) {
      loadCustomer(parseInt(id, 10));
    }
  }, [id]);

  const loadCustomer = async (customerId: number) => {
    try {
      const data = await getCustomer(customerId);
      setFormData(data);
    } catch (err) {
      setError("Failed to load customer");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    
    try {
      if (isEdit && id) {
        await updateCustomer(parseInt(id, 10), formData);
      } else {
        await createCustomer(formData);
      }
      navigate("/customers");
    } catch (err: any) {
      setError(err.message || "Failed to save customer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await deleteCustomer(parseInt(id, 10));
      navigate("/customers");
    } catch (err: any) {
      setError(err.message || "Failed to delete customer");
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/customers" className="p-2 bg-card border rounded-md hover:bg-muted transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">
            {isEdit ? "Edit Customer" : "Add New Customer"}
          </h2>
          <p className="text-muted-foreground">
            {isEdit ? `Updating details for ${formData.customer_id}` : "Enter details for a new telecom customer."}
          </p>
        </div>
      </div>

      {error && <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-card border shadow-sm rounded-xl overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
              <h3 className="font-semibold border-b pb-2">Basic Info</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Customer ID</label>
                <input required type="text" name="customer_id" value={formData.customer_id || ""} onChange={handleChange} className="w-full p-2 border rounded bg-background" disabled={isEdit} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select name="gender" value={formData.gender || ""} onChange={handleChange} className="w-full p-2 border rounded bg-background">
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Senior Citizen (0 or 1)</label>
                <input type="number" min="0" max="1" name="senior_citizen" value={formData.senior_citizen ?? 0} onChange={handleChange} className="w-full p-2 border rounded bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tenure (months)</label>
                <input required type="number" min="0" name="tenure" value={formData.tenure ?? 0} onChange={handleChange} className="w-full p-2 border rounded bg-background" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold border-b pb-2">Account & Billing</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Contract Type</label>
                <select name="contract" value={formData.contract || ""} onChange={handleChange} className="w-full p-2 border rounded bg-background">
                  <option value="Month-to-month">Month-to-month</option>
                  <option value="One year">One year</option>
                  <option value="Two year">Two year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Monthly Charges ($)</label>
                <input required type="number" step="0.01" name="monthly_charges" value={formData.monthly_charges ?? 0} onChange={handleChange} className="w-full p-2 border rounded bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Charges ($)</label>
                <input required type="number" step="0.01" name="total_charges" value={formData.total_charges ?? 0} onChange={handleChange} className="w-full p-2 border rounded bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-destructive">Has Churned? (Historical)</label>
                <select name="churn" value={formData.churn || ""} onChange={handleChange} className="w-full p-2 border rounded bg-background border-destructive/50">
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>

          </div>
        </div>
        
        <div className="p-4 border-t bg-muted/20 flex justify-between items-center">
          {isEdit ? (
            <button type="button" onClick={handleDelete} className="px-4 py-2 text-destructive hover:bg-destructive/10 rounded font-medium flex items-center gap-2 transition-colors">
              <Trash2 size={18} /> Delete
            </button>
          ) : <div></div>}
          
          <div className="flex gap-3">
            <Link to="/customers" className="px-4 py-2 border bg-background hover:bg-muted rounded font-medium transition-colors">Cancel</Link>
            <button type="submit" disabled={submitting} className="px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded font-medium transition-colors disabled:opacity-50">
              {submitting ? "Saving..." : "Save Customer"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
