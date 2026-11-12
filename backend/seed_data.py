import sys
from database import SessionLocal, init_database, engine, Base
import models
from auth_utils import hash_password

SAMPLE_USERS = [
    {
        "first_name": "Elena",
        "last_name": "Rostova",
        "email": "elena.rostova@example.com",
        "phone": "+1 (555) 234-5678",
        "role": "Lead Frontend Architect",
        "skills": "React 19, TypeScript, Vite, KaTeX, Tailwind CSS",
        "department": "Engineering",
        "address": "742 Evergreen Terrace",
        "city": "San Francisco",
        "country": "USA",
        "status": "Active",
        "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces",
        "bio": "Specializes in high-performance React applications, WebGL, and micro-frontend architecture.",
        "linkedin_url": "https://linkedin.com/in/elena-rostova"
    },
    {
        "first_name": "Marcus",
        "last_name": "Chen",
        "email": "marcus.chen@example.com",
        "phone": "+1 (555) 345-6789",
        "role": "Principal Backend Engineer",
        "skills": "FastAPI, Python 3.15, MySQL, SQLAlchemy, Redis",
        "department": "Engineering",
        "address": "120 Market Street",
        "city": "Seattle",
        "country": "USA",
        "status": "Active",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
        "bio": "FastAPI and distributed systems enthusiast. Loves optimizing high-throughput SQL and Redis caching layers.",
        "linkedin_url": "https://linkedin.com/in/marcus-chen"
    },
    {
        "first_name": "Sophia",
        "last_name": "Alvarez",
        "email": "sophia.alvarez@example.com",
        "phone": "+1 (555) 456-7890",
        "role": "Product Design Director",
        "skills": "Figma, Design Systems, UX Research, Prototyping",
        "department": "Design",
        "address": "88 King Street",
        "city": "Austin",
        "country": "USA",
        "status": "Active",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
        "bio": "Passionate about creating accessible, inclusive, and visually delightful design systems.",
        "linkedin_url": "https://linkedin.com/in/sophia-alvarez"
    },
    {
        "first_name": "David",
        "last_name": "Kim",
        "email": "david.kim@example.com",
        "phone": "+1 (555) 567-8901",
        "role": "Senior Product Manager",
        "skills": "Product Strategy, Analytics, Agile, Roadmapping",
        "department": "Product",
        "address": "450 Broadway Ave",
        "city": "New York",
        "country": "USA",
        "status": "Active",
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces",
        "bio": "Leading enterprise analytics product roadmaps and customer growth telemetry.",
        "linkedin_url": "https://linkedin.com/in/david-kim"
    },
    {
        "first_name": "Amira",
        "last_name": "Patel",
        "email": "amira.patel@example.com",
        "phone": "+1 (555) 678-9012",
        "role": "DevOps & Cloud Engineer",
        "skills": "Kubernetes, Docker, AWS, Terraform, CI/CD",
        "department": "Engineering",
        "address": "310 Michigan Ave",
        "city": "Chicago",
        "country": "USA",
        "status": "Pending",
        "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces",
        "bio": "Kubernetes, Docker, CI/CD pipelines, and infrastructure as code automation specialist.",
        "linkedin_url": "https://linkedin.com/in/amira-patel"
    },
    {
        "first_name": "Lucas",
        "last_name": "Müller",
        "email": "lucas.mueller@example.com",
        "phone": "+49 30 123456",
        "role": "Growth Marketing Lead",
        "skills": "SEO, SEM, Hubspot, Content Marketing, Analytics",
        "department": "Marketing",
        "address": "Unter den Linden 42",
        "city": "Berlin",
        "country": "Germany",
        "status": "Active",
        "avatar_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces",
        "bio": "Data-driven marketing strategist driving organic inbound and digital brand presence.",
        "linkedin_url": "https://linkedin.com/in/lucas-mueller"
    },
    {
        "first_name": "Chloe",
        "last_name": "Dubois",
        "email": "chloe.dubois@example.com",
        "phone": "+33 1 42 68 55 00",
        "role": "People & Culture Specialist",
        "skills": "Recruitment, HR Analytics, Culture, Onboarding",
        "department": "Human Resources",
        "address": "15 Rue de Rivoli",
        "city": "Paris",
        "country": "France",
        "status": "Inactive",
        "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces",
        "bio": "Focused on employee well-being, global talent acquisition, and inclusive onboarding.",
        "linkedin_url": "https://linkedin.com/in/chloe-dubois"
    },
    {
        "first_name": "Tariq",
        "last_name": "Mansour",
        "email": "tariq.mansour@example.com",
        "phone": "+971 4 365 0000",
        "role": "Enterprise Account Executive",
        "skills": "Enterprise Sales, Salesforce, Negotiations, EMEA",
        "department": "Sales",
        "address": "Sheikh Zayed Road",
        "city": "Dubai",
        "country": "UAE",
        "status": "Active",
        "avatar_url": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop&crop=faces",
        "bio": "Building strategic enterprise relationships across the EMEA and APAC regions.",
        "linkedin_url": "https://linkedin.com/in/tariq-mansour"
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
            # Set default password: <firstname>123 e.g. elena123
            default_pw = f"{user_data['first_name'].lower()}123"
            u_dict = user_data.copy()
            u_dict["password_hash"] = hash_password(default_pw)
            user = models.User(**u_dict)
            db.add(user)
        db.commit()
        print(f"Successfully seeded {len(SAMPLE_USERS)} users into MySQL with secure passwords!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
