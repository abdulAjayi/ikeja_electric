import React, { useState } from "react";
import {
  Settings,
  User as UserIcon,
  Mail,
  Lock,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  X,
} from "lucide-react";
import { authService } from "../../services/authService";
import type { User } from "../../types/auth";

export const SettingsPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return authService.getCurrentAuth().user;
  });

  // Section 1: Email Edit State
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState(currentUser?.email || "");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  // Section 2: Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Handle Email Update
  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccessMsg(null);

    const trimmedEmail = emailValue.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      setEmailError("Email address is required.");
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address (e.g. user@example.com).");
      return;
    }

    if (trimmedEmail === currentUser?.email) {
      setIsEditingEmail(false);
      return;
    }

    try {
      setIsSavingEmail(true);
      const updatedUser = await authService.updateEmail(trimmedEmail);
      setCurrentUser(updatedUser);
      setIsEditingEmail(false);
      setEmailSuccessMsg("Email address updated successfully.");
    } catch (err: any) {
      setEmailError(err.message || "Failed to update email address.");
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleCancelEmail = () => {
    setEmailValue(currentUser?.email || "");
    setEmailError(null);
    setIsEditingEmail(false);
  };

  // Handle Password Update
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccessMsg(null);

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    try {
      setIsSavingPassword(true);
      const msg = await authService.updatePassword(currentPassword, newPassword);
      setPasswordSuccessMsg(msg || "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-12 font-sans max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-nearblack" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-nearblack tracking-tight">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-grey">
            Manage your account details and security credentials
          </p>
        </div>
      </div>

      {/* Section 1: Account Information */}
      <section
        aria-label="Account Information"
        className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-5"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-nearblack" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-nearblack">
              Account Information
            </h2>
          </div>
          <span className="text-[11px] font-medium text-grey bg-gray-100 px-2 py-0.5 rounded">
            Self-Service Profile
          </span>
        </div>

        {/* Email Success Banner */}
        {emailSuccessMsg && (
          <div className="flex items-center justify-between gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-[#16A34A] font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#16A34A]" />
              <span>{emailSuccessMsg}</span>
            </div>
            <button
              onClick={() => setEmailSuccessMsg(null)}
              className="text-emerald-700 hover:text-emerald-900 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Read-Only Field: Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-grey block">
              Full Name
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#F7F7F5] border border-gray-200/80 rounded-lg text-sm text-nearblack font-medium select-none">
              <UserIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{currentUser?.name || "Grid Engineer"}</span>
              <span className="ml-auto text-[10px] uppercase tracking-wider font-semibold text-grey bg-gray-200/60 px-1.5 py-0.5 rounded">
                Admin Managed
              </span>
            </div>
          </div>

          {/* Read-Only Field: Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-grey block">
              Assigned Role
            </label>
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#F7F7F5] border border-gray-200/80 rounded-lg text-sm text-nearblack font-medium select-none">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{currentUser?.role || "ENGINEER"}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#B91C1C]/10 text-[#B91C1C] border border-[#B91C1C]/20 uppercase tracking-wider">
                {currentUser?.role || "ENGINEER"}
              </span>
            </div>
          </div>
        </div>

        {/* Editable Field: Email */}
        <div className="pt-2 border-t border-gray-100">
          {!isEditingEmail ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#F7F7F5]/50 border border-gray-200/60 rounded-xl">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-grey block">
                  Email Address
                </label>
                <div className="flex items-center gap-2 text-sm font-semibold text-nearblack font-mono">
                  <Mail className="w-4 h-4 text-grey flex-shrink-0" />
                  <span>{currentUser?.email}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingEmail(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-nearblack transition-all shadow-2xs self-start sm:self-auto"
              >
                <Edit2 className="w-3.5 h-3.5 text-grey" />
                <span>Edit Email</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveEmail} className="p-4 bg-white border border-[#B91C1C]/30 rounded-xl space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-nearblack block">
                  Edit Email Address
                </label>
                <span className="text-[11px] text-grey">Enter your new email address below</span>
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={emailValue}
                    onChange={(e) => {
                      setEmailValue(e.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    placeholder="user@example.com"
                    className={`w-full pl-10 pr-4 py-2 text-sm font-mono bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 transition ${
                      emailError ? "border-red-400 text-red-900" : "border-gray-300 text-nearblack"
                    }`}
                  />
                </div>

                {emailError && (
                  <div className="flex items-center gap-1.5 text-xs text-[#DC2626] font-medium pt-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{emailError}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSavingEmail}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-bold uppercase tracking-wider transition shadow-sm disabled:opacity-50"
                >
                  {isSavingEmail ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEmail}
                  disabled={isSavingEmail}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-grey transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Section 2: Change Password */}
      <section
        aria-label="Change Password"
        className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-5"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-nearblack" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-nearblack">
              Change Password
            </h2>
          </div>
          <span className="text-[11px] font-medium text-grey bg-gray-100 px-2 py-0.5 rounded">
            Account Security
          </span>
        </div>

        {/* Password Success Banner */}
        {passwordSuccessMsg && (
          <div className="flex items-center justify-between gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-[#16A34A] font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#16A34A]" />
              <span>{passwordSuccessMsg}</span>
            </div>
            <button
              onClick={() => setPasswordSuccessMsg(null)}
              className="text-emerald-700 hover:text-emerald-900 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Password Error Banner */}
        {passwordError && (
          <div className="flex items-center justify-between gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-[#DC2626] font-medium">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#DC2626]" />
              <span>{passwordError}</span>
            </div>
            <button
              onClick={() => setPasswordError(null)}
              className="text-red-700 hover:text-red-900 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSavePassword} className="space-y-4 max-w-lg">
          {/* Field 1: Current Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-grey block">
              Current Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-300 rounded-lg text-nearblack focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 transition"
              />
            </div>
          </div>

          {/* Field 2: New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-grey block">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                placeholder="Min. 6 characters"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-300 rounded-lg text-nearblack focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 transition"
              />
            </div>
          </div>

          {/* Field 3: Confirm New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-grey block">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                placeholder="Re-enter new password"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-300 rounded-lg text-nearblack focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSavingPassword}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-bold uppercase tracking-wider transition shadow-sm disabled:opacity-50"
            >
              {isSavingPassword ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
