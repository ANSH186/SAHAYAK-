from typing import Any, Dict, Optional


def api_response(data: Any = None, error: Optional[Dict[str, Any]] = None, meta: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    return {
        "data": data,
        "error": error,
        "meta": meta or {}
    }


def api_error(code: str, message: str, meta: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    return {
        "data": None,
        "error": {
            "code": code,
            "message": message
        },
        "meta": meta or {}
    }
