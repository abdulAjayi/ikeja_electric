import process from "node:process";
import WebSocket from "ws";
import { CONFIG } from "../src/config.js";

const BASE_URL = `http://localhost:${CONFIG.PORT}`;
const WS_URL = `ws://localhost:${CONFIG.PORT}`;

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

export async function runVerification() {
  console.log("=================================================");
  console.log("🧪 RUNNING BACKEND INTEGRATION & VERIFICATION TEST");
  console.log("=================================================\n");

  // 1. Health check
  console.log("Test 1: GET /api/health...");
  const health = await request("/api/health");
  if (!health.ok || health.data.status !== "healthy") {
    throw new Error(`Health check failed: ${JSON.stringify(health)}`);
  }
  console.log("✅ Health check passed.\n");

  // 2. Auth & Roles
  console.log("Test 2: Role-based Auth (Engineer & Executive)...");

  // Test Engineer Login
  const engineerLogin = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "engineer@ikeja.io",
      password: "Engineer123!",
    }),
  });
  if (!engineerLogin.ok || engineerLogin.data.user.role !== "ENGINEER") {
    throw new Error(`Engineer login failed: ${JSON.stringify(engineerLogin)}`);
  }
  console.log("✅ Engineer login successful (Role: ENGINEER).");

  // Test Executive Login
  const execLogin = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "exec@ikeja.io",
      password: "Exec123!",
    }),
  });
  if (!execLogin.ok || execLogin.data.user.role !== "EXECUTIVE") {
    throw new Error(`Executive login failed: ${JSON.stringify(execLogin)}`);
  }
  console.log("✅ Executive login successful (Role: EXECUTIVE).");

  // Test that registering as ADMIN is blocked
  const adminRegister = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email: "intruder@ikeja.io",
      password: "Password123!",
      name: "Intruder",
      role: "ADMIN",
    }),
  });
  if (adminRegister.status !== 400) {
    throw new Error("ADMIN registration should have been rejected with 400!");
  }
  console.log("✅ Attempting to register as ADMIN correctly rejected (Role restricted to ENGINEER / EXECUTIVE).\n");

  // 3. REST Endpoints
  console.log("Test 3: REST Endpoints (/api/meters, /api/executive/summary)...");
  const metersRes = await request("/api/meters");
  if (!metersRes.ok || metersRes.data.count !== 5) {
    throw new Error(`Expected 5 meters, got: ${JSON.stringify(metersRes)}`);
  }
  console.log(`✅ GET /api/meters returned ${metersRes.data.count} configured meters.`);

  const execSummary = await request("/api/executive/summary");
  if (!execSummary.ok || execSummary.data.currency !== "NGN") {
    throw new Error(`Executive summary failed: ${JSON.stringify(execSummary)}`);
  }
  console.log(`✅ GET /api/executive/summary returned NGN calculations (Rate: ₦${execSummary.data.costPerKWhRate}/kWh).\n`);

  // 4. WebSocket Multiplexing & Live Passthrough
  console.log("Test 4: Dual WebSocket Multiplexing & Live Passthrough...");

  const dashboardWs = new WebSocket(`${WS_URL}?type=dashboard`);
  const receivedMessages: any[] = [];

  await new Promise<void>((resolve, reject) => {
    dashboardWs.on("open", () => {
      console.log("Dashboard WebSocket connected.");
      resolve();
    });
    dashboardWs.on("error", reject);
  });

  dashboardWs.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      receivedMessages.push(msg);
    } catch (e) {}
  });

  const gatewayWs = new WebSocket(`${WS_URL}?type=gateway`);
  await new Promise<void>((resolve, reject) => {
    gatewayWs.on("open", () => {
      console.log("Mock Gateway WebSocket connected.");
      resolve();
    });
    gatewayWs.on("error", reject);
  });

  // Emit test reading for IKJ-IM-001
  const testReading = {
    type: "sensor_data",
    meterId: "IKJ-IM-001",
    timestamp: new Date().toISOString(),
    phaseA_N_voltage: 11.05,
    phaseB_N_voltage: 11.02,
    phaseC_N_voltage: 10.98,
    phaseA_current: 210.5,
    phaseB_current: 205.2,
    phaseC_current: 208.1,
    energyToday: 3377.06,
    frequency: 50.0,
    powerFactor: 0.95,
    reactivePower: 32.0,
    harmonics: 2.1,
    status: "NORMAL",
  };

  gatewayWs.send(JSON.stringify(testReading));

  // Wait 300ms for passthrough
  await new Promise((r) => setTimeout(r, 300));

  const passthroughFound = receivedMessages.some(
    (m) => m.type === "sensor_data" && m.meterId === "IKJ-IM-001"
  );
  if (!passthroughFound) {
    throw new Error("Live passthrough failed: dashboard did not receive sensor_data reading!");
  }
  console.log("✅ Live passthrough verified: Dashboard received sensor_data reading immediately.");

  const execUpdateFound = receivedMessages.some(
    (m) => m.type === "executive_summary"
  );
  if (!execUpdateFound) {
    throw new Error("Executive metrics broadcast update not received on dashboard!");
  }
  console.log("✅ Executive summary broadcast verified.\n");

  // 5. Verify 30-Reading Persistence Cap
  console.log("Test 5: Verifying 30-Reading Persistence Cap in Database...");
  for (let i = 2; i <= 35; i++) {
    const r = {
      ...testReading,
      timestamp: new Date(Date.now() + i * 1000).toISOString(),
      energyToday: Number((3377.06 + i * 0.06).toFixed(2)),
    };
    gatewayWs.send(JSON.stringify(r));
    await new Promise((r) => setTimeout(r, 40));
  }

  // Poll for async DB writes to settle
  let finalCount = 0;
  for (let wait = 0; wait < 20; wait++) {
    await new Promise((r) => setTimeout(r, 250));
    const h = await request("/api/meters/IKJ-IM-001/history");
    if (h.ok) {
      finalCount = h.data.count;
      if (finalCount >= 30) break;
    }
  }

  console.log(`DB History count for IKJ-IM-001: ${finalCount} readings.`);
  if (finalCount !== 30) {
    throw new Error(`Expected exactly 30 persisted readings, got ${finalCount}`);
  }
  console.log("✅ Database persistence cap strictly maintained at exactly 30 readings (extra readings discarded).\n");

  // 6. Verify Stale Detection
  console.log("Test 6: Verifying Real-Time Stale Detection (~2.5s timeout)...");
  console.log("Pausing gateway transmissions and waiting 3 seconds for stale ticker...");
  await new Promise((r) => setTimeout(r, 3200));

  const staleMessage = receivedMessages.find(
    (m) => m.type === "meter_status" && m.meterId === "IKJ-IM-001" && m.status === "STALE"
  );
  if (!staleMessage) {
    throw new Error("Stale detection failed: Dashboard did not receive STALE alert after 3s silence!");
  }
  console.log("✅ Stale detection verified: Dashboard received STALE status alert.");

  // Test recovery: send another reading
  console.log("Sending recovery reading...");
  gatewayWs.send(
    JSON.stringify({
      ...testReading,
      timestamp: new Date().toISOString(),
      energyToday: 3380.0,
      status: "NORMAL",
    })
  );

  await new Promise((r) => setTimeout(r, 300));
  const recoveredMessage = receivedMessages.find(
    (m) => m.type === "meter_status" && m.meterId === "IKJ-IM-001" && m.status === "NORMAL"
  );
  if (!recoveredMessage) {
    throw new Error("Recovery status alert not received!");
  }
  console.log("✅ Recovery verified: Dashboard received recovery status.\n");

  dashboardWs.close();
  gatewayWs.close();

  console.log("=================================================");
  console.log("🎉 ALL BACKEND VERIFICATION TESTS PASSED!");
  console.log("=================================================");
}

if (process.argv[1].endsWith("verify-backend.ts")) {
  runVerification()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Verification failed:", err);
      process.exit(1);
    });
}
