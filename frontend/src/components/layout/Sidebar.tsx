import { NavLink, Link } from "react-router-dom";
import { 
  LayoutDashboard, Users, Activity, BarChart2, 
  History, PieChart, BrainCircuit, Boxes, 
  LineChart, Settings, ShieldAlert
} from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Customers", path: "/customers", icon: Users },
  { name: "Single Predict", path: "/predict/single", icon: Activity },
  { name: "Batch Predict", path: "/predict/batch", icon: BarChart2 },
  { name: "History", path: "/history", icon: History },
  { name: "Analytics", path: "/analytics", icon: PieChart },
  { name: "Explainable AI", path: "/explain", icon: BrainCircuit },
  { name: "Models", path: "/models", icon: Boxes },
  { name: "Monitoring", path: "/monitoring", icon: LineChart },
  { name: "Admin", path: "/admin", icon: ShieldAlert },
  { name: "Settings", path: "/settings", icon: Settings },
];

export function Sidebar() {
  return (
    <div className="w-64 bg-card border-r flex flex-col h-full">
      <Link to="/" className="p-6 border-b flex items-center gap-2 hover:opacity-80 transition-opacity">
        <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor" className="text-primary shrink-0">
          <path d="M 64 128 L 64.5 128 L 32 95 L 0 64 L 0 0 L 64 0 L 128 64 L 128 64.5 L 161 32 L 192 0 L 256 0 L 256 64 L 192 128 L 128 128 L 128 192 L 96 223 L 63.5 256 L 0 256 L 0 192 Z M 256 192 L 224 223 L 191.5 256 L 128 256 L 128 192 L 192 128 L 256 128 Z" />
        </svg>
        <span className="font-heading font-bold text-xl">Churn-Ops</span>
      </Link>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
