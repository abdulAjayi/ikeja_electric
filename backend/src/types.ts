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

export interface ExecutiveSummaryMessage {
  type: "executive_summary";
  timestamp: string;
  totalEnergyKWh: number;
  totalCostNGN: number;
  currency: string;
  emissionsKgCO2: number;
  costPerKWhRate: number;
  emissionsFactor: number;
  activeMetersCount: number;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  name: string;
  role: "ENGINEER" | "EXECUTIVE";
}

export interface MeterLatestState {
  meterId: string;
  location: string;
  lastSeen: number | null;
  status: MeterStatus;
  reading: EnergyTelemetryPayload | null;
  persistedCount: number;
}
