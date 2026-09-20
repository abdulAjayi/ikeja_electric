import express from "express";
import http from "http";
import cors from "cors";
import { WebSocketServer } from "ws";
import { CONFIG } from "./config.js";
import { authRouter } from "./routes/authRoutes.js";
import { meterRouter } from "./routes/meterRoutes.js";
import { executiveRouter } from "./routes/executiveRoutes.js";
import { WebSocketHandler } from "./websocket/wsHandler.js";
import { prisma } from "./db.js";

const app = express();
const server = http.createServer(app);

// Global Middleware
app.use(cors());
app.use(express.json());

// Request logging in dev
app.use((req, _res, next) => {
  if (CONFIG.NODE_ENV === "development") {
    console.log(`[HTTP] ${req.method} ${req.url}`);
  }
  next();
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// REST API Routes
app.use("/api/auth", authRouter);
app.use("/api/meters", meterRouter);
app.use("/api/executive", executiveRouter);

// WebSocket Multiplexer
const wss = new WebSocketServer({ server });
const wsHandler = new WebSocketHandler(wss);

// Server startup
server.listen(CONFIG.PORT, () => {
  console.log("=================================================");
  console.log("⚡ IKEJA INDUSTRIAL ENERGY MONITORING BACKEND ⚡");
  console.log("=================================================");
  console.log(`HTTP Server listening on: http://localhost:${CONFIG.PORT}`);
  console.log(`WebSocket Server on      : ws://localhost:${CONFIG.PORT}`);
  console.log(`Gateway Ingest endpoint  : ws://localhost:${CONFIG.PORT}?type=gateway`);
  console.log(`Dashboard Sub endpoint   : ws://localhost:${CONFIG.PORT}?type=dashboard`);
  console.log(`Rate Configuration       : ₦${CONFIG.COST_PER_KWH}/kWh | ${CONFIG.EMISSIONS_FACTOR_KG} kg CO2/kWh`);
  console.log(`Persistence Limit        : First ${CONFIG.MAX_PERSISTED_READINGS_PER_METER} readings per meter`);
  console.log("=================================================\n");
});

// Graceful Shutdown
const shutdown = async () => {
  console.log("\n[SERVER] 🛑 Gracefully shutting down backend...");
  wsHandler.shutdown();

  wss.close(() => {
    console.log("[SERVER] WebSocket server closed.");
  });

  server.close(async () => {
    console.log("[SERVER] HTTP server closed.");
    await prisma.$disconnect();
    console.log("[SERVER] Database connection disconnected.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
