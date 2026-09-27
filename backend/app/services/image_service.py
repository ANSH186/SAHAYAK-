import uuid
from typing import Optional, Tuple
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models.image import ItemImage, ImageSource
from app.integrations.storage import get_storage_provider
from app.integrations.vision import get_vision_provider
from app.repositories.reports import ReportRepository


class ImageService:
    def __init__(self, db: Session):
        self.db = db
        self.storage = get_storage_provider()
        self.vision = get_vision_provider()
        self.report_repo = ReportRepository(db)

    async def process_and_save_upload(
        self,
        report_id: str,
        file: UploadFile,
        source_type: str = ImageSource.USER_UPLOADED.value,
        is_primary: bool = False
    ) -> ItemImage:
        content = await file.read()
        
        # 1. Validate file size
        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if len(content) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
            )

        # 2. Validate image structure & MIME type via vision provider
        is_valid, detected_mime, dims = self.vision.validate_image(content)
        if not is_valid or detected_mime not in settings.ALLOWED_IMAGE_MIMES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid image file format. Allowed types: JPEG, PNG, WEBP."
            )

        # 3. Store file safely
        storage_path, public_url = self.storage.save_image(
            file_bytes=content,
            filename=file.filename or "upload.jpg",
            mime_type=detected_mime,
            folder=f"reports/{report_id}"
        )

        width, height = dims if dims else (800, 600)

        # 4. Save Image DB entity
        image_record = ItemImage(
            id=f"img_{uuid.uuid4().hex[:10]}",
            report_id=report_id,
            storage_path=storage_path,
            url=public_url,
            source_type=source_type,
            mime_type=detected_mime,
            file_size=len(content),
            width=width,
            height=height,
            is_primary=is_primary,
            is_reference=False
        )

        return self.report_repo.add_image(image_record)
