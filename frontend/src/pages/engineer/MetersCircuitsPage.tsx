import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Gauge,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
} from "lucide-react";
import { useEngineerTelemetry } from "../../hooks/useEngineerTelemetry";
import type { MeterStatus } from "../../types/telemetry";

const STATUS_CONFIG: Record<
  MeterStatus,
  { label: string; badgeClass: string; dotClass: string; priority: number }
> = {
  NORMAL: {
    label: "NORMAL",
    badgeClass: "bg-emerald-50 text-[#16A34A] border-emerald-200",
    dotClass: "bg-[#16A34A]",
    priority: 1,
  },
  WARNING: {
    label: "WARNING",
    badgeClass: "bg-amber-50 text-[#CA8A04] border-amber-200",
    dotClass: "bg-[#CA8A04]",
    priority: 2,
  },
  CRITICAL: {
    label: "CRITICAL",
    badgeClass: "bg-red-50 text-[#DC2626] border-red-200",
    dotClass: "bg-[#DC2626]",
    priority: 3,
  },
  STALE: {
    label: "STALE",
    badgeClass: "bg-gray-100 text-[#9CA3AF] border-gray-200",
    dotClass: "bg-[#9CA3AF]",
    priority: 4,
  },
};

type SortField =
  | "meterId"
  | "location"
  | "status"
  | "energyToday"
  | "voltage"
  | "current"
  | "lastSeen";

type SortOrder = "asc" | "desc";

