import { Router, Request, Response } from "express";
import { AuthService } from "../services/authService.js";
import {
  authenticate,
  AuthenticatedRequest,
} from "../middleware/authMiddleware.js";

export const authRouter = Router();

// Register new user (ENGINEER or EXECUTIVE)
authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: "Email, password, and name are required" });
      return;
    }

    const validRoles = ["ENGINEER", "EXECUTIVE"];
    if (role && !validRoles.includes(role)) {
      res.status(400).json({
        error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      });
      return;
    }

    const result = await AuthService.register(email, password, name, role);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Login (returns JWT + user profile with role)
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

// Get current profile
authRouter.get(
  "/me",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    res.json({ user: req.user });
  }
);
