import os
import shutil
from pathlib import Path
from typing import Optional
from app.core.config import settings

try:
    import boto3
    from botocore.config import Config
    HAS_BOTO3 = True
except ImportError:
    HAS_BOTO3 = False

class StorageService:
    @staticmethod
    def _get_s3_client():
        if not HAS_BOTO3 or not settings.S3_BUCKET_NAME:
            return None
            
        kwargs = {
            "aws_access_key_id": settings.S3_ACCESS_KEY,
            "aws_secret_access_key": settings.S3_SECRET_KEY,
            "config": Config(signature_version="s3v4")
        }
        if settings.S3_ENDPOINT_URL:
            kwargs["endpoint_url"] = settings.S3_ENDPOINT_URL
            
        return boto3.client("s3", **kwargs)

    @staticmethod
    def upload_file(file_obj, filename: str, content_type: Optional[str] = None) -> str:
        """
        Uploads a file to S3 / Cloudflare R2 if configured, or saves to local UPLOADS_DIR.
        Returns the persistent file_path or S3 key/URL.
        """
        s3_client = StorageService._get_s3_client()
        
        if s3_client:
            extra_args = {}
            if content_type:
                extra_args["ContentType"] = content_type
                
            s3_key = f"documents/{filename}"
            s3_client.upload_fileobj(
                file_obj,
                settings.S3_BUCKET_NAME,
                s3_key,
                ExtraArgs=extra_args
            )
            print(f"[+] Uploaded {filename} to S3 bucket '{settings.S3_BUCKET_NAME}' key '{s3_key}'")
            return f"s3://{settings.S3_BUCKET_NAME}/{s3_key}"
        else:
            # Fallback to local disk
            destination = settings.UPLOADS_DIR / filename
            with open(destination, "wb") as buffer:
                shutil.copyfileobj(file_obj, buffer)
            print(f"[+] Saved {filename} to local storage at {destination}")
            return str(destination)

    @staticmethod
    def generate_presigned_url(file_path: str, expiration: int = 3600) -> str:
        """Generates a signed URL for secure document access, or returns local file path."""
        if file_path.startswith("s3://"):
            s3_client = StorageService._get_s3_client()
            if s3_client:
                # Extract key
                parts = file_path.replace("s3://", "").split("/", 1)
                bucket = parts[0]
                key = parts[1] if len(parts) > 1 else ""
                url = s3_client.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": bucket, "Key": key},
                    ExpiresIn=expiration
                )
                return url
        return file_path

    @staticmethod
    def delete_file(file_path: str):
        """Removes a file from S3 or local disk."""
        if file_path.startswith("s3://"):
            s3_client = StorageService._get_s3_client()
            if s3_client:
                parts = file_path.replace("s3://", "").split("/", 1)
                bucket = parts[0]
                key = parts[1] if len(parts) > 1 else ""
                s3_client.delete_object(Bucket=bucket, Key=key)
        else:
            if os.path.exists(file_path):
                os.remove(file_path)
