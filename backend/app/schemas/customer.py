from pydantic import BaseModel
from typing import Optional

class CustomerBase(BaseModel):
    customer_id: str
    gender: Optional[str] = "Female"
    senior_citizen: Optional[int] = 0
    partner: Optional[str] = "No"
    dependents: Optional[str] = "No"
    tenure: Optional[int] = 0
    phone_service: Optional[str] = "Yes"
    multiple_lines: Optional[str] = "No"
    internet_service: Optional[str] = "DSL"
    online_security: Optional[str] = "No"
    online_backup: Optional[str] = "No"
    device_protection: Optional[str] = "No"
    tech_support: Optional[str] = "No"
    streaming_tv: Optional[str] = "No"
    streaming_movies: Optional[str] = "No"
    contract: Optional[str] = "Month-to-month"
    paperless_billing: Optional[str] = "Yes"
    payment_method: Optional[str] = "Electronic check"
    monthly_charges: Optional[float] = 0.0
    total_charges: Optional[float] = 0.0
    churn: Optional[str] = "No"
    churn_risk_score: Optional[float] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    customer_id: Optional[str] = None
    gender: Optional[str] = None
    senior_citizen: Optional[int] = None
    partner: Optional[str] = None
    dependents: Optional[str] = None
    tenure: Optional[int] = None
    phone_service: Optional[str] = None
    multiple_lines: Optional[str] = None
    internet_service: Optional[str] = None
    online_security: Optional[str] = None
    online_backup: Optional[str] = None
    device_protection: Optional[str] = None
    tech_support: Optional[str] = None
    streaming_tv: Optional[str] = None
    streaming_movies: Optional[str] = None
    contract: Optional[str] = None
    paperless_billing: Optional[str] = None
    payment_method: Optional[str] = None
    monthly_charges: Optional[float] = None
    total_charges: Optional[float] = None
    churn: Optional[str] = None
    churn_risk_score: Optional[float] = None

class CustomerResponse(CustomerBase):
    id: int

    class Config:
        from_attributes = True

class CustomerListResponse(BaseModel):
    items: list[CustomerResponse]
    total: int
    page: int
    size: int
