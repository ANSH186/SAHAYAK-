from typing import Optional
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decode_access_token, security_bearer
from app.db.session import get_db
from app.db.models.user import User, UserRole, UserStatus

bearer_auth = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(bearer_auth),
    db: Session = Depends(get_db)
) -> User:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    payload = decode_access_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    if user.status == UserStatus.SUSPENDED.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended. Contact campus proctor."
        )
        
    return user


def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(bearer_auth),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not credentials:
        return None
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = payload.get("sub")
        if not user_id:
            return None
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None


def get_current_admin(
    user: User = Depends(get_current_user)
) -> User:
    allowed_roles = [UserRole.ADMIN.value, UserRole.PROCTOR.value, UserRole.AUTHORIZED_REVIEWER.value, "proctor", "admin"]
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required to access this resource."
        )
    return user
