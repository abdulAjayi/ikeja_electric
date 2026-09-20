import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { URL } from "url";
import { TelemetryService } from "../services/telemetryService.js";
import { CONFIG } from "../config.js";
import { EnergyTelemetryPayload } from "../types.js";

export class WebSocketHandler {
  private wss: WebSocketServer;
  private gatewayClients = new Set<WebSocket>();
  private dashboardClients = new Set<WebSocket>();
  private staleCheckIntervalId: NodeJS.Timeout | null = null;

  constructor(wss: WebSocketServer) {
    this.wss = wss;
    this.init();
  }

  private init(): void {
    this.wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
      this.handleConnection(ws, req);
    });

    // Background stale detection ticker
    this.staleCheckIntervalId = setInterval(() => {
      this.runStaleCheck();
    }, CONFIG.STALE_CHECK_INTERVAL_MS);
  }

  private handleConnection(ws: WebSocket, req: IncomingMessage): void {
    const reqUrl = req.url || "/";
    const parsedUrl = new URL(reqUrl, `http://${req.headers.host || "localhost"}`);
    const clientType = parsedUrl.searchParams.get("type");

    if (clientType === "gateway") {
      this.registerGatewayClient(ws);
    } else {
      // Default to dashboard client (?type=dashboard or standard browser WS)
      this.registerDashboardClient(ws);
    }
  }

  private registerGatewayClient(ws: WebSocket): void {
    this.gatewayClients.add(ws);
    console.log(
      `[WS SERVER] 🔌 Mock Gateway connected. (Total Gateways: ${this.gatewayClients.size})`
    );

    ws.on("message", async (raw: WebSocket.Data) => {
      try {
        const messageStr = raw.toString();
        const payload = JSON.parse(messageStr) as EnergyTelemetryPayload;

        if (payload.type === "sensor_data" && payload.meterId) {
          // 1. LIVE PASSTHROUGH: Broadcast raw reading to all dashboards with zero DB delay
          this.broadcastToDashboards(messageStr);

          // 2. State update, capped DB persistence, and executive calculation
          const { executiveSummary, recoveredFromStale } =
            await TelemetryService.handleGatewayReading(payload);

          // If recovered from STALE state, broadcast recovery status
          if (recoveredFromStale) {
            console.log(
              `[WS SERVER] 🟢 Meter ${payload.meterId} recovered from STALE state.`
            );
            this.broadcastToDashboards(
              JSON.stringify({
                type: "meter_status",
                meterId: payload.meterId,
                status: payload.status,
                lastSeen: payload.timestamp,
              })
            );
          }

          // 3. Broadcast updated executive summary alongside sensor data
          this.broadcastToDashboards(JSON.stringify(executiveSummary));
        }
      } catch (err: any) {
        console.error("[WS SERVER] Error processing gateway message:", err.message);
      }
    });

    ws.on("close", (code, reason) => {
      this.gatewayClients.delete(ws);
      console.warn(
        `[WS SERVER] 🔌 Mock Gateway disconnected (code: ${code}, reason: "${reason.toString()}"). Active: ${this.gatewayClients.size}`
      );
    });

    ws.on("error", (err) => {
      console.error("[WS SERVER] Gateway socket error:", err.message);
      this.gatewayClients.delete(ws);
    });
  }

  private registerDashboardClient(ws: WebSocket): void {
    this.dashboardClients.add(ws);
    console.log(
      `[WS SERVER] 💻 Dashboard subscriber connected. (Total Dashboards: ${this.dashboardClients.size})`
    );

    // Immediately send current snapshot upon connection
    try {
      // Send executive snapshot
      const executiveSummary = TelemetryService.computeExecutiveMetrics();
      ws.send(JSON.stringify(executiveSummary));

      // Send latest reading for all active meters
      const snapshot = TelemetryService.getAllMetersLatest();
      for (const meter of snapshot) {
        if (meter.reading) {
          ws.send(JSON.stringify(meter.reading));
        }
        if (meter.status === "STALE") {
          ws.send(
            JSON.stringify({
              type: "meter_status",
              meterId: meter.meterId,
              status: "STALE",
              lastSeen: meter.lastSeen ? new Date(meter.lastSeen).toISOString() : null,
            })
          );
        }
      }
    } catch (err: any) {
      console.error("[WS SERVER] Error sending initial snapshot:", err.message);
    }

    ws.on("close", () => {
      this.dashboardClients.delete(ws);
      console.log(
        `[WS SERVER] 💻 Dashboard subscriber disconnected. Active: ${this.dashboardClients.size}`
      );
    });

    ws.on("error", (err) => {
      console.error("[WS SERVER] Dashboard socket error:", err.message);
      this.dashboardClients.delete(ws);
    });
  }

  /**
   * Evaluates if any meter has missed its expected ~2.5s window
   */
  private runStaleCheck(): void {
    const staleAlerts = TelemetryService.checkStaleMeters();
    for (const alert of staleAlerts) {
      this.broadcastToDashboards(JSON.stringify(alert));
    }
  }

  /**
   * Broadcast message to all active dashboard subscribers
   */
  public broadcastToDashboards(message: string): void {
    for (const client of this.dashboardClients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  public getStats() {
    return {
      gateways: this.gatewayClients.size,
      dashboards: this.dashboardClients.size,
    };
  }

  public shutdown(): void {
    if (this.staleCheckIntervalId) {
      clearInterval(this.staleCheckIntervalId);
      this.staleCheckIntervalId = null;
    }
  }
}
