import csv
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import json
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.customer import Customer
from app.models.history import PredictionLog
from app.schemas.batch import BatchPredictionResponse, BatchPredictionItem
from app.services.prediction import predict_churn

router = APIRouter(prefix="/predict/batch", tags=["batch_prediction"])

@router.post("/csv", response_model=BatchPredictionResponse)
async def predict_batch_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
    contents = await file.read()
    try:
        text = contents.decode('utf-8')
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Invalid file encoding")
        
    reader = csv.DictReader(io.StringIO(text))
    
    predictions = []
    total_prob = 0.0
    high = 0
    medium = 0
    low = 0
    
    for row in reader:
        customer_id = row.get("customerID", row.get("customer_id", "UNKNOWN"))
        if customer_id == "UNKNOWN":
            continue
            
        # Convert CSV row to Customer mock object for prediction service
        # In a real scenario we'd do strict validation.
        mock_customer = Customer(
            contract=row.get("Contract", row.get("contract", "")),
            monthly_charges=float(row.get("MonthlyCharges", row.get("monthly_charges", 0))) if row.get("MonthlyCharges", row.get("monthly_charges")) else None,
            tenure=int(row.get("tenure", 0)) if row.get("tenure") else None,
            internet_service=row.get("InternetService", row.get("internet_service", ""))
        )
        
        prob = predict_churn(mock_customer)
        total_prob += prob
        
        if prob > 0.7:
            risk = "High"
            high += 1
        elif prob > 0.4:
            risk = "Medium"
            medium += 1
        else:
            risk = "Low"
            low += 1
            
        predictions.append(
            BatchPredictionItem(
                customer_id=customer_id,
                churn_probability=prob,
                risk_level=risk
            )
        )
        
        # Log to History
        features_dict = {
            "tenure": mock_customer.tenure,
            "contract": mock_customer.contract,
            "monthly_charges": mock_customer.monthly_charges,
            "internet_service": mock_customer.internet_service
        }
        log = PredictionLog(
            customer_id=customer_id,
            prediction_type="Batch",
            churn_probability=prob,
            features_json=json.dumps(features_dict)
        )
        db.add(log)
        
    db.commit()
        
    total = len(predictions)
    if total == 0:
        raise HTTPException(status_code=400, detail="No valid customer rows found in CSV")
        
    # Sort by highest risk first
    predictions.sort(key=lambda x: x.churn_probability, reverse=True)
        
    return BatchPredictionResponse(
        total_processed=total,
        average_probability=total_prob / total,
        high_risk_count=high,
        medium_risk_count=medium,
        low_risk_count=low,
        predictions=predictions
    )
