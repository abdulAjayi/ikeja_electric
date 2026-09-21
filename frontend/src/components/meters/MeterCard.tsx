import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
  Tooltip,
} from "recharts";
import { ArrowRight, Clock } from "lucide-react";
import type { MeterState, MeterStatus } from "../../types/telemetry";

interface MeterCardProps {
  meter: MeterState;
}

const STATUS_CONFIG: Record<
  MeterStatus,
  { label: string; badgeClass: string; dotClass: string; strokeColor: string; fillColor: string }
> = {
  NORMAL: {
    label: "NORMAL",
    badgeClass: "bg-emerald-50 text-[#16A34A] border-emerald-200",
    dotClass: "bg-[#16A34A]",
    strokeColor: "#16A34A",
    fillColor: "#16A34A",
  },
  WARNING: {
    label: "WARNING",
    badgeClass: "bg-amber-50 text-[#CA8A04] border-amber-200",
    dotClass: "bg-[#CA8A04]",
    strokeColor: "#CA8A04",
    fillColor: "#CA8A04",
  },
  CRITICAL: {
    label: "CRITICAL",
    badgeClass: "bg-red-50 text-[#DC2626] border-red-200",
    dotClass: "bg-[#DC2626]",
    strokeColor: "#DC2626",
    fillColor: "#DC2626",
  },
  STALE: {
    label: "OFFLINE",
    badgeClass: "bg-gray-100 text-gray-500 border-gray-200",
    dotClass: "bg-gray-400",
    strokeColor: "#9CA3AF",
    fillColor: "#9CA3AF",
  },
};

export const MeterCard: React.FC<MeterCardProps> = ({ meter }) => {
  const navigate = useNavigate();
  const { meterId, location, status, reading, lastSeen, history } = meter;

  const currentStatus = status || "NORMAL";
  const config = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.NORMAL;

  const handleCardClick = () => {
    navigate(`/engineer/meters/${meterId}`);
  };

  // Format Energy Today
  const energyDisplay = reading?.energyToday !== undefined
    ? reading.energyToday.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : "--";

  // Smart voltage formatter (supports 11.0 kV distribution and 230V feeds)
  const formatVoltage = (v?: number) => {
    if (v === undefined || v === null) return "--";
    return v > 100 ? `${v.toFixed(1)} V` : `${v.toFixed(2)} kV`;
  };

  const phaseAVoltage = formatVoltage(reading?.phaseA_N_voltage);
  const phaseBVoltage = formatVoltage(reading?.phaseB_N_voltage);

  const phaseACurrent = reading?.phaseA_current !== undefined
    ? `${reading.phaseA_current.toFixed(1)} A`
    : "--";

  // Synced timestamp formatting
  const formattedSyncTime = lastSeen
    ? new Date(lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
    : "Waiting for signal";

  // Sparkline data preparation: filter to latest 10-second window
  const tenSecHistory = history.filter((pt) => pt.timestampMs >= Date.now() - 10_000);
  const chartData = tenSecHistory.length > 0
    ? tenSecHistory.map((pt) => ({
        time: pt.time,
        value: pt.voltage,
      }))
    : [
        { time: "0s", value: 230 },
        { time: "10s", value: 230 },
      ];

  // Calculate dynamic domain for sparkline to amplify small fluctuations cleanly
  const values = chartData.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const yDomain = [
    Math.floor(minVal - 1),
    Math.ceil(maxVal + 1),
  ];

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-150 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Top Header: ID + Location & Status Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-sm text-nearblack tracking-tight truncate">
              {meterId}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-xs font-medium text-grey truncate">
              {location}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border flex-shrink-0 ${config.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
            {config.label}
          </span>
        </div>

        {/* Hero Big Bold Number: Energy Today (kWh) */}
        <div className="mt-1 mb-4">
          <div className="text-xs font-medium text-grey mb-1">
            Energy Today
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-nearblack tracking-tight">
              {energyDisplay}
            </span>
            <span className="text-xs font-semibold text-grey">
              kWh
            </span>
          </div>
        </div>

        {/* Breakdown Rows (Reference pattern: 3 key metrics) */}
        <div className="space-y-2 py-3 border-y border-gray-100 text-xs">
          <div className="flex items-center justify-between text-grey">
            <span>Phase A-N Voltage</span>
            <span className="font-semibold text-nearblack font-mono">
              {phaseAVoltage}
            </span>
          </div>
          <div className="flex items-center justify-between text-grey">
            <span>Phase B-N Voltage</span>
            <span className="font-semibold text-nearblack font-mono">
              {phaseBVoltage}
            </span>
          </div>
          <div className="flex items-center justify-between text-grey">
            <span>Phase A Current</span>
            <span className="font-semibold text-nearblack font-mono">
              {phaseACurrent}
            </span>
          </div>
        </div>

        {/* Live Sparkline Chart (Last 10 seconds of Phase A-N Voltage) */}
        <div className="pt-3 pb-1">
          <div className="flex items-center justify-between text-[11px] text-grey mb-1">
            <span>Live Waveform (10s window)</span>
            <span className="font-mono text-[10px] text-charcoal/80">
              {formatVoltage(reading?.phaseA_N_voltage)}
            </span>
          </div>
          <div className="h-16 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gradient-${meterId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={config.strokeColor} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={config.strokeColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <YAxis domain={yDomain} hide />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-charcoal text-white text-[10px] px-2 py-1 rounded shadow-md font-mono">
                          {formatVoltage(Number(payload[0].value))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={config.strokeColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#gradient-${meterId})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Synced [time] on left, View meter → on right */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-grey">
          <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span>Synced {formattedSyncTime}</span>
        </div>

        <span
          className="inline-flex items-center gap-1 font-semibold text-[#B91C1C] group-hover:translate-x-0.5 transition-transform"
        >
          <span>View meter</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
