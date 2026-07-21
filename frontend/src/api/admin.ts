import { fetchWithAuth } from "./client";

export type AdminUser = {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
};

export type AdminUserListResponse = {
  items: AdminUser[];
  total: number;
};

export async function getUsers(): Promise<AdminUserListResponse> {
  const res = await fetchWithAuth(`/admin/users`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to fetch users");
  }
  return res.json();
}

export async function updateUserRole(userId: number, role: string): Promise<AdminUser> {
  const res = await fetchWithAuth(`/admin/users/${userId}/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to update role");
  }
  return res.json();
}

export async function updateUserStatus(userId: number, isActive: boolean): Promise<AdminUser> {
  const res = await fetchWithAuth(`/admin/users/${userId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_active: isActive })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to update status");
  }
  return res.json();
}
