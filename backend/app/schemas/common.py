from typing import Generic, Optional, TypeVar, Any, Dict
from pydantic import BaseModel

T = TypeVar("T")


class ErrorDetail(BaseModel):
    code: str
    message: str


class ApiResponse(BaseModel, Generic[T]):
    data: Optional[T] = None
    error: Optional[ErrorDetail] = None
    meta: Dict[str, Any] = {}
