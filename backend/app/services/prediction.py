import random
from app.models.customer import Customer

def predict_churn(customer: Customer) -> float:
    # A realistic heuristic for demo purposes
    risk = 0.5
    
    if customer.contract == "Month-to-month":
        risk += 0.2
    elif customer.contract == "Two year":
        risk -= 0.3
        
    if customer.monthly_charges and customer.monthly_charges > 80:
        risk += 0.15
        
    if customer.tenure and customer.tenure < 12:
        risk += 0.2
    elif customer.tenure and customer.tenure > 60:
        risk -= 0.2
        
    if customer.internet_service == "Fiber optic":
        risk += 0.1
        
    # Add some noise
    risk += random.uniform(-0.05, 0.05)
    
    return max(0.01, min(0.99, risk))

def generate_recommendation(customer: Customer, probability: float) -> dict:
    if probability < 0.3:
        return {
            "action": "Maintain relationship.",
            "reason": "Customer is low risk.",
            "priority": "Low"
        }
        
    reasons = []
    actions = []
    
    if customer.contract == "Month-to-month":
        reasons.append("High risk due to month-to-month contract.")
        actions.append("Offer a 10% discount to upgrade to a 1-year contract.")
        
    if customer.monthly_charges and customer.monthly_charges > 80:
        reasons.append("High monthly charges.")
        actions.append("Review plan usage and suggest a cost-optimized bundle.")
        
    if customer.tenure and customer.tenure < 12:
        reasons.append("Early lifecycle churn risk.")
        actions.append("Schedule a proactive check-in call to ensure satisfaction.")
        
    if not actions:
        actions = ["Send targeted retention email with a generic discount offer."]
        reasons = ["Algorithm identified subtle usage patterns indicative of churn."]
        
    return {
        "action": actions[0],
        "reason": reasons[0],
        "priority": "High" if probability > 0.7 else "Medium"
    }
