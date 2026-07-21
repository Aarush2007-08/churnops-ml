from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.customer import Customer
from app.models.history import PredictionLog
from app.schemas.predict import SinglePredictionResponse
from app.services.prediction import predict_churn, generate_recommendation

router = APIRouter(prefix="/predict", tags=["prediction"])

@router.post("/single/{customer_id}", response_model=SinglePredictionResponse)
def predict_single_customer(
    customer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    probability = predict_churn(customer)
    recommendation = generate_recommendation(customer, probability)
    
    # Save the prediction back to the customer record for History module
    customer.churn_risk_score = probability
    
    # Create History Log
    features_dict = {
        "tenure": customer.tenure,
        "contract": customer.contract,
        "monthly_charges": customer.monthly_charges,
        "internet_service": customer.internet_service
    }
    log = PredictionLog(
        customer_id=customer.customer_id,
        prediction_type="Single",
        churn_probability=probability,
        features_json=json.dumps(features_dict)
    )
    db.add(log)
    db.commit()
    
    return SinglePredictionResponse(
        customer_id=customer.customer_id,
        churn_probability=probability,
        confidence=0.92, # Mock confidence score
        recommendation=recommendation
    )
