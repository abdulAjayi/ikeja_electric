import { Router, Request, Response } from "express";
import { TelemetryService } from "../services/telemetryService.js";

export const executiveRouter = Router();

// GET /api/executive/summary - computed cost, emissions, and energy
executiveRouter.get("/summary", (_req: Request, res: Response) => {
  try {
    const summary = TelemetryService.computeExecutiveMetrics();
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
