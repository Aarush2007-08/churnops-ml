from sqlalchemy import Column, Integer, String, Float, Boolean
from app.core.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String, unique=True, index=True, nullable=False) # e.g. "7590-VHVEG"
    
    # Demographics
    gender = Column(String)
    senior_citizen = Column(Integer, default=0) # 0 or 1
    partner = Column(String) # "Yes" or "No"
    dependents = Column(String) # "Yes" or "No"
    
    # Services
    tenure = Column(Integer, default=0)
    phone_service = Column(String)
    multiple_lines = Column(String)
    internet_service = Column(String) # "DSL", "Fiber optic", "No"
    online_security = Column(String)
    online_backup = Column(String)
    device_protection = Column(String)
    tech_support = Column(String)
    streaming_tv = Column(String)
    streaming_movies = Column(String)
    
    # Account
    contract = Column(String) # "Month-to-month", "One year", "Two year"
    paperless_billing = Column(String)
    payment_method = Column(String)
    monthly_charges = Column(Float)
    total_charges = Column(Float)
    
    # Target / Prediction
    churn = Column(String) # Actual label if known: "Yes" or "No"
    churn_risk_score = Column(Float, nullable=True) # ML prediction
