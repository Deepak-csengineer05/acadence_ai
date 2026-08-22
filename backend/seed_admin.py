import sys
import argparse
from app.db.session import SessionLocal
from app.models import User
from app.core.auth import get_password_hash

def seed_admin(email: str, password: str, name: str):
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"[*] User '{email}' already exists. Promoting to admin...")
            existing.role = "admin"
            existing.hashed_password = get_password_hash(password)
            db.commit()
            print(f"[+] User '{email}' successfully promoted to admin.")
            return

        new_admin = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name=name,
            role="admin",
            onboarded=True
        )
        db.add(new_admin)
        db.commit()
        print(f"[+] Administrator '{name}' ({email}) created successfully!")
    except Exception as e:
        db.rollback()
        print(f"[!] Error seeding admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Acadence AI Admin Provisioning CLI")
    parser.add_argument("--email", required=True, help="Admin Email")
    parser.add_argument("--password", required=True, help="Admin Password")
    parser.add_argument("--name", default="System Administrator", help="Admin Full Name")

    args = parser.parse_args()
    seed_admin(args.email, args.password, args.name)
