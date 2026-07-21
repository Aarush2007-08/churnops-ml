import { fetchWithAuth } from "./client";

export type PredictionLog = {
  id: number;
  customer_id: string;
  prediction_type: string;
  churn_probability: number;
  features_json: string | null;
  created_at: string;
};

export type PredictionLogListResponse = {
  items: PredictionLog[];
  total: number;
  page: number;
  size: number;
};

export async function getPredictionHistory(skip = 0, limit = 50, customerId = ""): Promise<PredictionLogListResponse> {
  const params = new URLSearchParams();
  params.append("skip", skip.toString());
  params.append("limit", limit.toString());
  if (customerId) params.append("customer_id", customerId);

  const res = await fetchWithAuth(`/history?${params.toString()}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to fetch history");
  }
  return res.json();
}
