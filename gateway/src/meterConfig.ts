import { MeterBaselineConfig, SimulationConfig } from "./types.js";

/**
 * Baseline configurations for all energy meters.
 * Plug-and-play scalability: Adding a 6th meter is as simple as adding
 * one configuration object to this array — no code changes elsewhere.
 */
export const METERS: MeterBaselineConfig[] = [
  {
    id: "IKJ-IM-001",
    location: "Ikeja",
    nominalVoltageKV: 11.0,
    voltageToleranceKV: 0.15,
    nominalCurrentA: 210.0,
    currentToleranceA: 15.0,
    initialEnergyToday: 3377.0,
    nominalFrequencyHz: 50.0,
    frequencyToleranceHz: 0.05,
    nominalPowerFactor: 0.95,
    powerFactorTolerance: 0.02,
    nominalReactivePowerKVAR: 32.0,
    reactivePowerToleranceKVAR: 3.5,
    nominalHarmonicsTHD: 2.1,
    harmonicsToleranceTHD: 0.3,
  },
  {
    id: "IKJ-ANM-005",
    location: "Anifowose",
    nominalVoltageKV: 11.0,
    voltageToleranceKV: 0.14,
    nominalCurrentA: 145.0,
    currentToleranceA: 12.0,
    initialEnergyToday: 1842.0,
    nominalFrequencyHz: 50.0,
    frequencyToleranceHz: 0.05,
    nominalPowerFactor: 0.93,
    powerFactorTolerance: 0.02,
    nominalReactivePowerKVAR: 26.0,
    reactivePowerToleranceKVAR: 3.0,
    nominalHarmonicsTHD: 2.4,
    harmonicsToleranceTHD: 0.4,
  },
  {
    id: "IKJ-OM-002",
    location: "Oregun",
    nominalVoltageKV: 11.0,
    voltageToleranceKV: 0.16,
    nominalCurrentA: 185.0,
    currentToleranceA: 14.0,
    initialEnergyToday: 2410.0,
    nominalFrequencyHz: 50.0,
    frequencyToleranceHz: 0.05,
    nominalPowerFactor: 0.94,
    powerFactorTolerance: 0.02,
    nominalReactivePowerKVAR: 30.0,
    reactivePowerToleranceKVAR: 3.2,
    nominalHarmonicsTHD: 2.2,
    harmonicsToleranceTHD: 0.3,
  },
  {
    id: "IKJ-AM-003",
    location: "Alawa",
    nominalVoltageKV: 11.0,
    voltageToleranceKV: 0.12,
    nominalCurrentA: 95.0,
    currentToleranceA: 8.0,
    initialEnergyToday: 985.0,
    nominalFrequencyHz: 50.0,
    frequencyToleranceHz: 0.05,
    nominalPowerFactor: 0.92,
    powerFactorTolerance: 0.02,
    nominalReactivePowerKVAR: 18.0,
    reactivePowerToleranceKVAR: 2.5,
    nominalHarmonicsTHD: 2.6,
    harmonicsToleranceTHD: 0.4,
  },
  {
    id: "IKJ-AGM-004",
    location: "Agidingbi",
    nominalVoltageKV: 11.0,
    voltageToleranceKV: 0.13,
    nominalCurrentA: 75.0,
    currentToleranceA: 7.0,
    initialEnergyToday: 615.0,
    nominalFrequencyHz: 50.0,
    frequencyToleranceHz: 0.05,
    nominalPowerFactor: 0.96,
    powerFactorTolerance: 0.015,
    nominalReactivePowerKVAR: 12.0,
    reactivePowerToleranceKVAR: 2.0,
    nominalHarmonicsTHD: 1.9,
    harmonicsToleranceTHD: 0.3,
  },
];

export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  energyIncrementPerSec: 0.06, // Strict +0.06 kWh accumulation per second
  anomalyProbability: 0.035,   // 3.5% chance per tick (within 2-5% target)
  dropoutProbability: 0.02,    // 2% chance per tick (simulates packet drop/sensor silence)
};
