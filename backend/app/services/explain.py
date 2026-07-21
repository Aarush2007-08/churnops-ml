from app.models.customer import Customer

def generate_shap_values(customer: Customer, final_probability: float):
    # Mock base value (average churn rate across population)
    base_value = 0.25
    
    features = []
    
    # Contract Impact
    if customer.contract == "Month-to-month":
        features.append({"feature": "Contract", "value": "Month-to-month", "impact": 0.22, "direction": "positive"})
    elif customer.contract == "Two year":
        features.append({"feature": "Contract", "value": "Two year", "impact": -0.28, "direction": "negative"})
    elif customer.contract == "One year":
        features.append({"feature": "Contract", "value": "One year", "impact": -0.10, "direction": "negative"})
        
    # Tenure Impact
    if customer.tenure and customer.tenure < 12:
        features.append({"feature": "Tenure", "value": f"{customer.tenure} months", "impact": 0.18, "direction": "positive"})
    elif customer.tenure and customer.tenure > 60:
        features.append({"feature": "Tenure", "value": f"{customer.tenure} months", "impact": -0.15, "direction": "negative"})
    else:
        features.append({"feature": "Tenure", "value": f"{customer.tenure} months", "impact": -0.02, "direction": "negative"})
        
    # Monthly Charges Impact
    if customer.monthly_charges and customer.monthly_charges > 80:
        features.append({"feature": "Monthly Charges", "value": f"${customer.monthly_charges}", "impact": 0.12, "direction": "positive"})
    elif customer.monthly_charges and customer.monthly_charges < 40:
        features.append({"feature": "Monthly Charges", "value": f"${customer.monthly_charges}", "impact": -0.08, "direction": "negative"})
        
    # Internet Service
    if customer.internet_service == "Fiber optic":
        features.append({"feature": "Internet Service", "value": "Fiber optic", "impact": 0.09, "direction": "positive"})
    elif customer.internet_service == "No":
        features.append({"feature": "Internet Service", "value": "No", "impact": -0.05, "direction": "negative"})
        
    # Security
    if customer.online_security == "No":
        features.append({"feature": "Online Security", "value": "No", "impact": 0.06, "direction": "positive"})
    elif customer.online_security == "Yes":
        features.append({"feature": "Online Security", "value": "Yes", "impact": -0.04, "direction": "negative"})

    # Sort by absolute impact for visualization
    features.sort(key=lambda x: abs(x["impact"]), reverse=True)
    
    return base_value, features
