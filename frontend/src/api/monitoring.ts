import { fetchWithAuth } from "./client";

export type TimeSeriesPoint = {
  time: string;
  cpu: number;
  memory: number;
  latency: number;
};

export type SystemHealthResponse = {
  status: string;
  uptime: string;
  cpu_usage: number;
  memory_usage: number;
  api_latency_ms: number;
  prediction_volume: number;
  history: TimeSeriesPoint[];
};

export async function getSystemHealth(): Promise<SystemHealthResponse> {
  const res = await fetchWithAuth(`/monitoring/health`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to fetch health data");
  }
  return res.json();
}
