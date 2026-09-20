import { Router, Request, Response } from "express";
import { TelemetryService } from "../services/telemetryService.js";

export const meterRouter = Router();

// GET /api/meters - list of all meters with latest reading + real-time status
meterRouter.get("/", (_req: Request, res: Response) => {
  try {
    const meters = TelemetryService.getAllMetersLatest();
    res.json({
      meters,
      count: meters.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/meters/:id/history - up to 30 saved DB readings for a specific meter
meterRouter.get("/:id/history", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const history = await TelemetryService.getMeterHistory(id);

    res.json({
      meterId: id,
      count: history.length,
      readings: history,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
