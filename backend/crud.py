from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc, asc
import models
import schemas
from auth_utils import hash_password, verify_password
from typing import Optional, List, Tuple

def calculate_completion(user: models.User) -> int:
    """Calculate profile completeness score (0-100%)."""
    fields = [
        user.first_name,
        user.last_name,
        user.email,
        user.phone,
        user.role,
        getattr(user, "skills", None),
        user.department,
        user.address,
        user.city,
        user.country,
        user.avatar_url,
        user.bio,
        getattr(user, "linkedin_url", None)
    ]
    filled = sum(1 for f in fields if f and str(f).strip())
    return int((filled / len(fields)) * 100)

def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None,
    department: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: str = "id",
    sort_order: str = "desc"
) -> Tuple[List[models.User], int]:
    query = db.query(models.User)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                models.User.first_name.ilike(search_fmt),
                models.User.last_name.ilike(search_fmt),
                models.User.email.ilike(search_fmt),
                models.User.role.ilike(search_fmt),
                models.User.city.ilike(search_fmt),
                models.User.skills.ilike(search_fmt) if hasattr(models.User, 'skills') else False
            )
        )

    if department and department.lower() != "all":
        query = query.filter(models.User.department == department)

    if status and status.lower() != "all":
        query = query.filter(models.User.status == status)

    total = query.count()

    # Sorting
    sort_col = getattr(models.User, sort_by, models.User.id)
    if sort_order.lower() == "desc":
        query = query.order_by(desc(sort_col))
    else:
        query = query.order_by(asc(sort_col))

    users = query.offset(skip).limit(limit).all()
    return users, total

def create_user(db: Session, user_in: schemas.UserCreate) -> models.User:
    raw_data = user_in.model_dump(exclude={"password"})
    raw_data["password_hash"] = hash_password(user_in.password)
    db_user = models.User(**raw_data)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate) -> Optional[models.User]:
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    # Exclude passwords from direct attribute assignment
    update_data = user_update.model_dump(
        exclude_unset=True, 
        exclude={"current_password", "new_password"}
    )
    for key, value in update_data.items():
        if hasattr(db_user, key):
            setattr(db_user, key, value)

    # If user provided a new password, hash and update
    if user_update.new_password and user_update.new_password.strip():
        db_user.password_hash = hash_password(user_update.new_password.strip())

    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int) -> bool:
    db_user = get_user(db, user_id)
    if not db_user:
        return False
    db.delete(db_user)
    db.commit()
    return True

def get_stats(db: Session) -> schemas.UserStats:
    total = db.query(models.User).count()
    active = db.query(models.User).filter(models.User.status == "Active").count()
    inactive = db.query(models.User).filter(models.User.status == "Inactive").count()
    pending = db.query(models.User).filter(models.User.status == "Pending").count()
    
    dept_rows = db.query(models.User.department).distinct().all()
    departments = [d[0] for d in dept_rows if d[0]]

    return schemas.UserStats(
        total_users=total,
        active_users=active,
        inactive_users=inactive,
        pending_users=pending,
        departments=departments
    )
