export type MeterStatus = "NORMAL" | "WARNING" | "CRITICAL" | "STALE";

export interface EnergyTelemetryPayload {
  type: "sensor_data";
  meterId: string;
  timestamp: string;
  phaseA_N_voltage: number;
  phaseB_N_voltage: number;
  phaseC_N_voltage: number;
  phaseA_current: number;
  phaseB_current: number;
  phaseC_current: number;
  energyToday: number;
  frequency: number;
  powerFactor: number;
  reactivePower: number;
  harmonics: number;
  status: "NORMAL" | "WARNING" | "CRITICAL";
}

export interface MeterStatusMessage {
  type: "meter_status";
  meterId: string;
  status: MeterStatus;
  lastSeen: string | null;
}

export interface SparklinePoint {
  time: string;
  timestampMs: number;
  voltage: number;
  energyToday: number;
  phaseA_N_voltage?: number;
  phaseB_N_voltage?: number;
  phaseC_N_voltage?: number;
  phaseA_current?: number;
  phaseB_current?: number;
  phaseC_current?: number;
}

export interface MeterState {
  meterId: string;
  location: string;
  lastSeen: string | null;
  status: MeterStatus;
  reading: EnergyTelemetryPayload | null;
  history: SparklinePoint[];
}

export interface OverviewStats {
  criticalCount: number;
  criticalPct: number;
  liveCount: number;
  livePct: number;
  offlineCount: number;
  offlinePct: number;
  totalMeters: number;
}
