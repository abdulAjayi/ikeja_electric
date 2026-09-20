import React from "react";
import { useEngineerTelemetry } from "../../hooks/useEngineerTelemetry";
import { MeterCard } from "../../components/meters/MeterCard";
import { Radio } from "lucide-react";

export const EngineerOverviewPage: React.FC = () => {
  const { meters, stats, isConnected } = useEngineerTelemetry();

  return (
    <div className="w-full space-y-7 pb-10">
      {/* Page Header & Live Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-nearblack tracking-tight">
            Grid Overview & Telemetry
          </h2>
          <p className="text-xs sm:text-sm text-grey mt-0.5">
            Real-time feed monitoring {stats.totalMeters} distribution meters across the Ikeja network.
          </p>
        </div>

        {/* Live Stream Status Indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-xs select-none self-start sm:self-auto">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-[#16A34A] animate-pulse" : "bg-amber-500"
            }`}
          />
          <span className="font-medium text-charcoal">
            {isConnected ? "Live WebSocket Feed" : "Connecting..."}
          </span>
          <Radio className={`w-3.5 h-3.5 ${isConnected ? "text-[#16A34A]" : "text-amber-500"}`} />
        </div>
      </div>

      {/* SECTION 1: Summary Stat Cards (Sharper Instrument-Panel Aesthetic) */}
      <section aria-label="Grid Status Summary" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Critical Card */}
        <div className="bg-white rounded-md border border-gray-200 border-l-[3px] border-l-[#DC2626] p-4 sm:p-5 shadow-none hover:border-gray-300 transition">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-grey">
              Critical
            </span>
            <span className="text-xs font-semibold text-[#DC2626]">
              {stats.criticalPct}%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-nearblack tracking-tight font-mono">
              {stats.criticalCount}
            </span>
            <span className="text-xs text-grey">
              of {stats.totalMeters} meters
            </span>
          </div>
          <p className="text-[11px] text-grey/80 mt-1">
            Threshold breaches requiring response
          </p>
        </div>

        {/* Live / Normal Card */}
        <div className="bg-white rounded-md border border-gray-200 border-l-[3px] border-l-[#16A34A] p-4 sm:p-5 shadow-none hover:border-gray-300 transition">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-grey">
              Live / Normal
            </span>
            <span className="text-xs font-semibold text-[#16A34A]">
              {stats.livePct}%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-nearblack tracking-tight font-mono">
              {stats.liveCount}
            </span>
            <span className="text-xs text-grey">
              of {stats.totalMeters} meters
            </span>
          </div>
          <p className="text-[11px] text-grey/80 mt-1">
            Operating within normal electrical limits
          </p>
        </div>

        {/* Offline / Stale Card */}
        <div className="bg-white rounded-md border border-gray-200 border-l-[3px] border-l-[#9CA3AF] p-4 sm:p-5 shadow-none hover:border-gray-300 transition">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-grey">
              Offline / Stale
            </span>
            <span className="text-xs font-semibold text-grey">
              {stats.offlinePct}%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-nearblack tracking-tight font-mono">
              {stats.offlineCount}
            </span>
            <span className="text-xs text-grey">
              of {stats.totalMeters} meters
            </span>
          </div>
          <p className="text-[11px] text-grey/80 mt-1">
            Comms silent for &gt;2.5s or unregistered
          </p>
        </div>
      </section>

      {/* SECTION 2: Meter Grid (5 Cards, 1 per Meter) */}
      <section aria-label="Meter Telemetry Grid">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-grey">
            Active Distribution Meters ({meters.length})
          </h3>
          <span className="text-xs text-grey">
            Live updates every 1,000ms
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {meters.map((meter) => (
            <MeterCard key={meter.meterId} meter={meter} />
          ))}
        </div>
      </section>
    </div>
  );
};
