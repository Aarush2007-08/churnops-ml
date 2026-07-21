from pydantic import BaseModel
from typing import List

class FeatureImpact(BaseModel):
    feature: str
    value: str
    impact: float
    direction: str # "positive" (increases churn) or "negative" (decreases churn)

class ExplainResponse(BaseModel):
    customer_id: str
    base_value: float
    final_probability: float
    features: List[FeatureImpact]
