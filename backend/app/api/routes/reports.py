"""Report submission endpoint."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.report import Report
from app.models.user import User
from app.schemas.schemas import ReportCreate, ReportResponse

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("", response_model=ReportResponse, status_code=201)
async def create_report(
    data: ReportCreate,
    user_claims: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Report a listing or user."""
    auth0_id = user_claims.get("sub", "")
    result = await db.execute(select(User).where(User.auth0_id == auth0_id))
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            auth0_id=auth0_id,
            email=user_claims.get("email", f"{auth0_id}@marketplace.local"),
            display_name=user_claims.get("name", "New User"),
        )
        db.add(user)
        await db.flush()

    report = Report(
        reporter_id=user.id,
        listing_id=data.listing_id,
        reported_user_id=data.reported_user_id,
        reason=data.reason,
        description=data.description,
    )
    db.add(report)
    await db.flush()
    await db.refresh(report)
    return report
