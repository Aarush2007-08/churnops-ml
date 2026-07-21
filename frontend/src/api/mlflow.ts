import { fetchWithAuth } from "./client";

export type ModelRegistry = {
  id: number;
  version: string;
  algorithm: string;
  accuracy: number;
  f1_score: number;
  status: string;
  created_at: string;
};

export type ModelRegistryListResponse = {
  items: ModelRegistry[];
};

export async function getModels(): Promise<ModelRegistryListResponse> {
  const res = await fetchWithAuth(`/models`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to fetch models");
  }
  return res.json();
}

export async function promoteModel(modelId: number): Promise<ModelRegistry> {
  const res = await fetchWithAuth(`/models/${modelId}/promote`, {
    method: "POST"
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to promote model");
  }
  return res.json();
}
