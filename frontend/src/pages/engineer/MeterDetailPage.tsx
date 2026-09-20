import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Gauge } from "lucide-react";

export const MeterDetailPage: React.FC = () => {
  const { meterId } = useParams<{ meterId: string }>();

  return (
    <div className="w-full space-y-6">
      <Link
        to="/engineer/overview"
        className="inline-flex items-center gap-2 text-xs font-semibold text-grey hover:text-[#B91C1C] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Overview</span>
      </Link>

      <div className="bg-white rounded-2xl p-8 sm:p-10 border border-black/5 shadow-sm">
        <div className="flex items-center gap-3 text-grey mb-3">
          <Gauge className="w-5 h-5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal">
            Meter Telemetry Detail
          </span>
        </div>
        <h2 className="text-xl font-bold text-nearblack tracking-tight mb-2">
          Meter {meterId || "Unknown"}
        </h2>
        <p className="text-sm text-grey">
          Content for individual meter telemetry detail ({meterId}) goes here. Scheduled for the next development phase.
        </p>
      </div>
    </div>
  );
};
