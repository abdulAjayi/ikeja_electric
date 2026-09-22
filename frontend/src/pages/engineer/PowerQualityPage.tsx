import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Zap,
  Radio,
  Clock,
} from "lucide-react";
import { useEngineerTelemetry } from "../../hooks/useEngineerTelemetry";

// Status Classification Helpers (Reused from Meter Detail Page)
const getPowerFactorStatus = (pf?: number) => {
  if (pf === undefined || pf === null) return { label: "--", textColor: "text-grey" };
  if (pf >= 0.90) return { label: "Optimal", textColor: "text-[#16A34A]" };
  if (pf >= 0.75) return { label: "Marginal", textColor: "text-[#CA8A04]" };
  return { label: "Poor", textColor: "text-[#DC2626]" };
};

const getTHDStatus = (thd?: number) => {
  if (thd === undefined || thd === null) return { label: "--", textColor: "text-grey" };
  if (thd < 4.0) return { label: "Normal", textColor: "text-[#16A34A]" };
  if (thd <= 7.0) return { label: "Elevated", textColor: "text-[#CA8A04]" };
  return { label: "High", textColor: "text-[#DC2626]" };
};

const getReactiveStatus = (q?: number) => {
  if (q === undefined || q === null) return { label: "--", textColor: "text-grey" };
  if (q <= 45.0) return { label: "Normal", textColor: "text-[#16A34A]" };
  if (q <= 75.0) return { label: "Elevated", textColor: "text-[#CA8A04]" };
  return { label: "Spiking", textColor: "text-[#DC2626]" };
};

const getFrequencyStatus = (freq?: number) => {
  if (freq === undefined || freq === null) return { label: "--", textColor: "text-grey" };
  if (freq >= 49.5 && freq <= 50.5) return { label: "Stable", textColor: "text-[#16A34A]" };
  if (freq >= 49.0 && freq <= 51.0) return { label: "Drifting", textColor: "text-[#CA8A04]" };
  return { label: "Unstable", textColor: "text-[#DC2626]" };
};

type SortField =
  | "meterId"
  | "location"
  | "powerFactor"
  | "harmonics"
  | "reactivePower"
  | "frequency";

type SortOrder = "asc" | "desc";

