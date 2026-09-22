import React from "react";
import { LogOut } from "lucide-react";

interface ConfirmSignoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmSignoutModal: React.FC<ConfirmSignoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      {/* Backdrop Click */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 text-center space-y-4 z-10 transform transition-all">
        {/* Warning Icon Header */}
        <div className="w-12 h-12 rounded-full bg-red-50 text-[#B91C1C] border border-red-100 flex items-center justify-center mx-auto shadow-2xs">
          <LogOut className="w-6 h-6 ml-0.5" />
        </div>

        <div className="space-y-1">
          <h3
            id="modal-title"
            className="text-lg font-bold text-nearblack tracking-tight"
          >
            Sign Out Confirmation
          </h3>
          <p className="text-xs text-grey leading-relaxed">
            Are you sure you want to sign out of the Ikeja Energy Grid Telemetry Portal? You will need to sign in again to access the dashboard.
          </p>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-grey hover:bg-gray-50 text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-bold transition shadow-sm"
          >
            Yes, Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
