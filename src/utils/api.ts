/**
 * Helper to get the correct API URL whether running in browser or Android Capacitor app.
 */
export function getApiUrl(endpoint: string): string {
  const isCapacitor = typeof window !== "undefined" && (window as any).Capacitor !== undefined;

  // If running in a standard web browser (PC laptop), always use relative /api endpoints
  if (!isCapacitor) {
    return endpoint;
  }

  // Running inside Capacitor mobile app: use configured server IP or default to Fabrice's PC IP
  const serverIp = localStorage.getItem("georges_server_ip") || "192.168.1.118";
  return `http://${serverIp}:3000${endpoint}`;
}
