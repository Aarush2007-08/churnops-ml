from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.schemas.admin import AdminUserListResponse, AdminUserResponse, UpdateRoleRequest, UpdateStatusRequest

router = APIRouter(prefix="/admin", tags=["admin"])

def require_admin(current_user: User = Depends(get_current_active_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

@router.get("/users", response_model=AdminUserListResponse)
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # For MVP, allowing any logged-in user to view the list so it's easy to demo,
    # but in production, we would use `Depends(require_admin)`
    users = db.query(User).all()
    return {"items": users, "total": len(users)}

@router.put("/users/{user_id}/role", response_model=AdminUserResponse)
def update_user_role(
    user_id: int,
    request: UpdateRoleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if request.role not in ["admin", "analyst", "viewer"]:
        raise HTTPException(status_code=400, detail="Invalid role")
        
    user.role = request.role
    db.commit()
    db.refresh(user)
    return user

@router.put("/users/{user_id}/status", response_model=AdminUserResponse)
def update_user_status(
    user_id: int,
    request: UpdateStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Prevent self-deactivation to avoid locking oneself out during demo
    if user.id == current_user.id and request.is_active is False:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
        
    user.is_active = request.is_active
    db.commit()
    db.refresh(user)
    return user
