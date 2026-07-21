from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from app.core.security import get_current_active_user
from app.models.user import User
from app.schemas.settings import GlobalSettings, NotificationListResponse, Notification

router = APIRouter(prefix="/settings", tags=["settings"])

# In-memory store for MVP demo
MOCK_SETTINGS = {
    "high_risk_threshold": 0.75,
    "enable_email_alerts": True,
    "retention_days": 90,
    "system_theme": "system"
}

def generate_mock_notifications():
    now = datetime.now()
    return [
        Notification(
            id=1,
            type="alert",
            title="High Risk Threshold Exceeded",
            message="15 customers crossed the high-risk threshold in the last 24 hours.",
            timestamp=(now - timedelta(minutes=45)).isoformat(),
            is_read=False
        ),
        Notification(
            id=2,
            type="success",
            title="Batch Prediction Complete",
            message="Successfully processed 5,420 rows from bulk_upload.csv.",
            timestamp=(now - timedelta(hours=3)).isoformat(),
            is_read=True
        ),
        Notification(
            id=3,
            type="info",
            title="Model Promoted",
            message="User admin@churnops.com promoted XGBoost v2.0.0 to Production.",
            timestamp=(now - timedelta(days=1)).isoformat(),
            is_read=True
        ),
        Notification(
            id=4,
            type="alert",
            title="API Latency Spike",
            message="Prediction API latency exceeded 300ms for 5 minutes.",
            timestamp=(now - timedelta(days=2)).isoformat(),
            is_read=True
        )
    ]

@router.get("/preferences", response_model=GlobalSettings)
def get_preferences(current_user: User = Depends(get_current_active_user)):
    return GlobalSettings(**MOCK_SETTINGS)

@router.put("/preferences", response_model=GlobalSettings)
def update_preferences(
    settings: GlobalSettings,
    current_user: User = Depends(get_current_active_user)
):
    global MOCK_SETTINGS
    MOCK_SETTINGS = settings.dict()
    return GlobalSettings(**MOCK_SETTINGS)

@router.get("/notifications", response_model=NotificationListResponse)
def get_notifications(current_user: User = Depends(get_current_active_user)):
    return {"items": generate_mock_notifications()}
