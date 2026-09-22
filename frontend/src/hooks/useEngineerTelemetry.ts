import { useState, useEffect, useRef, useMemo } from "react";
import type {
  MeterState,
  EnergyTelemetryPayload,
  MeterStatusMessage,
  SparklinePoint,
  OverviewStats,
} from "../types/telemetry";

const INITIAL_METERS: Array<{ meterId: string; location: string }> = [
  { meterId: "IKJ-IM-001", location: "Ikeja" },
  { meterId: "IKJ-ANM-005", location: "Anifowose" },
  { meterId: "IKJ-OM-002", location: "Oregun" },
  { meterId: "IKJ-AM-003", location: "Alawa" },
  { meterId: "IKJ-AGM-004", location: "Agidingbi" },
];

const THIRTY_SECONDS_MS = 30_000;

export function useEngineerTelemetry() {
  const [metersMap, setMetersMap] = useState<Record<string, MeterState>>(() => {
    const map: Record<string, MeterState> = {};
    for (const m of INITIAL_METERS) {
      map[m.meterId] = {
        meterId: m.meterId,
        location: m.location,
        lastSeen: null,
        status: "NORMAL",
        reading: null,
        history: [],
      };
    }
    return map;
  });

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Initial REST snapshot to populate existing state
  useEffect(() => {
    let isMounted = true;
    async function fetchInitialMeters() {
      try {
        const res = await fetch("/api/meters");
        if (!res.ok) return;
        const data = await res.json();
        if (data && Array.isArray(data.meters) && isMounted) {
          setMetersMap((prev) => {
            const next = { ...prev };
            for (const item of data.meters) {
              const existing = next[item.meterId] || {
                meterId: item.meterId,
                location: item.location || "Facility Substation",
                lastSeen: null,
                status: "NORMAL",
                reading: null,
                history: [],
              };

              const now = Date.now();
              const history: SparklinePoint[] = [...existing.history];
              if (item.reading && item.reading.phaseA_N_voltage !== undefined) {
                history.push({
                  time: new Date().toLocaleTimeString([], { hour12: false }),
                  timestampMs: now,
                  voltage: item.reading.phaseA_N_voltage,
                  energyToday: item.reading.energyToday,
                  phaseA_N_voltage: item.reading.phaseA_N_voltage,
                  phaseB_N_voltage: item.reading.phaseB_N_voltage,
                  phaseC_N_voltage: item.reading.phaseC_N_voltage,
                  phaseA_current: item.reading.phaseA_current,
                  phaseB_current: item.reading.phaseB_current,
                  phaseC_current: item.reading.phaseC_current,
                  frequency: item.reading.frequency ?? 50.0,
                  powerFactor: item.reading.powerFactor ?? 0.95,
                  status: item.status || "NORMAL",
                });
              }

              next[item.meterId] = {
                ...existing,
                location: item.location || existing.location,
                lastSeen: item.lastSeen ? new Date(item.lastSeen).toISOString() : existing.lastSeen,
                status: item.status || existing.status,
                reading: item.reading || existing.reading,
                history: history.filter((p) => p.timestampMs >= now - THIRTY_SECONDS_MS),
              };
            }
            return next;
          });
        }
      } catch (err) {
        console.warn("[TELEMETRY] Failed to fetch initial meters snapshot:", err);
      }
    }

    fetchInitialMeters();
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
      // Connect via Vite proxy /ws (or direct to backend 3000 if accessed directly)
      const wsUrl = `${protocol}//${window.location.host}/ws?type=dashboard`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isStopped) return;
        setIsConnected(true);
        console.log("[WS TELEMETRY] Connected to dashboard live telemetry stream.");
      };

      ws.onmessage = (event) => {
        if (isStopped) return;
        try {
          const data = JSON.parse(event.data);
          const now = Date.now();
          const timeStr = new Date(now).toLocaleTimeString([], { hour12: false });
          setLastMessageTimestamp(new Date(now));

          // Handle incoming live reading
          if (data.type === "sensor_data" && data.meterId) {
            const payload = data as EnergyTelemetryPayload;
            setMetersMap((prev) => {
              const currentMeter = prev[payload.meterId] || {
                meterId: payload.meterId,
                location: "Facility",
                lastSeen: null,
                status: "NORMAL",
                reading: null,
                history: [],
              };

              // Rolling 30-second history buffer
              const updatedHistory: SparklinePoint[] = [
                ...currentMeter.history.filter((pt) => pt.timestampMs >= now - THIRTY_SECONDS_MS),
                {
                  time: timeStr,
                  timestampMs: now,
                  voltage: payload.phaseA_N_voltage,
                  energyToday: payload.energyToday,
                  phaseA_N_voltage: payload.phaseA_N_voltage,
                  phaseB_N_voltage: payload.phaseB_N_voltage,
                  phaseC_N_voltage: payload.phaseC_N_voltage,
                  phaseA_current: payload.phaseA_current,
                  phaseB_current: payload.phaseB_current,
                  phaseC_current: payload.phaseC_current,
                  frequency: payload.frequency,
                  powerFactor: payload.powerFactor,
                  status: payload.status,
                },
              ];

              return {
                ...prev,
                [payload.meterId]: {
                  ...currentMeter,
                  reading: payload,
                  status: payload.status,
                  lastSeen: payload.timestamp,
                  history: updatedHistory,
                },
              };
            });
          }

          // Handle meter status change (e.g. STALE alert or recovery)
          if (data.type === "meter_status" && data.meterId) {
            const statusMsg = data as MeterStatusMessage;
            setMetersMap((prev) => {
              const currentMeter = prev[statusMsg.meterId];
              if (!currentMeter) return prev;

              return {
                ...prev,
                [statusMsg.meterId]: {
                  ...currentMeter,
                  status: statusMsg.status,
                  lastSeen: statusMsg.lastSeen || currentMeter.lastSeen,
                },
              };
            });
          }
        } catch (err) {
          console.error("[WS TELEMETRY] Error parsing incoming message:", err);
        }
      };

      ws.onclose = () => {
        if (isStopped) return;
        setIsConnected(false);
        // Attempt reconnect in 2 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 2000);
      };

      ws.onerror = (err) => {
        console.warn("[WS TELEMETRY] WebSocket connection error:", err);
        ws.close();
      };
    }

    connectWebSocket();

    return () => {
      isStopped = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // 3. Keep 30-second history moving even when idle
  useEffect(() => {
    const pruneInterval = setInterval(() => {
      const cutoff = Date.now() - THIRTY_SECONDS_MS;
      setMetersMap((prev) => {
        let changed = false;
        const next: Record<string, MeterState> = {};
        for (const [id, meter] of Object.entries(prev)) {
          const filtered = meter.history.filter((pt) => pt.timestampMs >= cutoff);
          if (filtered.length !== meter.history.length) {
            changed = true;
          }
          next[id] = { ...meter, history: filtered };
        }
        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(pruneInterval);
  }, []);

  // 4. Sorted array of meters
  const metersList = useMemo(() => {
    return Object.values(metersMap).sort((a, b) => a.meterId.localeCompare(b.meterId));
  }, [metersMap]);

  // 5. Stat card aggregations (Critical, Live, Offline/Stale)
  const stats: OverviewStats = useMemo(() => {
    const total = metersList.length;
    if (total === 0) {
      return {
        criticalCount: 0,
        criticalPct: 0,
        liveCount: 0,
        livePct: 0,
        offlineCount: 0,
        offlinePct: 0,
        totalMeters: 0,
      };
    }

    let critical = 0;
    let live = 0;
    let offline = 0;

    for (const m of metersList) {
      if (m.status === "CRITICAL") {
        critical++;
      } else if (m.status === "STALE" || !m.reading) {
        offline++;
      } else {
        // NORMAL or WARNING with active reading
        live++;
      }
    }

    return {
      criticalCount: critical,
      criticalPct: Math.round((critical / total) * 100),
      liveCount: live,
      livePct: Math.round((live / total) * 100),
      offlineCount: offline,
      offlinePct: Math.round((offline / total) * 100),
      totalMeters: total,
    };
  }, [metersList]);

  return {
    meters: metersList,
    stats,
    isConnected,
    lastMessageTimestamp,
  };
}