import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { EngineerSidebar } from "./EngineerSidebar";
import type { User } from "../../types/auth";

interface DashboardLayoutProps {
  currentUser: User;
  onLogout: () => void;
}

const ROUTE_TITLES: Record<string, string> = {
  "/engineer": "Overview",
  "/engineer/overview": "Overview",
  "/engineer/meters": "Meters / Circuits",
  "/engineer/power-quality": "Power Quality",
  "/engineer/alerts": "Thresholds & Alerts",
  "/engineer/gateway-health": "Device / Gateway Health",
  "/engineer/settings": "Settings",
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentUser,
  onLogout,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const pageTitle =
    ROUTE_TITLES[location.pathname] ||
    (location.pathname.startsWith("/engineer/meters/") ? "Meter Detail" : "Engineer Portal");

  return (
    <div className="min-h-screen bg-[#F7F7F5] font-sans antialiased text-nearblack flex flex-col">
      {/* Sidebar Component (Desktop fixed + Mobile drawer) */}
      <EngineerSidebar
        currentUser={currentUser}
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area (Offset by sidebar width on desktop) */}
      <div className="lg:pl-64 xl:pl-72 flex-1 flex flex-col min-w-0">
        {/* Sticky Top Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation sidebar"
              className="lg:hidden p-2 rounded-lg text-charcoal hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Dynamic Page Title */}
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-nearblack tracking-tight leading-tight">
                {pageTitle}
              </h1>
            </div>
          </div>

          {/* Right Indicator: Signed in as [Name] */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 text-xs text-grey bg-[#F7F7F5] border border-gray-200/80 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" aria-hidden="true" />
              <span className="hidden sm:inline">Signed in as</span>
              <span className="font-semibold text-charcoal truncate max-w-[140px] sm:max-w-[200px]">
                {currentUser.name}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
