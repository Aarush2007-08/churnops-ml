import { fetchWithAuth } from "./client";

export type Customer = {
  id: number;
  customer_id: string;
  gender: string;
  senior_citizen: number;
  partner: string;
  dependents: string;
  tenure: number;
  phone_service: string;
  multiple_lines: string;
  internet_service: string;
  online_security: string;
  online_backup: string;
  device_protection: string;
  tech_support: string;
  streaming_tv: string;
  streaming_movies: string;
  contract: string;
  paperless_billing: string;
  payment_method: string;
  monthly_charges: number;
  total_charges: number;
  churn: string;
  churn_risk_score?: number;
};

export async function getCustomers(skip = 0, limit = 50, search = "") {
  const params = new URLSearchParams();
  params.append("skip", skip.toString());
  params.append("limit", limit.toString());
  if (search) params.append("search", search);

  const res = await fetchWithAuth(`/customers?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
}

export async function getCustomer(id: number) {
  const res = await fetchWithAuth(`/customers/${id}`);
  if (!res.ok) throw new Error("Failed to fetch customer");
  return res.json();
}

export async function createCustomer(data: Partial<Customer>) {
  const res = await fetchWithAuth(`/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to create customer");
  }
  return res.json();
}

export async function updateCustomer(id: number, data: Partial<Customer>) {
  const res = await fetchWithAuth(`/customers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to update customer");
  }
  return res.json();
}

export async function deleteCustomer(id: number) {
  const res = await fetchWithAuth(`/customers/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete customer");
  return res.json();
}
