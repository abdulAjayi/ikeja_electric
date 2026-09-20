import { WebSocketServer, WebSocket } from "ws";
import { EnergyTelemetryPayload } from "../src/types.js";
import { METERS } from "../src/meterConfig.js";
import { EnergyMeterSimulator } from "../src/simulator.js";

async function runVerification() {
  console.log("==================================================");
  console.log("🧪 RUNNING MOCK GATEWAY VERIFICATION SUITE");
  console.log("==================================================\n");

  // 1. Verify Meter Topology & Baselines
  console.log("Test 1: Verifying Meter Topology & Scalability...");
  if (METERS.length !== 5) {
    throw new Error(`Expected 5 meters, found ${METERS.length}`);
  }
  const expectedMeters = [
    { id: "IKJ-IM-001", location: "Ikeja", baselineEnergy: 3377 },
    { id: "IKJ-ANM-005", location: "Anifowose", baselineEnergy: 1842 },
    { id: "IKJ-OM-002", location: "Oregun", baselineEnergy: 2410 },
    { id: "IKJ-AM-003", location: "Alawa", baselineEnergy: 985 },
    { id: "IKJ-AGM-004", location: "Agidingbi", baselineEnergy: 615 },
  ];
  for (const expected of expectedMeters) {
    const found = METERS.find((m) => m.id === expected.id);
    if (!found) throw new Error(`Meter ${expected.id} not found in METERS!`);
    if (found.location !== expected.location) {
      throw new Error(`Meter ${expected.id} location mismatch: expected ${expected.location}, got ${found.location}`);
    }
    if (found.initialEnergyToday !== expected.baselineEnergy) {
      throw new Error(`Meter ${expected.id} baseline energy mismatch: expected ${expected.baselineEnergy}, got ${found.initialEnergyToday}`);
    }
  }
  console.log("✅ All 5 meters configured with exact IDs, locations, and initial energy values.\n");

  // 2. Verify Simulator Accumulation, Drift, Anomaly & Dropout Logic
  console.log("Test 2: Verifying Energy Accumulator (+0.06 kWh/s strictly monotonic)...");
  const sim = new EnergyMeterSimulator(METERS, {
    energyIncrementPerSec: 0.06,
    anomalyProbability: 0.25, // higher probability for test detection
    dropoutProbability: 0.15, // higher probability for test detection
  });

  const meter = METERS[0]; // IKJ-IM-001
  let prevEnergy = meter.initialEnergyToday;
  let detectedAnomaly = false;
  let detectedDropout = false;

  let droppedTicks = 0;
  for (let i = 0; i < 30; i++) {
    const result = sim.generateReading(meter);
    if (result.isDropout) {
      detectedDropout = true;
      droppedTicks++;
      // Verify internal meter register incremented even while transmission is omitted
      const internalEnergy = sim.getAccumulatedEnergy(meter.id)!;
      const expectedInternal = Number((prevEnergy + (droppedTicks * 0.06)).toFixed(3));
      if (Math.abs(internalEnergy - expectedInternal) > 0.001) {
        throw new Error(`Internal energy failed to accumulate during dropout! expected ${expectedInternal}, got ${internalEnergy}`);
      }
      continue;
    }

    const p = result.payload!;
    // Monotonic strictly increasing check
    if (p.energyToday <= prevEnergy) {
      throw new Error(`energyToday decreased or stalled! prev: ${prevEnergy}, current: ${p.energyToday}`);
    }
    // Increment accounts for this tick + any dropped ticks during communication silence
    const expectedDiff = Number(((droppedTicks + 1) * 0.06).toFixed(3));
    const diff = Number((p.energyToday - prevEnergy).toFixed(3));
    if (Math.abs(diff - expectedDiff) > 0.001) {
      throw new Error(`energyToday increment mismatch: expected +${expectedDiff}, got +${diff}`);
    }
    prevEnergy = p.energyToday;
    droppedTicks = 0;

    // Check payload schema
    if (p.type !== "sensor_data") throw new Error(`Invalid type: ${p.type}`);
    if (typeof p.phaseA_N_voltage !== "number") throw new Error("phaseA_N_voltage not a number");
    if (typeof p.phaseB_N_voltage !== "number") throw new Error("phaseB_N_voltage not a number");
    if (typeof p.phaseC_N_voltage !== "number") throw new Error("phaseC_N_voltage not a number");
    if (typeof p.phaseA_current !== "number") throw new Error("phaseA_current not a number");
    if (typeof p.phaseB_current !== "number") throw new Error("phaseB_current not a number");
    if (typeof p.phaseC_current !== "number") throw new Error("phaseC_current not a number");
    if (typeof p.frequency !== "number") throw new Error("frequency not a number");
    if (typeof p.powerFactor !== "number" || p.powerFactor < 0 || p.powerFactor > 1) {
      throw new Error(`Invalid powerFactor: ${p.powerFactor}`);
    }
    if (typeof p.reactivePower !== "number") throw new Error("reactivePower not a number");
    if (typeof p.harmonics !== "number") throw new Error("harmonics not a number");
    if (!["NORMAL", "WARNING", "CRITICAL"].includes(p.status)) {
      throw new Error(`Invalid status: ${p.status}`);
    }

    if (p.status === "WARNING" || p.status === "CRITICAL") {
      detectedAnomaly = true;
    }
  }

  if (!detectedDropout) throw new Error("Dropout simulation was not triggered during trial runs");
  if (!detectedAnomaly) throw new Error("Anomaly injection was not triggered during trial runs");

  console.log("✅ Energy accumulation strictly verified (+0.06 kWh per reading, monotonic).");
  console.log("✅ Dropout omission and anomaly injection verified.\n");

  // 3. Live WebSocket Communication Test
  console.log("Test 3: Live WebSocket Server Transmission Test on port 3000...");
  const TEST_PORT = 3000;
  const wss = new WebSocketServer({ port: TEST_PORT });

  const receivedPayloads: EnergyTelemetryPayload[] = [];

  wss.on("connection", (ws: WebSocket) => {
    ws.on("message", (raw: WebSocket.Data) => {
      try {
        const data = JSON.parse(raw.toString()) as EnergyTelemetryPayload;
        receivedPayloads.push(data);
      } catch (err) {
        console.error("Error parsing message", err);
      }
    });
  });

  console.log(`Ephemeral WebSocket server listening on port ${TEST_PORT}.`);
  console.log("Connecting gateway client simulator...");

  // Spin up a live client to test socket communication
  const clientSocket = new WebSocket(`ws://localhost:${TEST_PORT}`);

  await new Promise<void>((resolve) => {
    clientSocket.on("open", () => {
      console.log("Client connected. Simulating ticks...");
      // Send 2 batch ticks
      const liveSim = new EnergyMeterSimulator(METERS);
      for (const m of METERS) {
        const r = liveSim.generateReading(m);
        if (r.payload) {
          clientSocket.send(JSON.stringify(r.payload));
        }
      }
      setTimeout(resolve, 500);
    });
  });

  clientSocket.close();
  wss.close();

  console.log(`Received ${receivedPayloads.length} payloads over WebSocket.`);
  if (receivedPayloads.length === 0) {
    throw new Error("No payloads received over WebSocket!");
  }

  console.log("Sample received payload:");
  console.log(JSON.stringify(receivedPayloads[0], null, 2));

  console.log("\n==================================================");
  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
  console.log("==================================================");
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
