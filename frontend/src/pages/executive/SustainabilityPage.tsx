import React from "react";
import {
  Leaf,
  Globe,
  FileCheck,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useExecutiveTelemetry } from "../../hooks/useExecutiveTelemetry";

const EmissionsTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-nearblack/90 backdrop-blur text-white text-xs px-3 py-2 rounded-lg shadow-lg font-mono border border-white/10 space-y-1">
        <div className="text-[10px] text-gray-400 border-b border-white/10 pb-1 font-sans font-medium">
          Time: {label}
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-emerald-400 font-sans font-medium text-[11px]">
            Emissions:
          </span>
          <span className="font-bold font-mono">
            {Number(val).toFixed(2)} kg CO2
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const SustainabilityPage: React.FC = () => {
  const { executiveSummary, historySeries, isConnected } = useExecutiveTelemetry();

  const emissionsKg = executiveSummary.emissionsKgCO2;
  const metricTons = Number((emissionsKg / 1000).toFixed(3));

  return (
    <div className="w-full space-y-6 pb-12 font-sans">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Leaf className="w-5 h-5 text-nearblack" />
            <h1 className="text-xl sm:text-2xl font-bold text-nearblack tracking-tight">
              Sustainability & ESG
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-grey">
            Emissions tracking and compliance overview across facility operations
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200/80 px-3 py-1.5 rounded-lg shadow-2xs text-xs text-grey">
          <span className="font-semibold text-nearblack font-mono">
            Grid Factor: {executiveSummary.emissionsFactor} kg CO2/kWh
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
            <span className="text-gray-400">Connecting</span>
          )}
        </div>
      </div>

      {/* Hero Stat Cards (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Emissions Today */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-600" />
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-grey mb-2 pl-2">
            <span>Total Emissions Today</span>
            <Leaf className="w-4 h-4 text-grey" />
          </div>
          <div className="pl-2 my-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-nearblack font-mono tracking-tight">
              {emissionsKg.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-grey">kg CO2</span>
          </div>
          <p className="pl-2 text-[11px] text-grey pt-2 border-t border-gray-100 mt-2">
            Scope 2 electricity emissions
          </p>
        </div>

        {/* Card 2: Metric Tons Equivalent */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0891B2]" />
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-grey mb-2 pl-2">
            <span>Metric Tons Equivalent</span>
            <Globe className="w-4 h-4 text-grey" />
          </div>
          <div className="pl-2 my-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-nearblack font-mono tracking-tight">
              {metricTons.toFixed(3)}
            </span>
            <span className="text-xs font-semibold text-grey">MT CO2e</span>
          </div>
          <p className="pl-2 text-[11px] text-grey pt-2 border-t border-gray-100 mt-2">
            Normalized carbon mass
          </p>
        </div>

        {/* Card 3: Grid Emission Factor */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-charcoal" />
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-grey mb-2 pl-2">
            <span>Grid Emissions Factor</span>
            <FileCheck className="w-4 h-4 text-grey" />
          </div>
          <div className="pl-2 my-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-nearblack font-mono tracking-tight">
              {executiveSummary.emissionsFactor}
            </span>
            <span className="text-xs font-semibold text-grey">kg CO2 / kWh</span>
          </div>
          <p className="pl-2 text-[11px] text-grey pt-2 border-t border-gray-100 mt-2">
            Sub-Saharan regional grid baseline
          </p>
        </div>
      </div>

      {/* Live Emissions Accumulation Line Chart */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-nearblack">
              Accumulated CO2 Emissions Trajectory
            </h2>
            <p className="text-[11px] text-grey">Real-time Scope 2 emissions growth over time (kg CO2)</p>
          </div>
          <span className="text-[10px] font-semibold text-grey bg-gray-100 px-2.5 py-0.5 rounded border border-gray-200">
            Live Stream
          </span>
        </div>

        <div className="h-72 w-full bg-[#F7F7F5]/50 rounded-xl p-4 border border-gray-200/60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historySeries} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "#6B7280" }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#6B7280" }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                unit=" kg"
              />
              <Tooltip content={<EmissionsTooltip />} />
              <Line
                type="monotone"
                dataKey="emissionsKgCO2"
                stroke="#059669"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Compliance Snapshot Card */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-nearblack">
              Compliance & Reporting Snapshot
            </h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
            ISO 50001 Aligned
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F7F7F5]/60 rounded-xl p-5 border border-gray-200/60">
          <div className="md:col-span-2 space-y-2">
            <h3 className="text-sm font-bold text-nearblack">
              Tracking toward ISO 50001 Energy Management Alignment
            </h3>
            <p className="text-xs text-grey leading-relaxed">
              Emissions metrics are calculated automatically from real-time kWh telemetry using the standard sub-Saharan regional grid factor of <strong>{executiveSummary.emissionsFactor} kg CO2/kWh</strong>. This transparent methodology provides audit-ready data for corporate ESG disclosures and GHG Protocol Scope 2 reporting.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-grey mb-1">
              <Info className="w-3.5 h-3.5 text-grey" />
              <span>Calculation Rule</span>
            </div>
            <p className="text-xs font-mono font-semibold text-nearblack mt-1">
              CO2 (kg) = kWh &times; {executiveSummary.emissionsFactor}
            </p>
            <p className="text-[10px] text-grey/80 mt-1">
              Automated continuous calculation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
