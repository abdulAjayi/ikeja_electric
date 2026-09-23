import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Zap,
  LayoutDashboard,
  Gauge,
  Activity,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { ConfirmSignoutModal } from "../common/ConfirmSignoutModal";
import type { User } from "../../types/auth";

interface EngineerSidebarProps {
  currentUser: User;
  onLogout: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Overview", to: "/engineer/overview", icon: LayoutDashboard },
  { label: "Meters / Circuits", to: "/engineer/meters", icon: Gauge },
  { label: "Power Quality", to: "/engineer/power-quality", icon: Activity },
];

export const EngineerSidebar: React.FC<EngineerSidebarProps> = ({
  currentUser,
  onLogout,
  mobileOpen,
  setMobileOpen,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSignoutModal, setShowSignoutModal] = useState(false);

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  const handleLogoutClick = () => {
    setShowSignoutModal(true);
  };

  const handleConfirmSignout = () => {
    setShowSignoutModal(false);
    setMobileOpen(false);
    onLogout();
    navigate("/login");
  };

  // Helper for initials
  const initials = currentUser.name
    ? currentUser.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "EN";

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#1F2937] text-white select-none">
      {/* Top section: Logo + Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#B91C1C] flex items-center justify-center shadow-md shadow-black/30">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white leading-tight">
                NBC Ikeja Energy Monitoring
              </span>
              <span className="text-[11px] font-medium text-[#9CA3AF] tracking-wide">
                Grid Telemetry
              </span>
            </div>
          </div>

          {/* Close button on mobile drawer */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation sidebar"
            className="lg:hidden p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Nav Section */}
        <nav aria-label="Main Navigation" className="space-y-1">
          {MAIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.to === "/engineer/meters"
              ? location.pathname.startsWith("/engineer/meters")
              : location.pathname === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${isActive
                    ? "bg-[#B91C1C] text-white shadow-sm"
                    : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Lower Grouped Section: ACCOUNT */}
        <div className="pt-4 border-t border-white/10">
          <div className="px-3 pb-2 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
            Account
          </div>
          <div className="space-y-1">
            <NavLink
              to="/engineer/settings"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${isActive
                  ? "bg-[#B91C1C] text-white shadow-sm"
                  : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
                }`
              }
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              <span>Settings</span>
            </NavLink>

            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-colors duration-150 text-left"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom: User Profile Card */}
      <div className="p-4 border-t border-white/10 bg-black/10">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
          {/* Avatar Placeholder */}
          <div className="w-9 h-9 rounded-lg bg-[#B91C1C]/20 border border-[#B91C1C]/30 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 tracking-wide">
            {initials}
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-sm font-semibold text-white truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#B91C1C]/20 text-red-400 border border-[#B91C1C]/30 uppercase tracking-wider flex-shrink-0">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF] truncate mt-0.5">
              {currentUser.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (Fixed on left, hidden on mobile) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 lg:fixed lg:inset-y-0 lg:z-30 lg:border-r lg:border-white/10">
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          role="presentation"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-300 ease-in-out lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {sidebarContent}
      </div>

      {/* Confirmation Sign Out Modal Popup */}
      <ConfirmSignoutModal
        isOpen={showSignoutModal}
        onClose={() => setShowSignoutModal(false)}
        onConfirm={handleConfirmSignout}
      />
    </>
  );
};
