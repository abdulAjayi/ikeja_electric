import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoginPage } from "./components/LoginPage";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { EngineerOverviewPage } from "./pages/engineer/EngineerOverviewPage";
import { MetersCircuitsPage } from "./pages/engineer/MetersCircuitsPage";
import { PowerQualityPage } from "./pages/engineer/PowerQualityPage";
import { SettingsPage } from "./pages/engineer/SettingsPage";
import { MeterDetailPage } from "./pages/engineer/MeterDetailPage";
import { authService } from "./services/authService";
import type { User } from "./types/auth";

import { ExecutiveLayout } from "./components/layout/ExecutiveLayout";
import { CostOverviewPage } from "./pages/executive/CostOverviewPage";
import { SustainabilityPage } from "./pages/executive/SustainabilityPage";
import { PeakDemandPage } from "./pages/executive/PeakDemandPage";
import { BenchmarkingPage } from "./pages/executive/BenchmarkingPage";

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const auth = authService.getCurrentAuth();
    return auth.isAuthenticated && auth.user ? auth.user : null;
  });

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Unauthenticated Login Route */}
        <Route
          path="/login"
          element={
            currentUser ? (
              currentUser.role === "ENGINEER" ? (
                <Navigate to="/engineer/overview" replace />
              ) : (
                <Navigate to="/executive/cost-overview" replace />
              )
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Engineer Layout & Routes */}
        <Route
          path="/engineer"
          element={
            currentUser ? (
              currentUser.role === "ENGINEER" ? (
                <DashboardLayout currentUser={currentUser} onLogout={handleLogout} />
              ) : (
                <Navigate to="/executive/cost-overview" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Navigate to="/engineer/overview" replace />} />
          <Route path="overview" element={<EngineerOverviewPage />} />
          <Route path="meters" element={<MetersCircuitsPage />} />
          <Route path="power-quality" element={<PowerQualityPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="meters/:meterId" element={<MeterDetailPage />} />
          <Route path="*" element={<Navigate to="/engineer/overview" replace />} />
        </Route>

        {/* Executive Layout & Routes */}
        <Route
          path="/executive"
          element={
            currentUser ? (
              currentUser.role === "EXECUTIVE" ? (
                <ExecutiveLayout currentUser={currentUser} onLogout={handleLogout} />
              ) : (
                <Navigate to="/engineer/overview" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Navigate to="/executive/cost-overview" replace />} />
          <Route path="cost-overview" element={<CostOverviewPage />} />
          <Route path="sustainability" element={<SustainabilityPage />} />
          <Route path="peak-demand" element={<PeakDemandPage />} />
          <Route path="benchmarking" element={<BenchmarkingPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/executive/cost-overview" replace />} />
        </Route>

        {/* Root fallback */}
        <Route
          path="*"
          element={
            currentUser ? (
              currentUser.role === "ENGINEER" ? (
                <Navigate to="/engineer/overview" replace />
              ) : (
                <Navigate to="/executive" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
