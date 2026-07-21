from pydantic import BaseModel
from typing import List
from datetime import datetime

class ModelRegistryResponse(BaseModel):
    id: int
    version: str
    algorithm: str
    accuracy: float
    f1_score: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ModelRegistryListResponse(BaseModel):
    items: List[ModelRegistryResponse]
