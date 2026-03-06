"""Media upload endpoints (presigned URLs)."""
from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
import uuid

router = APIRouter(prefix="/media", tags=["media"])


@router.post("/presign")
async def get_presigned_url(
    filename: str,
    content_type: str = "image/jpeg",
    _: dict = Depends(get_current_user),
):
    """Generate a presigned URL for direct upload to S3.
    In production, this would use boto3 to generate actual presigned URLs.
    For local development, returns a mock URL.
    """
    file_key = f"listings/{uuid.uuid4()}/{filename}"

    # In production:
    # import boto3
    # s3 = boto3.client('s3', ...)
    # presigned = s3.generate_presigned_url('put_object', Params={...}, ExpiresIn=3600)

    return {
        "upload_url": f"https://marketplace-media.s3.eu-north-1.amazonaws.com/{file_key}",
        "file_key": file_key,
        "public_url": f"https://cdn.marketplace.local/{file_key}",
    }
