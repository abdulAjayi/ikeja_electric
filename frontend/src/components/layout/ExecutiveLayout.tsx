import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Zap } from "lucide-react";
import { ExecutiveSidebar } from "./ExecutiveSidebar";
import type { User } from "../../types/auth";

interface ExecutiveLayoutProps {
  currentUser: User;
  onLogout: () => void;
}

export const ExecutiveLayout: React.FC<ExecutiveLayoutProps> = ({
  currentUser,
  onLogout,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col font-sans">
      <ExecutiveSidebar
        currentUser={currentUser}
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Mobile Header Bar */}
      <div className="lg:hidden sticky top-0 z-20 bg-[#1F2937] border-b border-white/10 px-4 py-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation sidebar"
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#B91C1C] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="font-bold text-sm text-white tracking-tight">
              Nbc Ikeja Executive
            </span>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#B91C1C]/20 text-red-400 border border-[#B91C1C]/30 uppercase tracking-wider">
          {currentUser.role}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
