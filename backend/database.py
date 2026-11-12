import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import pymysql

# Load environment variables
load_dotenv()

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "user_details_db")

# Check for unified cloud DATABASE_URL first (provided by Render, Railway, TiDB, etc.)
RAW_DATABASE_URL = os.getenv("DATABASE_URL")

if RAW_DATABASE_URL:
    if RAW_DATABASE_URL.startswith("mysql://"):
        DATABASE_URL = RAW_DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)
    else:
        DATABASE_URL = RAW_DATABASE_URL
    BASE_DATABASE_URL = DATABASE_URL
else:
    # URL-encode password in case it contains special characters
    import urllib.parse
    encoded_password = urllib.parse.quote_plus(DB_PASSWORD)
    BASE_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}"
    DATABASE_URL = f"{BASE_DATABASE_URL}/{DB_NAME}?charset=utf8mb4"

def init_database():
    """Ensure database exists on MySQL server."""
    try:
        # Connect to MySQL server without specifying the DB first to create it if missing
        server_engine = create_engine(BASE_DATABASE_URL, echo=False)
        with server_engine.connect() as conn:
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
            conn.commit()
        print(f"[OK] Database '{DB_NAME}' verified or created.")
        return True, "Database verified."
    except Exception as e:
        err_msg = str(e)
        print(f"[WARN] Could not initialize MySQL database '{DB_NAME}': {err_msg}")
        return False, err_msg

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
