import {
  EnergyTelemetryPayload,
  MeterBaselineConfig,
  MeterStatus,
  SimulationConfig,
} from "./types.js";
import { DEFAULT_SIMULATION_CONFIG } from "./meterConfig.js";

/**
 * Generates small random variations around a baseline value.
 * e.g., fluctuate(11.0, 0.15, 2) -> 10.85 to 11.15
 */
export function fluctuate(base: number, range: number, decimals: number = 2): number {
  const delta = (Math.random() * 2 - 1) * range;
  const val = base + delta;
  return Number(val.toFixed(decimals));
}

export interface TickResult {
  payload: EnergyTelemetryPayload | null;
  isDropout: boolean;
  meterId: string;
}

export class EnergyMeterSimulator {
  private energyTodayMap: Map<string, number> = new Map();
  private config: SimulationConfig;

  constructor(
    meters: MeterBaselineConfig[],
    config: SimulationConfig = DEFAULT_SIMULATION_CONFIG
  ) {
    this.config = config;
    // Initialize cumulative energy from baseline
    for (const meter of meters) {
      this.energyTodayMap.set(meter.id, meter.initialEnergyToday);
    }
  }

  /**
   * Generates telemetry for a given meter for the current tick.
   */
  public generateReading(meter: MeterBaselineConfig): TickResult {
    // 1. Strict accumulation of energyToday (+0.06 kWh/sec)
    // Physical energy registers keep incrementing internally regardless of telemetry comms status
    const currentEnergy = this.energyTodayMap.get(meter.id) ?? meter.initialEnergyToday;
    const nextEnergy = Number((currentEnergy + this.config.energyIncrementPerSec).toFixed(3));
    this.energyTodayMap.set(meter.id, nextEnergy);

    // 2. Check for sensor dropout simulation (simulating comms silence/packet drop)
    if (Math.random() < this.config.dropoutProbability) {
      return {
        payload: null,
        isDropout: true,
        meterId: meter.id,
      };
    }

    // 3. Check for anomaly injection (2-5% chance per tick)
    const isAnomaly = Math.random() < this.config.anomalyProbability;
    let status: MeterStatus = "NORMAL";

    let vA = fluctuate(meter.nominalVoltageKV, meter.voltageToleranceKV, 3);
    let vB = fluctuate(meter.nominalVoltageKV, meter.voltageToleranceKV, 3);
    let vC = fluctuate(meter.nominalVoltageKV, meter.voltageToleranceKV, 3);

    let iA = fluctuate(meter.nominalCurrentA, meter.currentToleranceA, 1);
    let iB = fluctuate(meter.nominalCurrentA, meter.currentToleranceA, 1);
    let iC = fluctuate(meter.nominalCurrentA, meter.currentToleranceA, 1);

    let freq = fluctuate(meter.nominalFrequencyHz, meter.frequencyToleranceHz, 2);
    let pf = fluctuate(meter.nominalPowerFactor, meter.powerFactorTolerance, 2);
    let q = fluctuate(meter.nominalReactivePowerKVAR, meter.reactivePowerToleranceKVAR, 1);
    let thd = fluctuate(meter.nominalHarmonicsTHD, meter.harmonicsToleranceTHD, 1);

    if (isAnomaly) {
      // 60% WARNING, 40% CRITICAL
      const isCritical = Math.random() < 0.4;
      status = isCritical ? "CRITICAL" : "WARNING";

      const anomalyType = Math.floor(Math.random() * 5);
      switch (anomalyType) {
        case 0: // Voltage Sag or Swell
          if (isCritical) {
            // Severe drop (>15%) or spike
            vA = Number((vA * 0.82).toFixed(3));
            vB = Number((vB * 0.84).toFixed(3));
          } else {
            // Moderate sag (8-10%)
            vA = Number((vA * 0.91).toFixed(3));
          }
          break;

        case 1: // Overcurrent / Load surge
          if (isCritical) {
            iA = Number((meter.nominalCurrentA * 2.2).toFixed(1));
            iB = Number((meter.nominalCurrentA * 1.8).toFixed(1));
          } else {
            iB = Number((meter.nominalCurrentA * 1.45).toFixed(1));
          }
          break;

        case 2: // Harmonics spike (% THD)
          if (isCritical) {
            thd = fluctuate(9.5, 1.5, 1); // Severe harmonic distortion > 8%
          } else {
            thd = fluctuate(5.8, 0.8, 1); // Warning level THD 5 - 6.6%
          }
          break;

        case 3: // Poor Power Factor / High Reactive
          if (isCritical) {
            pf = fluctuate(0.62, 0.05, 2);
            q = Number((meter.nominalReactivePowerKVAR * 2.5).toFixed(1));
          } else {
            pf = fluctuate(0.78, 0.03, 2);
            q = Number((meter.nominalReactivePowerKVAR * 1.6).toFixed(1));
          }
          break;

        case 4: // Frequency instability
          if (isCritical) {
            freq = Math.random() > 0.5 ? 48.75 : 51.25;
          } else {
            freq = Math.random() > 0.5 ? 49.35 : 50.65;
          }
          break;
      }
    }

    // Ensure power factor remains in valid [0.0, 1.0] bound
    pf = Math.min(1.0, Math.max(0.1, pf));

    const payload: EnergyTelemetryPayload = {
      type: "sensor_data",
      meterId: meter.id,
      timestamp: new Date().toISOString(),
      phaseA_N_voltage: vA,
      phaseB_N_voltage: vB,
      phaseC_N_voltage: vC,
      phaseA_current: iA,
      phaseB_current: iB,
      phaseC_current: iC,
      energyToday: nextEnergy,
      frequency: freq,
      powerFactor: pf,
      reactivePower: q,
      harmonics: thd,
      status,
    };

    return {
      payload,
      isDropout: false,
      meterId: meter.id,
    };
  }

  /**
   * Helper to retrieve current accumulated energy (read-only)
   */
  public getAccumulatedEnergy(meterId: string): number | undefined {
    return this.energyTodayMap.get(meterId);
  }
}
