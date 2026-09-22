import React from "react";
import {
  Zap,
  Clock,
  Activity,
  AlertTriangle,
  Lightbulb,
  ArrowUpRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { useExecutiveTelemetry } from "../../hooks/useExecutiveTelemetry";

const LoadTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-nearblack/90 backdrop-blur text-white text-xs px-3 py-2 rounded-lg shadow-lg font-mono border border-white/10 space-y-1">
        <div className="text-[10px] text-gray-400 border-b border-white/10 pb-1 font-sans font-medium">
          Time: {label}
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#60A5FA] font-sans font-medium text-[11px]">
            Facility Load:
          </span>
          <span className="font-bold font-mono">
            {Number(val).toFixed(1)} kW
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const PeakDemandPage: React.FC = () => {
  const { meters, historySeries, isConnected, peakLoadKW, peakLoadTime } =
    useExecutiveTelemetry();

  // Calculate current instantaneous total load (kW) across all meters
  let currentTotalLoadKW = 0;
  const meterLoadBreakdown: Array<{ id: string; location: string; loadKW: number; currentA: number }> = [];

  for (const m of meters) {
    if (m.reading) {
      const currentA = m.reading.phaseA_current ?? 15;
      const loadKW = Number((currentA * 14.4).toFixed(1));
      currentTotalLoadKW += loadKW;
      meterLoadBreakdown.push({
        id: m.meterId,
        location: m.location,
        loadKW,
        currentA,
      });
    }
  }

  currentTotalLoadKW = Number(currentTotalLoadKW.toFixed(1));

  // Find meter with highest current load
  const highestMeter = meterLoadBreakdown.length > 0
    ? [...meterLoadBreakdown].sort((a, b) => b.loadKW - a.loadKW)[0]
    : null;

  return (
    <div className="w-full space-y-6 pb-12 font-sans">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Zap className="w-5 h-5 text-nearblack" />
            <h1 className="text-xl sm:text-2xl font-bold text-nearblack tracking-tight">
              Peak Demand
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-grey">
            Facility load patterns and demand reduction insights
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200/80 px-3 py-1.5 rounded-lg shadow-2xs text-xs text-grey">
          <span className="font-semibold text-nearblack font-mono">
            Peak: {peakLoadKW.toFixed(1)} kW
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
            <span className="text-gray-400">Connecting</span>
          )}
        </div>
      </div>

      {/* Hero Stat Cards (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Today's Peak Load */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#DC2626]" />
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-grey mb-2 pl-2">
            <span>Today's Peak Load</span>
            <AlertTriangle className="w-4 h-4 text-grey" />
          </div>
          <div className="pl-2 my-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-nearblack font-mono tracking-tight">
              {peakLoadKW.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-grey">kW</span>
          </div>
          <p className="pl-2 text-[11px] text-grey pt-2 border-t border-gray-100 mt-2">
            Highest instantaneous facility draw
          </p>
        </div>

        {/* Card 2: Time of Peak */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#CA8A04]" />
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-grey mb-2 pl-2">
            <span>Time of Peak</span>
            <Clock className="w-4 h-4 text-grey" />
          </div>
          <div className="pl-2 my-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-nearblack font-mono tracking-tight">
              {peakLoadTime}
            </span>
          </div>
          <p className="pl-2 text-[11px] text-grey pt-2 border-t border-gray-100 mt-2">
            Recorded timestamp
          </p>
        </div>

        {/* Card 3: Current Facility Load */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1E40AF]" />
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-grey mb-2 pl-2">
            <span>Current Facility Load</span>
            <Activity className="w-4 h-4 text-grey" />
          </div>
          <div className="pl-2 my-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-nearblack font-mono tracking-tight">
              {currentTotalLoadKW.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-grey">kW</span>
          </div>
          <p className="pl-2 text-[11px] text-grey pt-2 border-t border-gray-100 mt-2">
            Live aggregate grid draw
          </p>
        </div>
      </div>

      {/* Live Facility Load Curve Chart */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-nearblack">
              Facility Total Load Profile (kW)
            </h2>
            <p className="text-[11px] text-grey">Time-series grid draw with peak load reference line</p>
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
                unit=" kW"
              />
              <Tooltip content={<LoadTooltip />} />
              {peakLoadKW > 0 && (
                <ReferenceLine
                  y={peakLoadKW}
                  stroke="#DC2626"
                  strokeDasharray="3 3"
                  label={{
                    value: `Peak: ${peakLoadKW.toFixed(1)} kW`,
                    fill: "#DC2626",
                    fontSize: 10,
                    fontWeight: 700,
                    position: "top",
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="facilityLoadKW"
                stroke="#1E40AF"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Demand Reduction Insights Card */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-nearblack">
              Demand Reduction & Load-Shedding Insights
            </h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#1E40AF] px-2 py-0.5 rounded border border-blue-200">
            System Advisory
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Insight 1 */}
          <div className="p-4 bg-[#F7F7F5]/80 rounded-xl border border-gray-200/60 flex items-start gap-3">
            <ArrowUpRight className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-nearblack uppercase tracking-wider">
                Peak Load Distribution Focus
              </h3>
              <p className="text-xs text-grey leading-relaxed">
                {highestMeter ? (
                  <>
                    Consider reviewing <strong>{highestMeter.id}</strong> ({highestMeter.location}) — currently drawing <strong>{highestMeter.loadKW.toFixed(1)} kW</strong> ({highestMeter.currentA.toFixed(1)} A), accounting for the largest share of active facility load.
                  </>
                ) : (
                  "Monitoring active meter loads to identify demand reduction opportunities."
                )}
              </p>
            </div>
          </div>

          {/* Insight 2 */}
          <div className="p-4 bg-[#F7F7F5]/80 rounded-xl border border-gray-200/60 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-[#1E40AF] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-nearblack uppercase tracking-wider">
                Utility Demand Charge Impact
              </h3>
              <p className="text-xs text-grey leading-relaxed">
                Staggering heavy equipment starts during peak windows can lower the <strong>{peakLoadKW.toFixed(1)} kW</strong> peak threshold and reduce estimated monthly utility demand charges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
