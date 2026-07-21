import { fetchWithAuth } from "./client";

export type GlobalSettings = {
  high_risk_threshold: number;
  enable_email_alerts: boolean;
  retention_days: number;
  system_theme: string;
};

export type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  is_read: boolean;
};

export type NotificationListResponse = {
  items: Notification[];
};

export async function getPreferences(): Promise<GlobalSettings> {
  const res = await fetchWithAuth(`/settings/preferences`);
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

export async function updatePreferences(settings: GlobalSettings): Promise<GlobalSettings> {
  const res = await fetchWithAuth(`/settings/preferences`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error("Failed to update settings");
  return res.json();
}

export async function getNotifications(): Promise<NotificationListResponse> {
  const res = await fetchWithAuth(`/settings/notifications`);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}
