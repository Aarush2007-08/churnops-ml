import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { CustomersPage } from "./pages/customers/CustomersPage";
import { CustomerFormPage } from "./pages/customers/CustomerFormPage";
import { SinglePredictPage } from "./pages/predict/SinglePredictPage";
import { BatchPredictPage } from "./pages/predict/BatchPredictPage";
import { HistoryPage } from "./pages/history/HistoryPage";
import { AnalyticsPage } from "./pages/analytics/AnalyticsPage";
import { ExplainPage } from "./pages/explain/ExplainPage";
import { ModelsPage } from "./pages/models/ModelsPage";
import { MonitoringPage } from "./pages/monitoring/MonitoringPage";
import { AdminPage } from "./pages/admin/AdminPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes removed */}
          
          {/* Protected Routes inside AppLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/customers/new" element={<CustomerFormPage />} />
              <Route path="/customers/:id/edit" element={<CustomerFormPage />} />
              <Route path="/predict/single" element={<SinglePredictPage />} />
              <Route path="/predict/batch" element={<BatchPredictPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/explain" element={<ExplainPage />} />
              <Route path="/models" element={<ModelsPage />} />
              <Route path="/monitoring" element={<MonitoringPage />} />
              <Route path="/admin" element={<AdminPage />} />
              
              {/* Placeholders for future modules */}
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