export const MetersCircuitsPage: React.FC = () => {
  const navigate = useNavigate();
  const { meters, stats, isConnected } = useEngineerTelemetry();

  const [sortField, setSortField] = useState<SortField>("meterId");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedMeters = useMemo(() => {
    return [...meters].sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sortField) {
        case "meterId":
          valA = a.meterId;
          valB = b.meterId;
          break;
        case "location":
          valA = a.location;
          valB = b.location;
          break;
        case "status":
          valA = STATUS_CONFIG[a.status]?.priority ?? 99;
          valB = STATUS_CONFIG[b.status]?.priority ?? 99;
          break;
        case "energyToday":
          valA = a.reading?.energyToday ?? 0;
          valB = b.reading?.energyToday ?? 0;
          break;
        case "voltage":
          valA = a.reading?.phaseA_N_voltage ?? 0;
          valB = b.reading?.phaseA_N_voltage ?? 0;
          break;
        case "current":
          valA = a.reading?.phaseA_current ?? 0;
          valB = b.reading?.phaseA_current ?? 0;
          break;
        case "lastSeen":
          valA = a.lastSeen ? new Date(a.lastSeen).getTime() : 0;
          valB = b.lastSeen ? new Date(b.lastSeen).getTime() : 0;
          break;
        default:
          valA = a.meterId;
          valB = b.meterId;
      }

      if (typeof valA === "string") {
        const comp = valA.localeCompare(valB);
        return sortOrder === "asc" ? comp : -comp;
      }
      const comp = valA < valB ? -1 : valA > valB ? 1 : 0;
      return sortOrder === "asc" ? comp : -comp;
    });
  }, [meters, sortField, sortOrder]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-nearblack transition-colors" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#B91C1C]" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#B91C1C]" />
    );
  };

  return (
    <div className="w-full space-y-6 pb-12 font-sans">
      {/* Page Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Gauge className="w-5 h-5 text-nearblack" />
            <h1 className="text-xl sm:text-2xl font-bold text-nearblack tracking-tight">
              Meters & Circuits
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-grey">
            Full directory of all distribution meters across the Ikeja grid network
          </p>
        </div>

        {/* Live Feed Status Pill */}
        <div className="flex items-center gap-3 text-xs text-grey self-start sm:self-auto select-none">
          <div className="flex items-center gap-2 bg-white border border-gray-200/80 px-3 py-1.5 rounded-lg shadow-2xs">
            <span className="font-semibold text-nearblack font-mono">
              {stats.totalMeters} Meters
            </span>
            <span className="text-gray-300">·</span>
            {isConnected ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]"></span>
                </span>
                Live Feed
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                Connecting
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-5">
        {/* Metric Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F7F7F5]/60 rounded-xl p-3 border border-gray-200/60 text-xs">
          <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-gray-200/70 shadow-2xs">
            <span className="text-grey font-medium">Total Meters</span>
            <span className="font-bold font-mono text-nearblack text-sm">{stats.totalMeters}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-gray-200/70 shadow-2xs">
            <span className="text-grey font-medium">Normal / Active</span>
            <span className="font-bold font-mono text-[#16A34A] text-sm">{stats.liveCount}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-gray-200/70 shadow-2xs">
            <span className="text-grey font-medium">Critical Alerts</span>
            <span className="font-bold font-mono text-[#DC2626] text-sm">{stats.criticalCount}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-gray-200/70 shadow-2xs">
            <span className="text-grey font-medium">Offline / Stale</span>
            <span className="font-bold font-mono text-grey text-sm">{stats.offlineCount}</span>
          </div>
        </div>

        {/* Directory Table */}
        <div className="rounded-lg border border-gray-200/80 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead className="bg-[#F7F7F5] border-b border-gray-200/80 text-[11px] font-bold uppercase tracking-wider text-grey select-none">
                <tr>
                  {/* Column 1: Meter ID */}
                  <th scope="col" className="py-3.5 px-4 text-left font-bold">
                    <button
                      onClick={() => handleSort("meterId")}
                      className="group inline-flex items-center gap-1.5 focus:outline-none hover:text-nearblack transition-colors"
                    >
                      <span>Meter ID</span>
                      {renderSortIcon("meterId")}
                    </button>
                  </th>

                  {/* Column 2: Location */}
                  <th scope="col" className="py-3.5 px-4 text-left font-bold">
                    <button
                      onClick={() => handleSort("location")}
                      className="group inline-flex items-center gap-1.5 focus:outline-none hover:text-nearblack transition-colors"
                    >
                      <span>Location</span>
                      {renderSortIcon("location")}
                    </button>
                  </th>

                  {/* Column 3: Status */}
                  <th scope="col" className="py-3.5 px-4 text-center font-bold">
                    <button
                      onClick={() => handleSort("status")}
                      className="group inline-flex items-center gap-1.5 focus:outline-none hover:text-nearblack transition-colors"
                    >
                      <span>Status</span>
                      {renderSortIcon("status")}
                    </button>
                  </th>

                  {/* Column 4: Energy Today */}
                  <th scope="col" className="py-3.5 px-4 text-right font-bold">
                    <button
                      onClick={() => handleSort("energyToday")}
                      className="group inline-flex items-center gap-1.5 focus:outline-none hover:text-nearblack transition-colors ml-auto"
                    >
                      <span>Energy Today (kWh)</span>
                      {renderSortIcon("energyToday")}
                    </button>
                  </th>

                  {/* Column 5: Phase A-N Voltage */}
                  <th scope="col" className="py-3.5 px-4 text-right font-bold">
                    <button
                      onClick={() => handleSort("voltage")}
                      className="group inline-flex items-center gap-1.5 focus:outline-none hover:text-nearblack transition-colors ml-auto"
                    >
                      <span>Phase A-N Voltage</span>
                      {renderSortIcon("voltage")}
                    </button>
                  </th>

                  {/* Column 6: Phase A Current */}
                  <th scope="col" className="py-3.5 px-4 text-right font-bold">
                    <button
                      onClick={() => handleSort("current")}
                      className="group inline-flex items-center gap-1.5 focus:outline-none hover:text-nearblack transition-colors ml-auto"
                    >
                      <span>Phase A Current</span>
                      {renderSortIcon("current")}
                    </button>
                  </th>

                  {/* Column 7: Last Synced */}
                  <th scope="col" className="py-3.5 px-4 text-right font-bold">
                    <button
                      onClick={() => handleSort("lastSeen")}
                      className="group inline-flex items-center gap-1.5 focus:outline-none hover:text-nearblack transition-colors ml-auto"
                    >
                      <span>Last Synced</span>
                      {renderSortIcon("lastSeen")}
                    </button>
                  </th>

                  <th scope="col" className="py-3.5 px-3 text-center w-8">
                    <span className="sr-only">Details</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white text-xs font-sans">
                {sortedMeters.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-grey">
                      No distribution meters found in telemetry directory.
                    </td>
                  </tr>
                ) : (
                  sortedMeters.map((meter) => {
                    const badge = STATUS_CONFIG[meter.status] || STATUS_CONFIG.NORMAL;

                    const formattedSync = meter.lastSeen
                      ? new Date(meter.lastSeen).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        })
                      : "Waiting for signal";

                    const voltVal = meter.reading?.phaseA_N_voltage;
                    const formattedVolt = voltVal !== undefined
                      ? voltVal > 100
                        ? `${(voltVal / 1000).toFixed(2)} kV`
                        : `${voltVal.toFixed(1)} V`
                      : "--";

                    const currentVal = meter.reading?.phaseA_current;
                    const formattedCurrent = currentVal !== undefined ? `${currentVal.toFixed(1)} A` : "--";

                    const energyVal = meter.reading?.energyToday;
                    const formattedEnergy = energyVal !== undefined ? energyVal.toFixed(2) : "--";

                    return (
                      <tr
                        key={meter.meterId}
                        onClick={() => navigate(`/engineer/meters/${meter.meterId}`)}
                        className="group hover:bg-[#F7F7F5] cursor-pointer transition-colors"
                      >
                        {/* Meter ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-nearblack group-hover:text-[#B91C1C] transition-colors whitespace-nowrap">
                          {meter.meterId}
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4 font-medium text-nearblack whitespace-nowrap">
                          {meter.location}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${badge.badgeClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                            {badge.label}
                          </span>
                        </td>

                        {/* Energy Today */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-nearblack whitespace-nowrap">
                          {formattedEnergy}
                        </td>

                        {/* Phase A-N Voltage */}
                        <td className="py-3.5 px-4 text-right font-mono text-charcoal whitespace-nowrap">
                          {formattedVolt}
                        </td>

                        {/* Phase A Current */}
                        <td className="py-3.5 px-4 text-right font-mono text-charcoal whitespace-nowrap">
                          {formattedCurrent}
                        </td>

                        {/* Last Synced */}
                        <td className="py-3.5 px-4 text-right font-mono text-grey whitespace-nowrap">
                          {formattedSync}
                        </td>

                        {/* Arrow Affordance */}
                        <td className="py-3.5 px-3 text-center text-gray-300 group-hover:text-nearblack transition-colors">
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
