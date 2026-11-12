from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc, asc
import models
import schemas
from typing import Optional, List, Tuple

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
                models.User.city.ilike(search_fmt)
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
    db_user = models.User(**user_in.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate) -> Optional[models.User]:
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)

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
