import { fetchWithAuth } from "./client";

export type BatchPredictionItem = {
  customer_id: string;
  churn_probability: number;
  risk_level: string;
};

export type BatchPredictionResponse = {
  total_processed: number;
  average_probability: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  predictions: BatchPredictionItem[];
};

export async function predictBatchCSV(file: File): Promise<BatchPredictionResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetchWithAuth(`/predict/batch/csv`, {
    method: "POST",
    body: formData, 
  }); 

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to process batch CSV");
  }
  return res.json();
}
