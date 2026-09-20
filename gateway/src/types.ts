export type MeterStatus = "NORMAL" | "WARNING" | "CRITICAL";

export interface EnergyTelemetryPayload {
  type: "sensor_data";
  meterId: string;
  timestamp: string;
  phaseA_N_voltage: number; // in kV
  phaseB_N_voltage: number; // in kV
  phaseC_N_voltage: number; // in kV
  phaseA_current: number;   // in A
  phaseB_current: number;   // in A
  phaseC_current: number;   // in A
  energyToday: number;       // in kWh, strictly cumulative (+0.06/s)
  frequency: number;         // in Hz
  powerFactor: number;       // dimensionless (0.0 - 1.0)
  reactivePower: number;     // in kVAR
  harmonics: number;         // in % THD
  status: MeterStatus;
}

export interface MeterBaselineConfig {
  id: string;
  location: string;
  nominalVoltageKV: number;
  voltageToleranceKV: number;
  nominalCurrentA: number;
  currentToleranceA: number;
  initialEnergyToday: number;
  nominalFrequencyHz: number;
  frequencyToleranceHz: number;
  nominalPowerFactor: number;
  powerFactorTolerance: number;
  nominalReactivePowerKVAR: number;
  reactivePowerToleranceKVAR: number;
  nominalHarmonicsTHD: number;
  harmonicsToleranceTHD: number;
}

export interface SimulationConfig {
  energyIncrementPerSec: number;
  anomalyProbability: number;
  dropoutProbability: number;
}
