import { fetchWithAuth } from "./client";

export type ChurnDistribution = {
  name: string;
  value: number;
  color: string;
};

export type ContractRisk = {
  name: string;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
};

export type TrendData = {
  name: string;
  churn_rate: number;
  high_risk_count: number;
};

export type AnalyticsSummaryResponse = {
  total_customers: number;
  avg_churn_risk: number;
  high_risk_total: number;
  distribution: ChurnDistribution[];
  contract_risk: ContractRisk[];
  trend: TrendData[];
};

export async function getAnalyticsSummary(): Promise<AnalyticsSummaryResponse> {
  const res = await fetchWithAuth("/analytics/summary");
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to fetch analytics");
  }
  return res.json();
}
