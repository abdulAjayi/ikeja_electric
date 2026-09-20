import dotenv from "dotenv";

dotenv.config();

export const CONFIG = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "default_jwt_secret_ikeja_2026",
  COST_PER_KWH: parseFloat(process.env.COST_PER_KWH || "210"),
  EMISSIONS_FACTOR_KG: parseFloat(process.env.EMISSIONS_FACTOR_KG || "0.43"),
  NODE_ENV: process.env.NODE_ENV || "development",
  MAX_PERSISTED_READINGS_PER_METER: 30,
  STALE_THRESHOLD_MS: 2500, // Threshold to flag a meter as STALE (~2.5 missed ticks)
  STALE_CHECK_INTERVAL_MS: 1000,
};
