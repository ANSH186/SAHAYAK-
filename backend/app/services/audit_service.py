import json
import uuid
from typing import Any, Dict, Optional
from sqlalchemy.orm import Session
from app.db.models.audit import AuditLog
from app.repositories.audit import AuditRepository


class AuditService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AuditRepository(db)

    def log(
        self,
        event_type: str,
        description: str,
        actor_id: Optional[str] = None,
        actor_name: Optional[str] = None,
        actor_role: Optional[str] = "STUDENT",
        case_id: Optional[str] = None,
        status: str = "SUCCESS",
        metadata: Optional[Dict[str, Any]] = None
    ) -> AuditLog:
        # Never log credentials, password hashes or tokens
        safe_meta = {}
        if metadata:
            for k, v in metadata.items():
                if any(secret in k.lower() for secret in ["password", "token", "secret", "hash", "key", "answer"]):
                    continue
                safe_meta[k] = str(v)

        log_entry = AuditLog(
            id=f"aud_{uuid.uuid4().hex[:10]}",
            actor_id=actor_id,
            actor_name=actor_name,
            actor_role=actor_role or "STUDENT",
            event_type=event_type,
            case_id=case_id,
            status=status,
            description=description,
            metadata_json=json.dumps(safe_meta)
        )
        return self.repo.log(log_entry)
