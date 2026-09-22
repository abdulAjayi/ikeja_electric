import React, { useState } from "react";
import {
  BarChart3,
  Scale,
  Users,
  Zap,
} from "lucide-react";
import { useExecutiveTelemetry } from "../../hooks/useExecutiveTelemetry";

export const BenchmarkingPage: React.FC = () => {
  const { executiveSummary, meters, isConnected } = useExecutiveTelemetry();

  // Mock Production / Occupancy Variable (e.g., 450 facility occupants / production units)
  const [productionUnits] = useState<number>(450);

  // Overall facility efficiency ratio (kWh per unit)
  const totalEnergy = executiveSummary.totalEnergyKWh;
  const overallRatio = productionUnits > 0 ? (totalEnergy / productionUnits).toFixed(3) : "0.000";

  return (
    <div className="w-full space-y-6 pb-12 font-sans">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <BarChart3 className="w-5 h-5 text-nearblack" />
            <h1 className="text-xl sm:text-2xl font-bold text-nearblack tracking-tight">
              Benchmarking & Efficiency
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-grey">
            Facility-wide energy efficiency baselines normalized by operational variables
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200/80 px-3 py-1.5 rounded-lg shadow-2xs text-xs text-grey">
          <span className="font-semibold text-nearblack font-mono">
            Normalization Variable: {productionUnits} Units
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

      {/* Explanatory Framing Card */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#1E40AF]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-nearblack">
              Energy Intensity Baselining Methodology
            </h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#1E40AF] px-2 py-0.5 rounded border border-blue-200">
            ISO 50006 Concept
          </span>
        </div>

        <p className="text-xs text-grey leading-relaxed">
          Energy baselining automatically normalizes raw grid telemetry against key operational variables like facility occupancy or production volume. This calculates true energy performance indicators (EnPIs) such as <strong>kWh per unit</strong>, enabling accurate historical efficiency comparison.
        </p>
      </div>

      {/* Hero Stat Cards (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Facility Efficiency Ratio */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#16A34A]" />
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-grey mb-2 pl-2">
            <span>Energy Intensity Ratio</span>
            <BarChart3 className="w-4 h-4 text-grey" />
          </div>
          <div className="pl-2 my-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-nearblack font-mono tracking-tight">
              {overallRatio}
            </span>
            <span className="text-xs font-semibold text-grey">kWh / Unit</span>
          </div>
          <p className="pl-2 text-[11px] text-grey pt-2 border-t border-gray-100 mt-2">
            Facility Energy Performance Indicator (EnPI)
          </p>
        </div>

        {/* Card 2: Total Facility Consumption */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2563EB]" />
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-grey mb-2 pl-2">
            <span>Total Consumption</span>
            <Zap className="w-4 h-4 text-grey" />
          </div>
          <div className="pl-2 my-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-nearblack font-mono tracking-tight">
              {totalEnergy.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-grey">kWh</span>
          </div>
          <p className="pl-2 text-[11px] text-grey pt-2 border-t border-gray-100 mt-2">
            Aggregate meter consumption today
          </p>
        </div>

        {/* Card 3: Normalization Variable */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-charcoal" />
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-grey mb-2 pl-2">
            <span>Normalization Variable</span>
            <Users className="w-4 h-4 text-grey" />
          </div>
          <div className="pl-2 my-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-nearblack font-mono tracking-tight">
              {productionUnits}
            </span>
            <span className="text-xs font-semibold text-grey">Occupants / Units</span>
          </div>
          <p className="pl-2 text-[11px] text-grey pt-2 border-t border-gray-100 mt-2">
            Simulated operational baseline
          </p>
        </div>
      </div>

      {/* Per-Meter Energy Intensity Breakdown Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-nearblack">
            Normalized Energy Intensity Breakdown By Substation
          </h2>
          <span className="text-xs text-grey">
            Calculated per meter allocation
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
                  <th scope="col" className="py-3.5 px-4 text-right font-bold">Normalized Share</th>
                  <th scope="col" className="py-3.5 px-4 text-right font-bold">Intensity Ratio (kWh/Unit)</th>
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
                    const pctShare = totalEnergy > 0 ? (energyKWh / totalEnergy) * 100 : 0;
                    const meterRatio = productionUnits > 0 ? (energyKWh / productionUnits).toFixed(3) : "0.000";

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
                          {pctShare.toFixed(1)}%
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[#1E40AF]">
                          {meterRatio} kWh/unit
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
