import React from "react";
import {
  DollarSign,
  Zap,
  CreditCard,
  Building2,
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

const CostTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-nearblack/90 backdrop-blur text-white text-xs px-3 py-2 rounded-lg shadow-lg font-mono border border-white/10 space-y-1">
        <div className="text-[10px] text-gray-400 border-b border-white/10 pb-1 font-sans font-medium">
          Time: {label}
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#16A34A] font-sans font-medium text-[11px]">
            Total Cost:
          </span>
          <span className="font-bold font-mono">
            &#8358;{Number(val).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const CostOverviewPage: React.FC = () => {
  const { executiveSummary, meters, historySeries, isConnected, peakLoadKW } =
    useExecutiveTelemetry();

  // Estimated Utility Demand Charge (kW * ₦3,500 demand rate)
  const estimatedDemandCharge = Number((peakLoadKW * 3500).toFixed(2));

  return (
    <div className="w-full space-y-6 pb-12 font-sans">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <DollarSign className="w-5 h-5 text-nearblack" />
            <h1 className="text-xl sm:text-2xl font-bold text-nearblack tracking-tight">
              Cost Overview
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-grey">
            Real-time energy cost across the Ikeja network
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200/80 px-3 py-1.5 rounded-lg shadow-2xs text-xs text-grey">
          <span className="font-semibold text-nearblack font-mono">
            Rate: &#8358;{executiveSummary.costPerKWhRate.toFixed(2)}/kWh
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

      {/* Hero Stat Cards (4 Cards with Sharp Instrument Accent Bars) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Cost Today */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#16A34A]" />
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-grey mb-2 pl-2">
            <span>Total Cost Today</span>
            <DollarSign className="w-4 h-4 text-grey" />
          </div>
          <div className="pl-2 my-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-nearblack font-mono tracking-tight">
              &#8358;{executiveSummary.totalCostNGN.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="pl-2 text-[11px] text-grey pt-2 border-t border-gray-100 mt-2">
            Accumulated grid billing
          </p>
        </div>

        {/* Card 2: Total Energy Consumed Today */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2563EB]" />
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-grey mb-2 pl-2">
            <span>Energy Consumed</span>
            <Zap className="w-4 h-4 text-grey" />
          </div>
          <div className="pl-2 my-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-nearblack font-mono tracking-tight">
              {executiveSummary.totalEnergyKWh.toLocaleString("en-NG", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-xs font-semibold text-grey">kWh</span>
          </div>
          <p className="pl-2 text-[11px] text-grey pt-2 border-t border-gray-100 mt-2">
            Aggregate meter consumption
          </p>
        </div>

        {/* Card 3: Estimated Demand Charge */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#CA8A04]" />
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-grey mb-2 pl-2">
            <span>Est. Demand Charge</span>
            <CreditCard className="w-4 h-4 text-grey" />
          </div>
          <div className="pl-2 my-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-nearblack font-mono tracking-tight">
              &#8358;{estimatedDemandCharge.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="pl-2 text-[11px] text-grey pt-2 border-t border-gray-100 mt-2">
            Est. based on {peakLoadKW.toFixed(1)} kW peak load
          </p>
        </div>

        {/* Card 4: Active Billing Meters */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-charcoal" />
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-grey mb-2 pl-2">
            <span>Active Billing Meters</span>
            <Building2 className="w-4 h-4 text-grey" />
          </div>
          <div className="pl-2 my-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-nearblack font-mono tracking-tight">
              {executiveSummary.activeMetersCount}
            </span>
            <span className="text-xs font-semibold text-grey">/ {meters.length || 5}</span>
          </div>
          <p className="pl-2 text-[11px] text-grey pt-2 border-t border-gray-100 mt-2">
            Active telemetry endpoints
          </p>
        </div>
      </div>

      {/* Live Cost Accumulation Line Chart */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-nearblack">
              Accumulated Energy Cost Over Time
            </h2>
            <p className="text-[11px] text-grey">Real-time cost accumulation trajectory (NGN &#8358;)</p>
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
                unit=" &#8358;"
              />
              <Tooltip content={<CostTooltip />} />
              <Line
                type="monotone"
                dataKey="totalCostNGN"
                stroke="#16A34A"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-Meter Cost Breakdown Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-nearblack">
            Per-Meter Energy Cost Breakdown
          </h2>
          <span className="text-xs text-grey">
            Calculated at &#8358;{executiveSummary.costPerKWhRate.toFixed(2)}/kWh
          </span>
        </div>

        <div className="rounded-lg border border-gray-200/80 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-[#F7F7F5] border-b border-gray-200/80 text-[11px] font-bold uppercase tracking-wider text-grey select-none">
                <tr>
                  <th scope="col" className="py-3.5 px-4 text-left font-bold">Meter ID</th>
                  <th scope="col" className="py-3.5 px-4 text-left font-bold">Location</th>
                  <th scope="col" className="py-3.5 px-4 text-right font-bold">Energy Today (kWh)</th>
                  <th scope="col" className="py-3.5 px-4 text-right font-bold">Tariff Rate</th>
                  <th scope="col" className="py-3.5 px-4 text-right font-bold">Estimated Cost (&#8358;)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-xs font-sans">
                {meters.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-grey">
                      Waiting for meter telemetry feed...
                    </td>
                  </tr>
                ) : (
                  meters.map((meter) => {
                    const energyKWh = meter.reading?.energyToday ?? 0;
                    const meterCost = Number((energyKWh * executiveSummary.costPerKWhRate).toFixed(2));
                    return (
                      <tr key={meter.meterId} className="hover:bg-[#F7F7F5] transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-nearblack">
                          {meter.meterId}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-nearblack">
                          {meter.location}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-nearblack font-semibold">
                          {energyKWh.toFixed(2)} kWh
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-grey">
                          &#8358;{executiveSummary.costPerKWhRate.toFixed(2)}/kWh
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[#16A34A]">
                          &#8358;{meterCost.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
