import { useState, useEffect, useRef, useMemo } from "react";
import type { MeterState } from "../types/telemetry";

export interface ExecutiveSummaryState {
  totalEnergyKWh: number;
  totalCostNGN: number;
  currency: string;
  emissionsKgCO2: number;
  costPerKWhRate: number;
  emissionsFactor: number;
  activeMetersCount: number;
  timestamp: string;
}

export interface ExecutiveHistoryPoint {
  time: string;
  timestampMs: number;
  totalCostNGN: number;
  emissionsKgCO2: number;
  facilityLoadKW: number;
  totalEnergyKWh: number;
}

const THIRTY_MINUTES_MS = 30 * 60 * 1000;

export function useExecutiveTelemetry() {
  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummaryState>({
    totalEnergyKWh: 0,
    totalCostNGN: 0,
    currency: "NGN",
    emissionsKgCO2: 0,
    costPerKWhRate: 216.0,
    emissionsFactor: 0.43,
    activeMetersCount: 5,
    timestamp: new Date().toISOString(),
  });

  const [metersMap, setMetersMap] = useState<Record<string, MeterState>>({});
  const [historySeries, setHistorySeries] = useState<ExecutiveHistoryPoint[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [peakLoadKW, setPeakLoadKW] = useState<number>(0);
  const [peakLoadTime, setPeakLoadTime] = useState<string>("Waiting for feed");

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Initial REST fetch for Executive Summary & Meter Snapshot
  useEffect(() => {
    let isMounted = true;
    async function fetchInitialData() {
      try {
        const [execRes, metersRes] = await Promise.all([
          fetch("/api/executive/summary"),
          fetch("/api/meters"),
        ]);

        if (execRes.ok) {
          const execData = await execRes.json();
          if (execData && isMounted) {
            setExecutiveSummary((prev) => ({
              ...prev,
              ...execData,
            }));
          }
        }

        if (metersRes.ok) {
          const metersData = await metersRes.json();
          if (metersData && Array.isArray(metersData.meters) && isMounted) {
            const nextMap: Record<string, MeterState> = {};
            for (const item of metersData.meters) {
              nextMap[item.meterId] = {
                meterId: item.meterId,
                location: item.location || "Facility Substation",
                lastSeen: item.lastSeen ? new Date(item.lastSeen).toISOString() : null,
                status: item.status || "NORMAL",
                reading: item.reading || null,
                history: [],
              };
            }
            setMetersMap(nextMap);
          }
        }
      } catch (err) {
        console.warn("[EXECUTIVE TELEMETRY] Failed initial fetch:", err);
      }
    }

    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Real-time WebSocket connection
  useEffect(() => {
    let isStopped = false;

    function connectWebSocket() {
      if (isStopped) return;

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws?type=dashboard`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isStopped) return;
        setIsConnected(true);
        console.log("[WS EXECUTIVE] Connected to executive telemetry stream.");
      };

      ws.onmessage = (event) => {
        if (isStopped) return;
        try {
          const data = JSON.parse(event.data);
          const now = Date.now();
          const timeStr = new Date(now).toLocaleTimeString([], { hour12: false });

          // Handle Executive Summary Message
          if (data.type === "executive_summary") {
            setExecutiveSummary({
              totalEnergyKWh: data.totalEnergyKWh ?? 0,
              totalCostNGN: data.totalCostNGN ?? 0,
              currency: data.currency || "NGN",
              emissionsKgCO2: data.emissionsKgCO2 ?? 0,
              costPerKWhRate: data.costPerKWhRate ?? 216.0,
              emissionsFactor: data.emissionsFactor ?? 0.43,
              activeMetersCount: data.activeMetersCount ?? 5,
              timestamp: data.timestamp || new Date().toISOString(),
            });
          }

          // Handle Sensor Data Message
          if (data.type === "sensor_data" && data.meterId) {
            setMetersMap((prev) => {
              const current = prev[data.meterId] || {
                meterId: data.meterId,
                location: "Facility",
                lastSeen: null,
                status: "NORMAL",
                reading: null,
                history: [],
              };

              const updatedMap = {
                ...prev,
                [data.meterId]: {
                  ...current,
                  reading: data,
                  status: data.status,
                  lastSeen: data.timestamp,
                },
              };

              // Calculate total instantaneous facility load (kW) across all active meters
              let currentFacilityLoad = 0;
              let totalCostAcc = 0;
              let totalEmissionsAcc = 0;
              let totalEnergyAcc = 0;

              for (const m of Object.values(updatedMap) as MeterState[]) {
                if (m.reading) {
                  const currentA = m.reading.phaseA_current ?? 15;
                  currentFacilityLoad += Number((currentA * 14.4).toFixed(1));
                  totalEnergyAcc += m.reading.energyToday ?? 0;
                }
              }

              totalEnergyAcc = Number(totalEnergyAcc.toFixed(2));
              totalCostAcc = Number((totalEnergyAcc * 216.0).toFixed(2));
              totalEmissionsAcc = Number((totalEnergyAcc * 0.43).toFixed(2));

              // Record time-series point
              setHistorySeries((prevSeries) => {
                const filtered = prevSeries.filter((p) => p.timestampMs >= now - THIRTY_MINUTES_MS);
                return [
                  ...filtered,
                  {
                    time: timeStr,
                    timestampMs: now,
                    totalCostNGN: totalCostAcc,
                    emissionsKgCO2: totalEmissionsAcc,
                    facilityLoadKW: currentFacilityLoad,
                    totalEnergyKWh: totalEnergyAcc,
                  },
                ];
              });

              // Track peak load
              if (currentFacilityLoad > peakLoadKW) {
                setPeakLoadKW(currentFacilityLoad);
                setPeakLoadTime(timeStr);
              }

              return updatedMap;
            });
          }
        } catch (err) {
          console.error("[WS EXECUTIVE] Error parsing message:", err);
        }
      };

      ws.onclose = () => {
        if (isStopped) return;
        setIsConnected(false);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 2000);
      };

      ws.onerror = (err) => {
        console.warn("[WS EXECUTIVE] WebSocket error:", err);
        ws.close();
      };
    }

    connectWebSocket();

    return () => {
      isStopped = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [peakLoadKW]);

  const metersList = useMemo(() => {
    return Object.values(metersMap).sort((a, b) => a.meterId.localeCompare(b.meterId));
  }, [metersMap]);

  return {
    executiveSummary,
    meters: metersList,
    historySeries,
    isConnected,
    peakLoadKW,
    peakLoadTime,
  };
}
