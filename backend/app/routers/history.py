from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.history import PredictionLog
from app.schemas.history import PredictionLogListResponse

router = APIRouter(prefix="/history", tags=["history"])

@router.get("", response_model=PredictionLogListResponse)
def get_prediction_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    customer_id: str = Query(None, description="Filter by customer_id")
):
    query = db.query(PredictionLog)
    
    if customer_id:
        query = query.filter(PredictionLog.customer_id.ilike(f"%{customer_id}%"))
        
    query = query.order_by(desc(PredictionLog.created_at))
    
    total = query.count()
    logs = query.offset(skip).limit(limit).all()
    
    return {
        "items": logs,
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit
    }
