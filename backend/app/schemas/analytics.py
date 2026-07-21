from pydantic import BaseModel
from typing import List

class ChurnDistribution(BaseModel):
    name: str
    value: int
    color: str

class ContractRisk(BaseModel):
    name: str
    high_risk: int
    medium_risk: int
    low_risk: int

class TrendData(BaseModel):
    name: str
    churn_rate: float
    high_risk_count: int

class AnalyticsSummaryResponse(BaseModel):
    total_customers: int
    avg_churn_risk: float
    high_risk_total: int
    distribution: List[ChurnDistribution]
    contract_risk: List[ContractRisk]
    trend: List[TrendData]
