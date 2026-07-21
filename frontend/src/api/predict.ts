import { fetchWithAuth } from "./client";

export type Recommendation = {
  action: string;
  reason: string;
  priority: string;
};

export type SinglePredictionResponse = {
  customer_id: string;
  churn_probability: float;
  confidence: float;
  recommendation: Recommendation;
  model_version: string;
};

export async function predictSingleCustomer(customerId: string): Promise<SinglePredictionResponse> {
  const res = await fetchWithAuth(`/predict/single/${customerId}`, {
    method: "POST",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to run prediction");
  }
  return res.json();
}
