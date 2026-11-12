from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

import models
import schemas
import crud
from database import engine, get_db, init_database, Base, DB_HOST, DB_PORT, DB_NAME, DB_USER
from seed_data import SAMPLE_USERS

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
                    print("[STARTUP] Table 'users' is empty. Seeding initial records...")
                    from database import SessionLocal
                    s = SessionLocal()
                    try:
                        for u_data in SAMPLE_USERS:
                            s.add(models.User(**u_data))
                        s.commit()
                        print(f"[STARTUP] Seeded {len(SAMPLE_USERS)} users.")
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
    description="Full-stack FastAPI backend integrated with MySQL database to get and manage user details.",
    version="1.0.0",
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

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "User Details API is online",
        "docs_url": "/docs",
        "database_connected": db_connected,
        "database_target": f"{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
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
    search: Optional[str] = Query(None, description="Search by name, email, role, or city"),
    department: Optional[str] = Query(None, description="Filter by department"),
    status: Optional[str] = Query(None, description="Filter by status (Active, Inactive, Pending)"),
    sort_by: str = Query("id", description="Sort by field: id, first_name, last_name, email, role, department, created_at"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order: asc or desc"),
    db: Session = Depends(get_db)
):
    """Retrieve paginated list of user details with search, filter, and sorting."""
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

        # Populate computed full_name for schema
        user_items = []
        for u in users:
            u_dict = u.__dict__.copy()
            u_dict["full_name"] = u.full_name
            user_items.append(schemas.UserResponse.model_validate(u_dict))

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
    """Get full details of a specific user by ID."""
    try:
        user = crud.get_user(db=db, user_id=user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {user_id} not found")
        
        u_dict = user.__dict__.copy()
        u_dict["full_name"] = user.full_name
        return schemas.UserResponse.model_validate(u_dict)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.post("/api/users", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED, tags=["Users"])
def create_new_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create a new user with validation."""
    try:
        existing = crud.get_user_by_email(db, user_in.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A user with email '{user_in.email}' already exists."
            )
        new_user = crud.create_user(db, user_in)
        u_dict = new_user.__dict__.copy()
        u_dict["full_name"] = new_user.full_name
        return schemas.UserResponse.model_validate(u_dict)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.put("/api/users/{user_id}", response_model=schemas.UserResponse, tags=["Users"])
def update_user_details(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(get_db)):
    """Update existing user details."""
    try:
        if user_update.email:
            existing = crud.get_user_by_email(db, user_update.email)
            if existing and existing.id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Email '{user_update.email}' is already registered to another user."
                )
        
        updated_user = crud.update_user(db, user_id, user_update)
        if not updated_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {user_id} not found")
        
        u_dict = updated_user.__dict__.copy()
        u_dict["full_name"] = updated_user.full_name
        return schemas.UserResponse.model_validate(u_dict)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.delete("/api/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Users"])
def delete_user_record(user_id: int, db: Session = Depends(get_db)):
    """Delete a user record by ID."""
    try:
        success = crud.delete_user(db, user_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {user_id} not found")
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.post("/api/seed", tags=["Utilities"])
def seed_sample_users(db: Session = Depends(get_db)):
    """Seed sample users if database is empty or populate more."""
    try:
        added = 0
        for u_data in SAMPLE_USERS:
            if not crud.get_user_by_email(db, u_data["email"]):
                user = models.User(**u_data)
                db.add(user)
                added += 1
        db.commit()
        return {"message": f"Successfully added {added} sample users.", "total_in_batch": len(SAMPLE_USERS)}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
