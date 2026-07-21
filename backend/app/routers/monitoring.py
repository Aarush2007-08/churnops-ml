from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.history import PredictionLog
from app.schemas.monitoring import SystemHealthResponse, TimeSeriesPoint

router = APIRouter(prefix="/monitoring", tags=["monitoring"])

# Base simulated values
SIM_STATE = {
    "cpu": 25.0,
    "memory": 45.0,
    "latency": 120.0
}

def get_simulated_variance(current, min_val, max_val, max_step):
    step = random.uniform(-max_step, max_step)
    new_val = current + step
    return max(min_val, min(max_val, new_val))

@router.get("/health", response_model=SystemHealthResponse)
def get_system_health(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    global SIM_STATE
    
    # Update simulated state with random walk
    SIM_STATE["cpu"] = get_simulated_variance(SIM_STATE["cpu"], 5.0, 95.0, 5.0)
    SIM_STATE["memory"] = get_simulated_variance(SIM_STATE["memory"], 30.0, 90.0, 2.0)
    SIM_STATE["latency"] = get_simulated_variance(SIM_STATE["latency"], 50.0, 400.0, 20.0)
    
    # Calculate real prediction volume
    volume = db.query(PredictionLog).count()
    
    # Generate 15 points of history leading up to current state
    history = []
    now = datetime.now()
    
    # Local temp vars to walk backwards
    hist_cpu = SIM_STATE["cpu"]
    hist_mem = SIM_STATE["memory"]
    hist_lat = SIM_STATE["latency"]
    
    # Walk backwards to generate realistic history curve
    for i in range(14, -1, -1):
        time_point = now - timedelta(minutes=i)
        
        # Fluctuate backwards
        hist_cpu = get_simulated_variance(hist_cpu, 5.0, 95.0, 5.0)
        hist_mem = get_simulated_variance(hist_mem, 30.0, 90.0, 2.0)
        hist_lat = get_simulated_variance(hist_lat, 50.0, 400.0, 20.0)
        
        history.append(TimeSeriesPoint(
            time=time_point.strftime("%H:%M"),
            cpu=round(hist_cpu, 1),
            memory=round(hist_mem, 1),
            latency=round(hist_lat, 1)
        ))
        
    # Replace the very last point with the exact current state
    history[-1] = TimeSeriesPoint(
        time=now.strftime("%H:%M"),
        cpu=round(SIM_STATE["cpu"], 1),
        memory=round(SIM_STATE["memory"], 1),
        latency=round(SIM_STATE["latency"], 1)
    )

    return SystemHealthResponse(
        status="Healthy",
        uptime="99.9%",
        cpu_usage=round(SIM_STATE["cpu"], 1),
        memory_usage=round(SIM_STATE["memory"], 1),
        api_latency_ms=round(SIM_STATE["latency"], 1),
        prediction_volume=volume,
        history=history
    )
