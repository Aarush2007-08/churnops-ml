import { fetchWithAuth } from "./client";

export type FeatureImpact = {
  feature: string;
  value: string;
  impact: number;
  direction: string;
};

export type ExplainResponse = {
  customer_id: string;
  base_value: number;
  final_probability: number;
  features: FeatureImpact[];
};

export async function explainCustomerPrediction(customerId: string): Promise<ExplainResponse> {
  const res = await fetchWithAuth(`/explain/${customerId}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to fetch explanation");
  }
  return res.json();
}
