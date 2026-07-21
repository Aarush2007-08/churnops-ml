from pydantic import BaseModel
from typing import List

class BatchPredictionItem(BaseModel):
    customer_id: str
    churn_probability: float
    risk_level: str # "High", "Medium", "Low"

class BatchPredictionResponse(BaseModel):
    total_processed: int
    average_probability: float
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    predictions: List[BatchPredictionItem]
