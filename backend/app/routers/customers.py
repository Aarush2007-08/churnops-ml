from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse, CustomerListResponse

router = APIRouter(prefix="/customers", tags=["customers"])

@router.get("", response_model=CustomerListResponse)
def get_customers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: str = Query(None, description="Search by customer_id")
):
    query = db.query(Customer)
    if search:
        query = query.filter(Customer.customer_id.ilike(f"%{search}%"))
    
    total = query.count()
    customers = query.offset(skip).limit(limit).all()
    
    return {
        "items": customers,
        "total": total,
        "page": (skip // limit) + 1,
        "size": limit
    }

@router.get("/{id}", response_model=CustomerResponse)
def get_customer(
    id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("", response_model=CustomerResponse)
def create_customer(
    customer_in: CustomerCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    existing = db.query(Customer).filter(Customer.customer_id == customer_in.customer_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Customer with this ID already exists")
    
    customer = Customer(**customer_in.dict())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@router.put("/{id}", response_model=CustomerResponse)
def update_customer(
    id: int, 
    customer_in: CustomerUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    update_data = customer_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(customer, key, value)
        
    db.commit()
    db.refresh(customer)
    return customer

@router.delete("/{id}")
def delete_customer(
    id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    db.delete(customer)
    db.commit()
    return {"ok": True}
