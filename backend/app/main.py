from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base, SessionLocal
from app.routers import auth, customers, predict, batch, history, analytics, explain, mlflow, monitoring, admin, settings
from app.models.user import User
from app.models.customer import Customer
from app.models.history import PredictionLog
from app.models.mlflow import ModelRegistry
from app.core.security import get_password_hash

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Churn-Ops API",
    description="Customer Churn Prediction Platform API",
    version="1.0.0",
)

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        # Seed Admin
        admin = db.query(User).filter(User.email == "admin@churnops.com").first()
        if not admin:
            admin_user = User(
                email="admin@churnops.com",
                hashed_password=get_password_hash("admin123"),
                role="admin"
            )
            db.add(admin_user)
        
        # Seed Customers
        customer_count = db.query(Customer).count()
        if customer_count == 0:
            import random
            services = ["Yes", "No", "No phone service", "DSL", "Fiber optic"]
            for i in range(1, 51):
                c = Customer(
                    customer_id=f"CUST-{1000+i}",
                    gender=random.choice(["Male", "Female"]),
                    senior_citizen=random.choice([0, 1]),
                    tenure=random.randint(1, 72),
                    monthly_charges=round(random.uniform(20.0, 110.0), 2),
                    total_charges=round(random.uniform(20.0, 7000.0), 2),
                    contract=random.choice(["Month-to-month", "One year", "Two year"]),
                    churn=random.choice(["Yes", "No"])
                )
                db.add(c)
        db.commit()

        # Seed mock models if empty
        if db.query(ModelRegistry).count() == 0:
            models = [
                ModelRegistry(version="v1.0.0", algorithm="Logistic Regression", accuracy=0.72, f1_score=0.68, status="Archived"),
                ModelRegistry(version="v1.1.0", algorithm="Random Forest", accuracy=0.81, f1_score=0.79, status="Staging"),
                ModelRegistry(version="v2.0.0", algorithm="XGBoost", accuracy=0.86, f1_score=0.84, status="Production")
            ]
            db.add_all(models)
            db.commit()
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(customers.router)
app.include_router(predict.router)
app.include_router(batch.router)
app.include_router(history.router)
app.include_router(analytics.router)
app.include_router(explain.router)
app.include_router(mlflow.router)
app.include_router(monitoring.router)
app.include_router(admin.router)
app.include_router(settings.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Churn-Ops API is running"}