export const PowerQualityPage: React.FC = () => {
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
        case "powerFactor":
          valA = a.reading?.powerFactor ?? 0.95;
          valB = b.reading?.powerFactor ?? 0.95;
          break;
        case "harmonics":
          valA = a.reading?.harmonics ?? 2.1;
          valB = b.reading?.harmonics ?? 2.1;
          break;
        case "reactivePower":
          valA = a.reading?.reactivePower ?? 32.8;
          valB = b.reading?.reactivePower ?? 32.8;
          break;
        case "frequency":
          valA = a.reading?.frequency ?? 50.0;
          valB = b.reading?.frequency ?? 50.0;
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

  // Aggregated summary stats across facility
  const aggregateStats = useMemo(() => {
    if (!meters || meters.length === 0) {
      return { avgPF: 0.95, maxTHD: 2.1, totalVAR: 164.0, avgFreq: 50.0 };
    }
    let totalPF = 0;
    let maxTHD = 0;
    let totalVAR = 0;
    let totalFreq = 0;
    let count = 0;

    for (const m of meters) {
      const pf = m.reading?.powerFactor ?? 0.95;
      const thd = m.reading?.harmonics ?? 2.1;
      const q = m.reading?.reactivePower ?? 32.8;
      const freq = m.reading?.frequency ?? 50.0;

      totalPF += pf;
      if (thd > maxTHD) maxTHD = thd;
      totalVAR += q;
      totalFreq += freq;
      count++;
    }

    return {
      avgPF: Number((totalPF / count).toFixed(2)),
      maxTHD: Number(maxTHD.toFixed(1)),
      totalVAR: Number(totalVAR.toFixed(1)),
      avgFreq: Number((totalFreq / count).toFixed(1)),
    };
  }, [meters]);

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
            <Activity className="w-5 h-5 text-nearblack" />
            <h1 className="text-xl sm:text-2xl font-bold text-nearblack tracking-tight">
              Power Quality Overview
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-grey">
            Real-time power factor, harmonics, and frequency stability across all meters
          </p>
        </div>

        {/* Live Feed Status Pill */}
        <div className="flex items-center gap-3 text-xs text-grey self-start sm:self-auto select-none">
          <div className="flex items-center gap-2 bg-white border border-gray-200/80 px-3 py-1.5 rounded-lg shadow-2xs">
            <span className="font-semibold text-nearblack font-mono">
              {stats.totalMeters} Meters Monitored
            </span>
            <span className="text-gray-300">·</span>
            {isConnected ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]"></span>
                </span>
                Live Stream
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

      {/* Facility Summary Cards (4 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Card 1: Power Factor */}
        <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-grey text-xs font-bold uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4 text-grey flex-shrink-0" />
            <span>Avg Power Factor</span>
          </div>
          <div className="my-1">
            <span className="text-2xl font-extrabold text-nearblack font-mono tracking-tight">
              {aggregateStats.avgPF.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-grey border-t border-gray-100 pt-1.5 mt-1">
            Target &ge; 0.90
          </p>
        </div>

        {/* Card 2: Max THD */}
        <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-grey text-xs font-bold uppercase tracking-wider mb-2">
            <Activity className="w-4 h-4 text-grey flex-shrink-0" />
            <span>Peak THD %</span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-extrabold text-nearblack font-mono tracking-tight">
              {aggregateStats.maxTHD.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-grey">%</span>
          </div>
          <p className="text-[11px] text-grey border-t border-gray-100 pt-1.5 mt-1">
            Limit &lt; 4.0%
          </p>
        </div>

        {/* Card 3: Total Reactive Power */}
        <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-grey text-xs font-bold uppercase tracking-wider mb-2">
            <Radio className="w-4 h-4 text-grey flex-shrink-0" />
            <span>Facility Reactive Power</span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-extrabold text-nearblack font-mono tracking-tight">
              {aggregateStats.totalVAR.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-grey">kVAR</span>
          </div>
          <p className="text-[11px] text-grey border-t border-gray-100 pt-1.5 mt-1">
            Aggregate load envelope
          </p>
        </div>

        {/* Card 4: Grid Frequency */}
        <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-grey text-xs font-bold uppercase tracking-wider mb-2">
            <Clock className="w-4 h-4 text-grey flex-shrink-0" />
            <span>Grid Frequency</span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-extrabold text-nearblack font-mono tracking-tight">
              {aggregateStats.avgFreq.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-grey">Hz</span>
          </div>
          <p className="text-[11px] text-grey border-t border-gray-100 pt-1.5 mt-1">
            Grid Sync Target 50.0 Hz
          </p>
        </div>
      </div>

      {/* Facility-Wide Power Quality Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-nearblack">
            Distribution Meter Power Quality Breakdown
          </h2>
          <span className="text-xs text-grey">Click row for full meter details</span>
        </div>

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

                  {/* Column 3: Power Factor */}
                  <th scope="col" className="py-3.5 px-4 text-right font-bold">
                    <button
                      onClick={() => handleSort("powerFactor")}
                      className="group inline-flex items-center gap-1.5 focus:outline-none hover:text-nearblack transition-colors ml-auto"
                    >
                      <span>Power Factor</span>
                      {renderSortIcon("powerFactor")}
                    </button>
                  </th>

                  {/* Column 4: Harmonics/THD % */}
                  <th scope="col" className="py-3.5 px-4 text-right font-bold">
                    <button
                      onClick={() => handleSort("harmonics")}
                      className="group inline-flex items-center gap-1.5 focus:outline-none hover:text-nearblack transition-colors ml-auto"
                    >
                      <span>Harmonics (THD %)</span>
                      {renderSortIcon("harmonics")}
                    </button>
                  </th>

                  {/* Column 5: Reactive Power */}
                  <th scope="col" className="py-3.5 px-4 text-right font-bold">
                    <button
                      onClick={() => handleSort("reactivePower")}
                      className="group inline-flex items-center gap-1.5 focus:outline-none hover:text-nearblack transition-colors ml-auto"
                    >
                      <span>Reactive Power (kVAR)</span>
                      {renderSortIcon("reactivePower")}
                    </button>
                  </th>

                  {/* Column 6: Frequency */}
                  <th scope="col" className="py-3.5 px-4 text-right font-bold">
                    <button
                      onClick={() => handleSort("frequency")}
                      className="group inline-flex items-center gap-1.5 focus:outline-none hover:text-nearblack transition-colors ml-auto"
                    >
                      <span>Frequency (Hz)</span>
                      {renderSortIcon("frequency")}
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
                    <td colSpan={7} className="py-12 text-center text-grey">
                      No power quality metrics stream available.
                    </td>
                  </tr>
                ) : (
                  sortedMeters.map((meter) => {
                    const pf = meter.reading?.powerFactor ?? 0.95;
                    const thd = meter.reading?.harmonics ?? 2.1;
                    const q = meter.reading?.reactivePower ?? 32.8;
                    const freq = meter.reading?.frequency ?? 50.0;

                    const pfSt = getPowerFactorStatus(pf);
                    const thdSt = getTHDStatus(thd);
                    const qSt = getReactiveStatus(q);
                    const freqSt = getFrequencyStatus(freq);

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

                        {/* Power Factor */}
                        <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap">
                          <span className="font-bold text-nearblack">{pf.toFixed(2)}</span>
                          <span className={`ml-2 text-xs font-semibold ${pfSt.textColor}`}>
                            {pfSt.label}
                          </span>
                        </td>

                        {/* Harmonics (THD %) */}
                        <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap">
                          <span className="font-bold text-nearblack">{thd.toFixed(1)}%</span>
                          <span className={`ml-2 text-xs font-semibold ${thdSt.textColor}`}>
                            {thdSt.label}
                          </span>
                        </td>

                        {/* Reactive Power (kVAR) */}
                        <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap">
                          <span className="font-bold text-nearblack">{q.toFixed(1)}</span>
                          <span className={`ml-2 text-xs font-semibold ${qSt.textColor}`}>
                            {qSt.label}
                          </span>
                        </td>

                        {/* Frequency (Hz) */}
                        <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap">
                          <span className="font-bold text-nearblack">{freq.toFixed(1)} Hz</span>
                          <span className={`ml-2 text-xs font-semibold ${freqSt.textColor}`}>
                            {freqSt.label}
                          </span>
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
