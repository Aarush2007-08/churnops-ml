from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base

class PredictionLog(Base):
    __tablename__ = "prediction_logs"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String, index=True, nullable=False)
    prediction_type = Column(String, nullable=False) # "Single" or "Batch"
    churn_probability = Column(Float, nullable=False)
    features_json = Column(Text, nullable=True) # JSON snapshot of customer features used
    created_at = Column(DateTime(timezone=True), server_default=func.now())
