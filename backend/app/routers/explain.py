from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.customer import Customer
from app.schemas.explain import ExplainResponse
from app.services.prediction import predict_churn
from app.services.explain import generate_shap_values

router = APIRouter(prefix="/explain", tags=["explain"])

@router.get("/{customer_id}", response_model=ExplainResponse)
def explain_customer_prediction(
    customer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    # Get current probability (or run predict if missing)
    prob = customer.churn_risk_score
    if prob is None:
        prob = predict_churn(customer)
        
    base_value, features = generate_shap_values(customer, prob)
    
    return ExplainResponse(
        customer_id=customer_id,
        base_value=base_value,
        final_probability=prob,
        features=features
    )
