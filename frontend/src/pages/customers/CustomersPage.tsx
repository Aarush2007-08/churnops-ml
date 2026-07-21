import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCustomers } from "../../api/customers";
import type { Customer } from "../../api/customers";
import { Search, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadCustomers = async (searchTerm = "") => {
    setLoading(true);
    try {
      const data = await getCustomers(0, 50, searchTerm);
      setCustomers(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers(search);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">Customer Management</h2>
          <p className="text-muted-foreground">View and manage all telecom customers in the system.</p>
        </div>
        <Link 
          to="/customers/new" 
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} /> Add Customer
        </Link>
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
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Customer ID</th>
                <th className="px-6 py-4 font-semibold">Demographics</th>
                <th className="px-6 py-4 font-semibold">Tenure</th>
                <th className="px-6 py-4 font-semibold">Contract</th>
                <th className="px-6 py-4 font-semibold">Monthly Charges</th>
                <th className="px-6 py-4 font-semibold">Churn</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">No customers found.</td>
                </tr>
              ) : (
                customers.map(c => (
                  <tr key={c.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{c.customer_id}</td>
                    <td className="px-6 py-4">{c.gender}, {c.senior_citizen ? 'Senior' : 'Non-Senior'}</td>
                    <td className="px-6 py-4">{c.tenure} months</td>
                    <td className="px-6 py-4">{c.contract}</td>
                    <td className="px-6 py-4">${c.monthly_charges.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.churn === 'Yes' ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'}`}>
                        {c.churn}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/customers/${c.id}/edit`} className="inline-flex p-2 text-muted-foreground hover:text-primary transition-colors">
                        <Edit size={16} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t text-sm text-muted-foreground flex justify-between items-center bg-muted/20">
          <span>Showing {customers.length} results</span>
          {/* Pagination placeholder */}
          <div className="flex gap-1">
            <button className="px-3 py-1 border rounded bg-background hover:bg-muted disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border rounded bg-background hover:bg-muted disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
