import React from "react";
import { AlertTriangle } from "lucide-react";

export const ThresholdsAlertsPage: React.FC = () => {
  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl p-8 sm:p-10 border border-black/5 shadow-sm">
        <div className="flex items-center gap-3 text-grey mb-3">
          <AlertTriangle className="w-5 h-5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal">
            Engineer Portal
          </span>
        </div>
        <h2 className="text-xl font-bold text-nearblack tracking-tight mb-2">
          Thresholds & Alerts
        </h2>
        <p className="text-sm text-grey">
          Content for Thresholds & Alerts goes here.
        </p>
      </div>
    </div>
  );
};
