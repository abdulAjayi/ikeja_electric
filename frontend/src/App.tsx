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
import { ThresholdsAlertsPage } from "./pages/engineer/ThresholdsAlertsPage";
import { GatewayHealthPage } from "./pages/engineer/GatewayHealthPage";
import { SettingsPage } from "./pages/engineer/SettingsPage";
import { MeterDetailPage } from "./pages/engineer/MeterDetailPage";
import { authService } from "./services/authService";
import type { User } from "./types/auth";
import { LogOut, Zap, ShieldAlert } from "lucide-react";

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
                <Navigate to="/executive" replace />
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
                <Navigate to="/executive" replace />
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
          <Route path="alerts" element={<ThresholdsAlertsPage />} />
          <Route path="gateway-health" element={<GatewayHealthPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="meters/:meterId" element={<MeterDetailPage />} />
          <Route path="*" element={<Navigate to="/engineer/overview" replace />} />
        </Route>

        {/* Executive View Placeholder (Executive sidebar comes in next step) */}
        <Route
          path="/executive/*"
          element={
            currentUser ? (
              currentUser.role === "EXECUTIVE" ? (
                <div className="min-h-screen bg-[#F7F7F5] flex flex-col font-sans">
                  <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#B91C1C] flex items-center justify-center text-white">
                        <Zap className="w-4 h-4 fill-white" />
                      </div>
                      <span className="font-bold text-nearblack tracking-tight text-lg">
                        Ikeja Energy
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-charcoal font-medium">
                        Executive Portal
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-sm text-grey hover:text-[#B91C1C] transition py-1.5 px-3 rounded-lg hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </header>
                  <main className="flex-1 max-w-4xl w-full mx-auto p-8 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm text-center max-w-md w-full">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <h2 className="text-lg font-bold text-nearblack mb-1">
                        Executive Dashboard
                      </h2>
                      <p className="text-sm text-grey mb-6">
                        Executive navigation & financial dashboard shell is scheduled for the next iteration.
                      </p>
                      <button
                        onClick={handleLogout}
                        className="text-sm font-semibold text-[#B91C1C] hover:underline"
                      >
                        Switch Account / Sign Out
                      </button>
                    </div>
                  </main>
                </div>
              ) : (
                <Navigate to="/engineer/overview" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

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
