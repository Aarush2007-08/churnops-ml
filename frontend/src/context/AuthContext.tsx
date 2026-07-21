import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getMeApi, loginApi } from "../api/auth";

type User = {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      let currentToken = token;
      if (!currentToken) {
        try {
          const res = await loginApi("admin@churnops.com", "admin123");
          currentToken = res.access_token;
          localStorage.setItem("token", currentToken);
          setToken(currentToken);
        } catch (e) {
          console.error("Auto login failed", e);
        }
      }

      if (currentToken) {
        try {
          const userData = await getMeApi();
          setUser(userData);
        } catch (e) {
          console.error("Failed to load user", e);
          logout();
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
