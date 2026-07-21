from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PredictionLogResponse(BaseModel):
    id: int
    customer_id: str
    prediction_type: str
    churn_probability: float
    features_json: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class PredictionLogListResponse(BaseModel):
    items: list[PredictionLogResponse]
    total: int
    page: int
    size: int
