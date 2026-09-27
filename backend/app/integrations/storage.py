import abc
import os
import uuid
from typing import Optional, Tuple
from app.core.config import settings
from app.core.logging import logger


class StorageProvider(abc.ABC):
    @abc.abstractmethod
    def save_image(self, file_bytes: bytes, filename: str, mime_type: str, folder: str = "reports") -> Tuple[str, str]:
        """Save file and return (storage_path, public_or_signed_url)."""
        pass

    @abc.abstractmethod
    def delete_image(self, storage_path: str) -> bool:
        """Delete file from storage."""
        pass


class LocalStorageProvider(StorageProvider):
    def __init__(self, upload_dir: str = settings.STORAGE_LOCAL_DIR):
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    def save_image(self, file_bytes: bytes, filename: str, mime_type: str, folder: str = "reports") -> Tuple[str, str]:
        folder_path = os.path.join(self.upload_dir, folder)
        os.makedirs(folder_path, exist_ok=True)

        ext = "jpg"
        if "png" in mime_type:
            ext = "png"
        elif "webp" in mime_type:
            ext = "webp"
        elif "." in filename:
            ext = filename.rsplit(".", 1)[-1].lower()

        safe_filename = f"{uuid.uuid4().hex}.{ext}"
        storage_path = os.path.join(folder, safe_filename)
        absolute_file_path = os.path.join(self.upload_dir, storage_path)

        with open(absolute_file_path, "wb") as f:
            f.write(file_bytes)

        # Return relative URL served by static/API endpoint
        public_url = f"/api/v1/uploads/{folder}/{safe_filename}"
        return storage_path, public_url

    def delete_image(self, storage_path: str) -> bool:
        try:
            full_path = os.path.join(self.upload_dir, storage_path)
            if os.path.exists(full_path):
                os.remove(full_path)
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting file {storage_path}: {e}")
            return False


class SupabaseStorageProvider(StorageProvider):
    def __init__(self, supabase_url: str, supabase_key: str, bucket: str = "sahayak-media"):
        self.supabase_url = supabase_url
        self.supabase_key = supabase_key
        self.bucket = bucket
        self.fallback = LocalStorageProvider()

    def save_image(self, file_bytes: bytes, filename: str, mime_type: str, folder: str = "reports") -> Tuple[str, str]:
        if not self.supabase_url or not self.supabase_key:
            return self.fallback.save_image(file_bytes, filename, mime_type, folder)
        
        ext = "jpg" if "jpeg" in mime_type or "jpg" in mime_type else "png"
        safe_name = f"{folder}/{uuid.uuid4().hex}.{ext}"
        try:
            from supabase import create_client
            client = create_client(self.supabase_url, self.supabase_key)
            client.storage.from_(self.bucket).upload(
                path=safe_name,
                file=file_bytes,
                file_options={"content-type": mime_type}
            )
            public_url = client.storage.from_(self.bucket).get_public_url(safe_name)
            return safe_name, public_url
        except Exception as e:
            logger.warning(f"Supabase upload failed, falling back to local: {e}")
            return self.fallback.save_image(file_bytes, filename, mime_type, folder)

    def delete_image(self, storage_path: str) -> bool:
        if self.supabase_url and self.supabase_key:
            try:
                from supabase import create_client
                client = create_client(self.supabase_url, self.supabase_key)
                client.storage.from_(self.bucket).remove([storage_path])
                return True
            except Exception as e:
                logger.warning(f"Supabase delete failed: {e}")
        return self.fallback.delete_image(storage_path)


def get_storage_provider() -> StorageProvider:
    if settings.STORAGE_PROVIDER == "supabase" and settings.SUPABASE_URL:
        return SupabaseStorageProvider(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY, settings.SUPABASE_STORAGE_BUCKET)
    return LocalStorageProvider()
