from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=30)
    role: str = Field(default="Software Engineer", max_length=100)
    department: str = Field(default="Engineering", max_length=100)
    address: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(default="USA", max_length=100)
    status: str = Field(default="Active", pattern="^(Active|Inactive|Pending)$")
    is_admin: bool = Field(default=False)
    avatar_url: Optional[str] = Field(None, max_length=500)
    bio: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=30)
    role: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    status: Optional[str] = Field(None, pattern="^(Active|Inactive|Pending)$")
    is_admin: Optional[bool] = None
    avatar_url: Optional[str] = Field(None, max_length=500)
    bio: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    full_name: Optional[str] = None

    class Config:
        from_attributes = True

class PaginatedUsersResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[UserResponse]

class UserStats(BaseModel):
    total_users: int
    active_users: int
    inactive_users: int
    pending_users: int
    departments: List[str]
