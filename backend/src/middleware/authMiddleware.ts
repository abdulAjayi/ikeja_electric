import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService.js";
import { AuthTokenPayload } from "../types.js";

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authorization token required" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = AuthService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...roles: ("ENGINEER" | "EXECUTIVE")[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Requires one of roles: [${roles.join(", ")}]. Current role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
}
