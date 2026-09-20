import { prisma } from "../db.js";
import { CONFIG } from "../config.js";
import {
  EnergyTelemetryPayload,
  ExecutiveSummaryMessage,
  MeterLatestState,
  MeterStatus,
  MeterStatusMessage,
} from "../types.js";

interface KnownMeter {
  id: string;
  location: string;
}

export const KNOWN_METERS: KnownMeter[] = [
  { id: "IKJ-IM-001", location: "Ikeja" },
  { id: "IKJ-ANM-005", location: "Anifowose" },
  { id: "IKJ-OM-002", location: "Oregun" },
  { id: "IKJ-AM-003", location: "Alawa" },
  { id: "IKJ-AGM-004", location: "Agidingbi" },
];

export class TelemetryService {
  private static latestReadings = new Map<string, EnergyTelemetryPayload>();
  private static lastSeenTimestamps = new Map<string, number>();
  private static meterStatuses = new Map<string, MeterStatus>();
  private static persistedCounts = new Map<string, number>();
  private static verifiedMeters = new Set<string>(KNOWN_METERS.map((m) => m.id));

  /**
   * Process an incoming telemetry reading from the Mock Gateway.
   * Executed on the hot WebSocket path: keeps DB writes asynchronous and capped at 30.
   */
  public static async handleGatewayReading(
    payload: EnergyTelemetryPayload
  ): Promise<{
    executiveSummary: ExecutiveSummaryMessage;
    recoveredFromStale: boolean;
  }> {
    const { meterId } = payload;
    const now = Date.now();

    const wasStale = this.meterStatuses.get(meterId) === "STALE";

    // Update in-memory real-time state
    this.lastSeenTimestamps.set(meterId, now);
    this.latestReadings.set(meterId, payload);
    this.meterStatuses.set(meterId, payload.status);

    // Bounded DB Persistence: exactly first 30 readings per meter
    const currentCount = this.persistedCounts.get(meterId) || 0;
    if (currentCount < CONFIG.MAX_PERSISTED_READINGS_PER_METER) {
      const nextCount = currentCount + 1;
      this.persistedCounts.set(meterId, nextCount);

      // Asynchronous non-blocking database write
      this.persistReadingAsync(payload, nextCount).catch((err) => {
        console.error(
          `[TELEMETRY] ❌ Failed to persist reading for ${meterId} (entry #${nextCount}):`,
          err.message
        );
      });

      if (nextCount === CONFIG.MAX_PERSISTED_READINGS_PER_METER) {
        console.log(
          `[TELEMETRY] 💾 Meter ${meterId} reached 30-reading persistence cap. Halting future DB writes for this session.`
        );
      }
    }

    const executiveSummary = this.computeExecutiveMetrics();

    return {
      executiveSummary,
      recoveredFromStale: wasStale,
    };
  }

  /**
   * Evaluates all known meters for communication dropouts / silence.
   * If a meter has not emitted within STALE_THRESHOLD_MS (~2.5s), flags as STALE.
   */
  public static checkStaleMeters(): MeterStatusMessage[] {
    const now = Date.now();
    const staleAlerts: MeterStatusMessage[] = [];

    for (const meter of KNOWN_METERS) {
      const lastSeen = this.lastSeenTimestamps.get(meter.id);
      const currentStatus = this.meterStatuses.get(meter.id);

      // Only check meters that have communicated at least once
      if (lastSeen !== undefined) {
        const elapsed = now - lastSeen;
        if (elapsed > CONFIG.STALE_THRESHOLD_MS && currentStatus !== "STALE") {
          this.meterStatuses.set(meter.id, "STALE");

          console.warn(
            `[TELEMETRY] ⚠️ [COMMS LOSS] Meter ${meter.id} (${meter.location}) flagged as STALE. Elapsed: ${elapsed}ms`
          );

          staleAlerts.push({
            type: "meter_status",
            meterId: meter.id,
            status: "STALE",
            lastSeen: new Date(lastSeen).toISOString(),
          });
        }
      }
    }

    return staleAlerts;
  }

  /**
   * Derived executive calculation:
   * Cost = Total kWh * Rate
   * Emissions = Total kWh * Emissions Factor
   */
  public static computeExecutiveMetrics(): ExecutiveSummaryMessage {
    let totalEnergyKWh = 0;
    let activeMetersCount = 0;

    for (const meter of KNOWN_METERS) {
      const reading = this.latestReadings.get(meter.id);
      if (reading) {
        totalEnergyKWh += reading.energyToday;
        activeMetersCount++;
      }
    }

    totalEnergyKWh = Number(totalEnergyKWh.toFixed(2));
    const totalCostNGN = Number((totalEnergyKWh * CONFIG.COST_PER_KWH).toFixed(2));
    const emissionsKgCO2 = Number(
      (totalEnergyKWh * CONFIG.EMISSIONS_FACTOR_KG).toFixed(2)
    );

    return {
      type: "executive_summary",
      timestamp: new Date().toISOString(),
      totalEnergyKWh,
      totalCostNGN,
      currency: "NGN",
      emissionsKgCO2,
      costPerKWhRate: CONFIG.COST_PER_KWH,
      emissionsFactor: CONFIG.EMISSIONS_FACTOR_KG,
      activeMetersCount,
    };
  }

  /**
   * Fetch latest snapshot of all meters with current status and reading
   */
  public static getAllMetersLatest(): MeterLatestState[] {
    return KNOWN_METERS.map((meter) => {
      const reading = this.latestReadings.get(meter.id) || null;
      const lastSeen = this.lastSeenTimestamps.get(meter.id) || null;
      const status = this.meterStatuses.get(meter.id) || "NORMAL";
      const persistedCount = this.persistedCounts.get(meter.id) || 0;

      return {
        meterId: meter.id,
        location: meter.location,
        lastSeen,
        status,
        reading,
        persistedCount,
      };
    });
  }

  /**
   * Fetch the up-to-30 saved database readings for a specific meter
   */
  public static async getMeterHistory(meterId: string) {
    return prisma.telemetryReading.findMany({
      where: { meterId },
      orderBy: { timestamp: "desc" },
      take: CONFIG.MAX_PERSISTED_READINGS_PER_METER,
    });
  }

  /**
   * Asynchronous database insert
   */
  private static async persistReadingAsync(
    payload: EnergyTelemetryPayload,
    entryNumber: number
  ): Promise<void> {
    // Upsert meter record once if unverified
    if (!this.verifiedMeters.has(payload.meterId)) {
      await prisma.meter.upsert({
        where: { id: payload.meterId },
        update: {},
        create: {
          id: payload.meterId,
          location:
            KNOWN_METERS.find((m) => m.id === payload.meterId)?.location || "Unknown",
        },
      });
      this.verifiedMeters.add(payload.meterId);
    }

    await prisma.telemetryReading.create({
      data: {
        meterId: payload.meterId,
        timestamp: new Date(payload.timestamp),
        phaseA_N_voltage: payload.phaseA_N_voltage,
        phaseB_N_voltage: payload.phaseB_N_voltage,
        phaseC_N_voltage: payload.phaseC_N_voltage,
        phaseA_current: payload.phaseA_current,
        phaseB_current: payload.phaseB_current,
        phaseC_current: payload.phaseC_current,
        energyToday: payload.energyToday,
        frequency: payload.frequency,
        powerFactor: payload.powerFactor,
        reactivePower: payload.reactivePower,
        harmonics: payload.harmonics,
        status: payload.status,
      },
    });

    console.log(
      `[TELEMETRY] 💾 Persisted reading #${entryNumber}/30 for ${payload.meterId}`
    );
  }
}
