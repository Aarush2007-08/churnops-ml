from pydantic import BaseModel
from typing import Dict, Any

class Recommendation(BaseModel):
    action: str
    reason: str
    priority: str

class SinglePredictionResponse(BaseModel):
    customer_id: str
    churn_probability: float
    confidence: float
    recommendation: Recommendation
    model_version: str = "v1.0.0-mock"
