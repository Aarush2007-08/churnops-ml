import { Moon, Sun, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";

export function Topbar() {
  const { user, logout } = useAuth();
  
  // Basic theme toggle using localStorage
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light");

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <Link to="/" className="font-heading text-lg font-semibold lg:hidden hover:opacity-80 transition-opacity">Churn-Ops</Link>
      <div className="hidden lg:block" /> {/* Spacer for desktop */}
      
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          title="Toggle Theme"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium leading-none">{user?.email}</span>
            <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User size={16} />
          </div>
        </div>
      </div>
    </header>
  );
}
