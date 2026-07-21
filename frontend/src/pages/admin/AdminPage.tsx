import { useState, useEffect } from "react";
import { getUsers, updateUserRole, updateUserStatus } from "../../api/admin";
import type { AdminUser } from "../../api/admin";
import { ShieldCheck, UserX, UserCheck, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function AdminPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUserList = async () => {
    try {
      const data = await getUsers();
      setUsers(data.items);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserList();
  }, []);

  const handleRoleChange = async (id: number, newRole: string) => {
    try {
      await updateUserRole(id, newRole);
      fetchUserList();
    } catch (err: any) {
      alert(err.message || "Failed to update role");
    }
  };

  const handleStatusToggle = async (id: number, currentStatus: boolean) => {
    try {
      await updateUserStatus(id, !currentStatus);
      fetchUserList();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading admin dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="text-primary" /> Admin Panel
        </h2>
        <p className="text-muted-foreground">Manage user accounts, system roles, and access permissions.</p>
      </div>

      {error && <div className="p-4 bg-destructive/10 text-destructive rounded-lg">{error}</div>}
      
      {currentUser?.role !== "admin" && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl flex items-start gap-3">
          <ShieldAlert className="shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold">Demo Mode Notice</h4>
            <p className="text-sm mt-1">You are currently viewing this page with '{currentUser?.role}' privileges. In a production environment, this page would be restricted exclusively to Administrators.</p>
          </div>
        </div>
      )}

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
          <h3 className="font-semibold">Registered Users ({users.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">User ID</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Access Control</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 font-mono text-muted-foreground">{u.id}</td>
                  <td className="px-6 py-4 font-medium flex items-center gap-2">
                    {u.email} 
                    {currentUser?.id === u.id && <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-primary/10 text-primary rounded">You</span>}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={currentUser?.role !== "admin" || currentUser?.id === u.id}
                      className={`text-xs font-semibold px-2 py-1 rounded-md border bg-transparent ${
                        u.role === 'admin' ? 'text-purple-600 border-purple-200' : 
                        u.role === 'analyst' ? 'text-blue-600 border-blue-200' : 
                        'text-muted-foreground border-muted'
                      }`}
                    >
                      <option value="admin">Admin</option>
                      <option value="analyst">Analyst</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      u.is_active ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'
                    }`}>
                      {u.is_active ? <UserCheck size={14} /> : <UserX size={14} />}
                      {u.is_active ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleStatusToggle(u.id, u.is_active)}
                      disabled={currentUser?.role !== "admin" || currentUser?.id === u.id}
                      className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 ${
                        u.is_active ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                      }`}
                    >
                      {u.is_active ? 'Revoke Access' : 'Restore Access'}
                    </button>
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
