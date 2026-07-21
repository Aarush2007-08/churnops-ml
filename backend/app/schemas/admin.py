from pydantic import BaseModel
from typing import List

class AdminUserResponse(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class AdminUserListResponse(BaseModel):
    items: List[AdminUserResponse]
    total: int

class UpdateRoleRequest(BaseModel):
    role: str # 'admin', 'analyst', 'viewer'

class UpdateStatusRequest(BaseModel):
    is_active: bool
