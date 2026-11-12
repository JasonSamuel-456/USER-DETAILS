import sys
from database import SessionLocal, init_database, engine, Base
import models

SAMPLE_USERS = [
    {
        "first_name": "Elena",
        "last_name": "Rostova",
        "email": "elena.rostova@example.com",
        "phone": "+1 (555) 234-5678",
        "role": "Lead Frontend Architect",
        "department": "Engineering",
        "address": "742 Evergreen Terrace",
        "city": "San Francisco",
        "country": "USA",
        "status": "Active",
        "is_admin": True,
        "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces",
        "bio": "Specializes in high-performance React applications, WebGL, and micro-frontend architecture."
    },
    {
        "first_name": "Marcus",
        "last_name": "Chen",
        "email": "marcus.chen@example.com",
        "phone": "+1 (555) 345-6789",
        "role": "Principal Backend Engineer",
        "department": "Engineering",
        "address": "120 Market Street",
        "city": "Seattle",
        "country": "USA",
        "status": "Active",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
        "bio": "FastAPI and distributed systems enthusiast. Loves optimizing high-throughput SQL and Redis caching layers."
    },
    {
        "first_name": "Sophia",
        "last_name": "Alvarez",
        "email": "sophia.alvarez@example.com",
        "phone": "+1 (555) 456-7890",
        "role": "Product Design Director",
        "department": "Design",
        "address": "88 King Street",
        "city": "Austin",
        "country": "USA",
        "status": "Active",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
        "bio": "Passionate about creating accessible, inclusive, and visually delightful design systems."
    },
    {
        "first_name": "David",
        "last_name": "Kim",
        "email": "david.kim@example.com",
        "phone": "+1 (555) 567-8901",
        "role": "Senior Product Manager",
        "department": "Product",
        "address": "450 Broadway Ave",
        "city": "New York",
        "country": "USA",
        "status": "Active",
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces",
        "bio": "Leading enterprise analytics product roadmaps and customer growth telemetry."
    },
    {
        "first_name": "Amira",
        "last_name": "Patel",
        "email": "amira.patel@example.com",
        "phone": "+1 (555) 678-9012",
        "role": "DevOps & Cloud Engineer",
        "department": "Engineering",
        "address": "310 Michigan Ave",
        "city": "Chicago",
        "country": "USA",
        "status": "Pending",
        "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces",
        "bio": "Kubernetes, Docker, CI/CD pipelines, and infrastructure as code automation specialist."
    },
    {
        "first_name": "Lucas",
        "last_name": "Müller",
        "email": "lucas.mueller@example.com",
        "phone": "+49 30 123456",
        "role": "Growth Marketing Lead",
        "department": "Marketing",
        "address": "Unter den Linden 42",
        "city": "Berlin",
        "country": "Germany",
        "status": "Active",
        "avatar_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces",
        "bio": "Data-driven marketing strategist driving organic inbound and digital brand presence."
    },
    {
        "first_name": "Chloe",
        "last_name": "Dubois",
        "email": "chloe.dubois@example.com",
        "phone": "+33 1 42 68 55 00",
        "role": "People & Culture Specialist",
        "department": "Human Resources",
        "address": "15 Rue de Rivoli",
        "city": "Paris",
        "country": "France",
        "status": "Inactive",
        "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces",
        "bio": "Focused on employee well-being, global talent acquisition, and inclusive onboarding."
    },
    {
        "first_name": "Tariq",
        "last_name": "Mansour",
        "email": "tariq.mansour@example.com",
        "phone": "+971 4 365 0000",
        "role": "Enterprise Account Executive",
        "department": "Sales",
        "address": "Sheikh Zayed Road",
        "city": "Dubai",
        "country": "UAE",
        "status": "Active",
        "avatar_url": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop&crop=faces",
        "bio": "Building strategic enterprise relationships across the EMEA and APAC regions."
    }
]

def seed():
    print("Initiating database seeding...")
    init_database()
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        count = db.query(models.User).count()
        if count > 0:
            print(f"Database already contains {count} user records. Skipping seed.")
            return

        for user_data in SAMPLE_USERS:
            user = models.User(**user_data)
            db.add(user)
        db.commit()
        print(f"Successfully seeded {len(SAMPLE_USERS)} users into MySQL!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
