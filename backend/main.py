from contextlib import asynccontextmanager
from typing import Optional
from io import StringIO
import csv
from fastapi import FastAPI, Depends, HTTPException, Query, Header, status, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

import models
import schemas
import crud
from database import engine, get_db, init_database, Base, DB_HOST, DB_PORT, DB_NAME, DB_USER
from seed_data import SAMPLE_USERS
from auth_utils import hash_password, verify_password

db_connected = False
db_error_message = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_connected, db_error_message
    print("[STARTUP] Checking MySQL Database connection...")
    success, msg = init_database()
    if success:
        try:
            Base.metadata.create_all(bind=engine)
            db_connected = True
            print("[STARTUP] MySQL tables verified.")
            
            # Auto-seed if empty
            with engine.connect() as conn:
                res = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
                if res == 0:
                    print("[STARTUP] Table 'users' is empty. Seeding initial records with secure passwords...")
                    from database import SessionLocal
                    s = SessionLocal()
                    try:
                        for u_data in SAMPLE_USERS:
                            u_copy = u_data.copy()
                            u_copy["password_hash"] = hash_password(f"{u_data['first_name'].lower()}123")
                            s.add(models.User(**u_copy))
                        s.commit()
                        print(f"[STARTUP] Seeded {len(SAMPLE_USERS)} users with password hashing.")
                    finally:
                        s.close()
        except Exception as e:
            db_connected = False
            db_error_message = str(e)
            print(f"[STARTUP ERROR] Table creation / verification failed: {e}")
    else:
        db_connected = False
        db_error_message = msg

    yield
    print("[SHUTDOWN] FastAPI server shutting down...")

app = FastAPI(
    title="User Details Management API",
    description="Full-stack FastAPI backend integrated with MySQL database. Features password protection and profile self-service editing.",
    version="1.1.0",
    lifespan=lifespan
)

# Enable CORS for React frontend (Vite default port 5173 and others)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def build_user_response(user: models.User) -> schemas.UserResponse:
    """Helper to convert ORM model to Pydantic UserResponse, without exposing password."""
    u_dict = {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "skills": getattr(user, "skills", "Full Stack, Python, React"),
        "department": user.department,
        "address": user.address,
        "city": user.city,
        "country": user.country,
        "status": user.status,
        "avatar_url": user.avatar_url,
        "bio": user.bio,
        "linkedin_url": getattr(user, "linkedin_url", None),
        "created_at": user.created_at,
        "updated_at": user.updated_at,
        "full_name": user.full_name,
        "profile_completion": crud.calculate_completion(user)
    }
    return schemas.UserResponse.model_validate(u_dict)

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "User Details API is online",
        "docs_url": "/docs",
        "database_connected": db_connected,
        "database_target": f"{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}",
        "security": "Password-protected user profile updates enabled."
    }

@app.get("/api/health", tags=["System"])
def check_health(db: Session = Depends(get_db)):
    """Health check for API and MySQL database connectivity."""
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected",
            "database_name": DB_NAME,
            "host": DB_HOST,
            "port": DB_PORT,
            "user": DB_USER
        }
    except Exception as e:
        return {
            "status": "degraded",
            "database": "disconnected",
            "error": str(e),
            "hint": "Check backend/.env with correct MySQL credentials (DB_USER, DB_PASSWORD, DB_HOST, DB_PORT)."
        }

@app.post("/api/auth/login", response_model=schemas.LoginResponse, tags=["Authentication"])
def authenticate_user(login_data: schemas.UserLoginRequest, db: Session = Depends(get_db)):
    """Log in with email and password to access and edit your personal profile."""
    user = crud.get_user_by_email(db, login_data.email)
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Incorrect email or password."
        )

    return schemas.LoginResponse(
        success=True,
        message=f"Welcome back, {user.first_name}!",
        user=build_user_response(user)
    )

@app.get("/api/stats", response_model=schemas.UserStats, tags=["Users"])
def get_user_statistics(db: Session = Depends(get_db)):
    """Get aggregate statistics about users and departments."""
    try:
        return crud.get_stats(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query error: {str(e)}"
        )

