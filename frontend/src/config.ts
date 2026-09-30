/**
 * Global API and WebSocket Configuration
 * 
 * Supports both:
 * 1. Local development via Vite dev proxy (empty base URL)
 * 2. Production deployments via environment variables (VITE_BACKEND_URL / VITE_WS_URL)
 */

const getBackendUrl = (): string => {
  const url = import.meta.env.VITE_BACKEND_URL || "";
  return url.replace(/\/$/, "");
};

export const API_BASE_URL = getBackendUrl();

export const getWebSocketUrl = (endpoint: string = "/ws?type=dashboard"): string => {
  if (import.meta.env.VITE_WS_URL) {
    const wsBase = import.meta.env.VITE_WS_URL.replace(/\/$/, "");
    return `${wsBase}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  }

  const backendUrl = getBackendUrl();
  if (backendUrl) {
    const wsProtocol = backendUrl.startsWith("https") ? "wss:" : "ws:";
    const host = backendUrl.replace(/^https?:\/\//, "");
    return `${wsProtocol}//${host}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  }

  // Fallback to current browser location (works with Vite proxy or unified domain)
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
};
