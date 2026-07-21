from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.mlflow import ModelRegistry
from app.schemas.mlflow import ModelRegistryListResponse, ModelRegistryResponse

router = APIRouter(prefix="/models", tags=["mlflow"])

@router.get("", response_model=ModelRegistryListResponse)
def list_models(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    models = db.query(ModelRegistry).order_by(desc(ModelRegistry.created_at)).all()
    return {"items": models}

@router.post("/{model_id}/promote", response_model=ModelRegistryResponse)
def promote_model(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Demote current production model(s)
    current_prod = db.query(ModelRegistry).filter(ModelRegistry.status == "Production").all()
    for model in current_prod:
        model.status = "Archived"
        
    # Promote new model
    new_prod = db.query(ModelRegistry).filter(ModelRegistry.id == model_id).first()
    if not new_prod:
        raise HTTPException(status_code=404, detail="Model not found")
        
    new_prod.status = "Production"
    db.commit()
    db.refresh(new_prod)
    
    return new_prod