@app.get("/api/users", response_model=schemas.PaginatedUsersResponse, tags=["Users"])
def list_users(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name, email, role, skills, or city"),
    department: Optional[str] = Query(None, description="Filter by department"),
    status: Optional[str] = Query(None, description="Filter by status (Active, Inactive, Pending)"),
    sort_by: str = Query("id", description="Sort by field: id, first_name, last_name, email, role, department, created_at"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order: asc or desc"),
    db: Session = Depends(get_db)
):
    """Retrieve paginated list of user details without exposing passwords."""
    try:
        skip = (page - 1) * page_size
        users, total = crud.get_users(
            db=db,
            skip=skip,
            limit=page_size,
            search=search,
            department=department,
            status=status,
            sort_by=sort_by,
            sort_order=sort_order
        )
        total_pages = (total + page_size - 1) // page_size if total > 0 else 1

        user_items = [build_user_response(u) for u in users]

        return schemas.PaginatedUsersResponse(
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            items=user_items
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users: {str(e)}"
        )

@app.get("/api/users/{user_id}", response_model=schemas.UserResponse, tags=["Users"])
def get_user_details(user_id: int, db: Session = Depends(get_db)):
    """Get full details of a specific user by ID (passwords never returned)."""
    try:
        user = crud.get_user(db=db, user_id=user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {user_id} not found")
        
        return build_user_response(user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.post("/api/users", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED, tags=["Users"])
def create_new_user(
    user_in: schemas.UserCreate, 
    db: Session = Depends(get_db)
):
    """Create a new user profile with a hashed password."""
    try:
        existing = crud.get_user_by_email(db, user_in.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A user with email '{user_in.email}' already exists."
            )
        new_user = crud.create_user(db, user_in)
        return build_user_response(new_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.put("/api/users/{user_id}", response_model=schemas.UserResponse, tags=["Users"])
def update_user_details(
    user_id: int, 
    user_update: schemas.UserUpdate, 
    x_requester_id: Optional[int] = Header(None, alias="X-Requester-Id"),
    db: Session = Depends(get_db)
):
    """
    Update existing user details.
    Security:
    1. Checks profile ownership: A user can only edit their own user profile, not other users.
    2. Password verification: Requires entering the user's secret password to authorize the edit!
    """
    if x_requester_id is not None and x_requester_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: You can only edit your own user profile, not other users."
        )

    # Fetch user to verify password
    db_user = crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {user_id} not found")

    # Verify secret password
    if not verify_password(user_update.current_password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed: Incorrect password. You can only save profile edits with your secret password."
        )

    try:
        if user_update.email:
            existing = crud.get_user_by_email(db, user_update.email)
            if existing and existing.id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Email '{user_update.email}' is already registered to another user."
                )
        
        updated_user = crud.update_user(db, user_id, user_update)
        return build_user_response(updated_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.delete("/api/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Users"])
def delete_user_record(
    user_id: int, 
    x_requester_id: Optional[int] = Header(None, alias="X-Requester-Id"),
    db: Session = Depends(get_db)
):
    """Delete a user profile (only allowed for the user themselves)."""
    if x_requester_id is not None and x_requester_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: You can only delete your own profile, not other users."
        )

    try:
        success = crud.delete_user(db, user_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {user_id} not found")
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.get("/api/export/csv", tags=["Utilities"])
def export_users_csv(db: Session = Depends(get_db)):
    """Export the user directory as a CSV file (passwords securely omitted)."""
    users = db.query(models.User).all()
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "First Name", "Last Name", "Email", "Phone", "Role", 
        "Skills", "Department", "City", "Country", "Status", "Date Registered"
    ])
    for u in users:
        writer.writerow([
            u.id, u.first_name, u.last_name, u.email, u.phone or "",
            u.role, getattr(u, "skills", ""), u.department, u.city or "", 
            u.country or "", u.status, u.created_at.strftime("%Y-%m-%d")
        ])
    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=users_directory.csv"}
    )

@app.post("/api/seed", tags=["Utilities"])
def seed_sample_users(db: Session = Depends(get_db)):
    """Seed sample users if database is empty or populate more."""
    try:
        added = 0
        for u_data in SAMPLE_USERS:
            if not crud.get_user_by_email(db, u_data["email"]):
                u_dict = u_data.copy()
                u_dict["password_hash"] = hash_password(f"{u_data['first_name'].lower()}123")
                user = models.User(**u_dict)
                db.add(user)
                added += 1
        db.commit()
        return {"message": f"Successfully added {added} sample users with secure passwords.", "total_in_batch": len(SAMPLE_USERS)}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
