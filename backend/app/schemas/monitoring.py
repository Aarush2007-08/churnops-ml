from pydantic import BaseModel
from typing import List

class TimeSeriesPoint(BaseModel):
    time: str
    cpu: float
    memory: float
    latency: float

class SystemHealthResponse(BaseModel):
    status: str
    uptime: str
    cpu_usage: float
    memory_usage: float
    api_latency_ms: float
    prediction_volume: int
    history: List[TimeSeriesPoint]
