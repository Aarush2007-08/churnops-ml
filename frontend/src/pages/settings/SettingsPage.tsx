import { useState, useEffect } from "react";
import { getPreferences, updatePreferences, getNotifications } from "../../api/settings";
import type { GlobalSettings, Notification } from "../../api/settings";
import { Settings2, Bell, Save, CheckCircle2, AlertTriangle, Info } from "lucide-react";

export function SettingsPage() {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([getPreferences(), getNotifications()])
      .then(([prefData, notifData]) => {
        setSettings(prefData);
        setNotifications(notifData.items);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage("");
    try {
      const updated = await updatePreferences(settings);
      setSettings(updated);
      setMessage("Settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(d);
  };

  if (loading || !settings) return <div className="p-8 text-center text-muted-foreground">Loading preferences...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <Settings2 className="text-primary" /> Global Settings & Notifications
        </h2>
        <p className="text-muted-foreground">Configure application preferences and review system alerts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Settings Form */}
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-muted/20">
            <h3 className="font-semibold flex items-center gap-2">Global Preferences</h3>
          </div>
          <form onSubmit={handleSave} className="p-6 space-y-6 flex-1">
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">High Risk Threshold</label>
                <p className="text-xs text-muted-foreground mb-2">Predictions above this threshold are flagged as 'High Risk'.</p>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" min="0.5" max="0.95" step="0.05" 
                    value={settings.high_risk_threshold}
                    onChange={(e) => setSettings({...settings, high_risk_threshold: parseFloat(e.target.value)})}
                    className="flex-1 accent-primary"
                  />
                  <span className="font-bold w-12 text-right">{(settings.high_risk_threshold * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={settings.enable_email_alerts}
                    onChange={(e) => setSettings({...settings, enable_email_alerts: e.target.checked})}
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <div>
                    <span className="block text-sm font-medium">Enable Email Alerts</span>
                    <span className="block text-xs text-muted-foreground">Send daily digests to administrators.</span>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t">
                <label className="block text-sm font-medium mb-1">Data Retention (Days)</label>
                <p className="text-xs text-muted-foreground mb-2">How long to keep batch prediction logs.</p>
                <input 
                  type="number" min="30" max="365"
                  value={settings.retention_days}
                  onChange={(e) => setSettings({...settings, retention_days: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-background border rounded-md"
                />
              </div>
              
              <div className="pt-4 border-t">
                <label className="block text-sm font-medium mb-1">System Theme</label>
                <select 
                  value={settings.system_theme}
                  onChange={(e) => setSettings({...settings, system_theme: e.target.value})}
                  className="w-full px-3 py-2 bg-background border rounded-md"
                >
                  <option value="system">Follow OS Default</option>
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
              </div>
            </div>

            <div className="pt-6 mt-auto flex items-center justify-between">
              <span className={`text-sm font-medium ${message.includes('success') ? 'text-green-500' : 'text-destructive'}`}>
                {message}
              </span>
              <button 
                type="submit" disabled={saving}
                className="px-6 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={18} /> {saving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </form>
        </div>

        {/* Notifications Feed */}
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
            <h3 className="font-semibold flex items-center gap-2">System Notifications</h3>
            <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{notifications.length}</span>
          </div>
          <div className="p-0 overflow-y-auto max-h-[600px] flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No new notifications.</div>
            ) : (
              <ul className="divide-y">
                {notifications.map(notif => (
                  <li key={notif.id} className={`p-4 hover:bg-muted/10 transition-colors ${!notif.is_read ? 'bg-muted/5' : ''}`}>
                    <div className="flex gap-4">
                      <div className="shrink-0 mt-1">
                        {notif.type === 'alert' && <AlertTriangle className="text-destructive" size={20} />}
                        {notif.type === 'success' && <CheckCircle2 className="text-green-500" size={20} />}
                        {notif.type === 'info' && <Info className="text-blue-500" size={20} />}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          {notif.title}
                          {!notif.is_read && <span className="w-2 h-2 rounded-full bg-primary"></span>}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Bell size={12} /> {formatTime(notif.timestamp)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
