import WebSocket from "ws";
import dotenv from "dotenv";
import { METERS, DEFAULT_SIMULATION_CONFIG } from "./meterConfig.js";
import { EnergyMeterSimulator } from "./simulator.js";

dotenv.config();

const WS_URL = process.env.GATEWAY_WS_URL || "ws://localhost:3000?type=gateway";
const RECONNECT_DELAY_MS = 3000;
const TICK_INTERVAL_MS = 1000;

class MockGateway {
  private ws: WebSocket | null = null;
  private tickIntervalId: NodeJS.Timeout | null = null;
  private reconnectTimeoutId: NodeJS.Timeout | null = null;
  private isTerminating: boolean = false;
  private simulator: EnergyMeterSimulator;

  constructor() {
    this.simulator = new EnergyMeterSimulator(METERS, DEFAULT_SIMULATION_CONFIG);
  }

  public start(): void {
    console.log("=================================================");
    console.log("⚡ IKEJA INDUSTRIAL MOCK GATEWAY (ENERGY METERS) ⚡");
    console.log("=================================================");
    console.log(`Backend Target URL: ${WS_URL}`);
    console.log(`Configured Meters : ${METERS.length}`);
    for (const m of METERS) {
      console.log(`  - [${m.id}] ${m.location} (Baseline Energy: ${m.initialEnergyToday} kWh)`);
    }
    console.log(`Sampling Frequency: Every ${TICK_INTERVAL_MS / 1000}s`);
    console.log(`Energy Accumulator: +${DEFAULT_SIMULATION_CONFIG.energyIncrementPerSec} kWh/s`);
    console.log("=================================================\n");

    this.connect();
  }

  private connect(): void {
    if (this.isTerminating) return;

    // Safety: ensure any pending reconnect timer or old interval is cleared
    this.clearAllTimers();

    console.log(`[${new Date().toISOString()}] Connecting to backend at ${WS_URL}...`);
    this.ws = new WebSocket(WS_URL);

    this.ws.on("open", () => {
      console.log(`[${new Date().toISOString()}] ✅ Connected to backend WebSocket.`);
      this.startTelemetryLoop();
    });

    this.ws.on("message", (data: WebSocket.Data) => {
      // Reserved for backend handshake, commands or sync packets if needed
      console.log(`[${new Date().toISOString()}] Received downstream message: ${data.toString()}`);
    });

    this.ws.on("close", (code: number, reason: Buffer) => {
      console.warn(
        `[${new Date().toISOString()}] ⚠️ WebSocket closed (code: ${code}, reason: "${reason.toString()}").`
      );
      this.cleanupAndScheduleReconnect();
    });

    this.ws.on("error", (err: Error) => {
      console.error(`[${new Date().toISOString()}] ❌ WebSocket error: ${err.message}`);
      // 'close' event will trigger reconnect, but ensure socket is closed if needed
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
    });
  }

  private startTelemetryLoop(): void {
    // Clear any previous interval to prevent stacking
    if (this.tickIntervalId) {
      clearInterval(this.tickIntervalId);
      this.tickIntervalId = null;
    }

    this.tickIntervalId = setInterval(() => {
      this.sendTick();
    }, TICK_INTERVAL_MS);
  }

  private sendTick(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    for (const meter of METERS) {
      const result = this.simulator.generateReading(meter);

      if (result.isDropout) {
        console.warn(
          `[${new Date().toISOString()}] 🔇 [DROPOUT SIMULATED] Meter ${meter.id} (${meter.location}): packet omitted.`
        );
        continue; // Omit reading for this tick
      }

      if (result.payload) {
        try {
          const payloadStr = JSON.stringify(result.payload);
          this.ws.send(payloadStr);

          // Status-colored tag indicator for console readability
          const statusTag =
            result.payload.status === "NORMAL"
              ? "🟢 NORMAL"
              : result.payload.status === "WARNING"
              ? "🟡 WARNING"
              : "🔴 CRITICAL";

          console.log(
            `[${result.payload.timestamp}] 📡 Meter ${meter.id.padEnd(11)} | ` +
            `Loc: ${meter.location.padEnd(10)} | ` +
            `${statusTag.padEnd(11)} | ` +
            `V_A: ${result.payload.phaseA_N_voltage.toFixed(2)}kV | ` +
            `I_A: ${result.payload.phaseA_current.toFixed(1).padStart(5)}A | ` +
            `PF: ${result.payload.powerFactor.toFixed(2)} | ` +
            `THD: ${result.payload.harmonics.toFixed(1)}% | ` +
            `Energy: ${result.payload.energyToday.toFixed(2)} kWh`
          );
        } catch (err) {
          console.error(
            `[${new Date().toISOString()}] Failed to serialize/send payload for ${meter.id}:`,
            err
          );
        }
      }
    }
  }

  private cleanupAndScheduleReconnect(): void {
    this.clearAllTimers();

    if (this.isTerminating) return;

    console.log(
      `[${new Date().toISOString()}] 🔄 Reconnecting in ${RECONNECT_DELAY_MS / 1000}s...`
    );
    this.reconnectTimeoutId = setTimeout(() => {
      this.connect();
    }, RECONNECT_DELAY_MS);
  }

  private clearAllTimers(): void {
    if (this.tickIntervalId) {
      clearInterval(this.tickIntervalId);
      this.tickIntervalId = null;
    }
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
  }

  public shutdown(): void {
    console.log(`\n[${new Date().toISOString()}] 🛑 Shutting down Mock Gateway gracefully...`);
    this.isTerminating = true;
    this.clearAllTimers();

    if (this.ws) {
      try {
        this.ws.removeAllListeners();
        this.ws.close();
      } catch (err) {
        // ignore on exit
      }
      this.ws = null;
    }

    console.log(`[${new Date().toISOString()}] Gateway shutdown complete.`);
    process.exit(0);
  }
}

// Instantiate and start
const gateway = new MockGateway();
gateway.start();

// Handle graceful termination
process.on("SIGINT", () => gateway.shutdown());
process.on("SIGTERM", () => gateway.shutdown());
