from pydantic import BaseModel
from typing import List

class GlobalSettings(BaseModel):
    high_risk_threshold: float
    enable_email_alerts: bool
    retention_days: int
    system_theme: str # "system", "light", "dark"

class Notification(BaseModel):
    id: int
    type: str # "alert", "info", "success"
    title: str
    message: str
    timestamp: str
    is_read: bool

class NotificationListResponse(BaseModel):
    items: List[Notification]
