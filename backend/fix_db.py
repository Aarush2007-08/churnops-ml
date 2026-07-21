import os
import sys

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User

def fix_admin_email():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "admin@churnops.local").first()
        if user:
            user.email = "admin@churnops.com"
            db.commit()
            print("Admin email updated successfully.")
        else:
            print("Admin user with .local email not found.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_admin_email()
