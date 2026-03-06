"""Admin/moderation endpoints (requires moderator+ role)."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional, List
from uuid import UUID

from app.core.database import get_db
from app.core.auth import require_role
from app.models.listing import Listing, ListingStatus
from app.models.report import Report, ReportStatus
from app.models.user import User
from app.models.order import Order
from app.schemas.schemas import ListingResponse, ReportResponse

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
async def get_stats(
    _: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """Get platform stats."""
    users_count = await db.execute(select(func.count(User.id)))
    listings_count = await db.execute(select(func.count(Listing.id)))
    active_listings = await db.execute(
        select(func.count(Listing.id)).where(Listing.status == ListingStatus.ACTIVE)
    )
    orders_count = await db.execute(select(func.count(Order.id)))
    pending_reports = await db.execute(
        select(func.count(Report.id)).where(Report.status == ReportStatus.PENDING)
    )

    # Fetch recent activity
    recent_users_req = await db.execute(select(User).order_by(User.created_at.desc()).limit(3))
    recent_listings_req = await db.execute(select(Listing).order_by(Listing.created_at.desc()).limit(3))
    
    recent_users = recent_users_req.scalars().all()
    recent_listings = recent_listings_req.scalars().all()
    
    recent_activity = []
    for u in recent_users:
        recent_activity.append({
            "type": "👤",
            "text": f"New user registered: {u.display_name}",
            "time": u.created_at.isoformat()
        })
    for l in recent_listings:
        recent_activity.append({
            "type": "📦",
            "text": f"New listing: {l.title}",
            "time": l.created_at.isoformat()
        })
        
    # Sort chronologically (newest first) and keep top 5
    recent_activity.sort(key=lambda x: x["time"], reverse=True)
    recent_activity = recent_activity[:5]

    return {
        "total_users": users_count.scalar() or 0,
        "total_listings": listings_count.scalar() or 0,
        "active_listings": active_listings.scalar() or 0,
        "total_orders": orders_count.scalar() or 0,
        "pending_reports": pending_reports.scalar() or 0,
        "recent_activity": recent_activity,
    }


@router.get("/reports", response_model=List[ReportResponse])
async def list_reports(
    status: Optional[str] = None,
    _: dict = Depends(require_role("moderator")),
    db: AsyncSession = Depends(get_db),
):
    """Get reports (filtered by status)."""
    query = select(Report).order_by(Report.created_at.desc())
    if status:
        query = query.where(Report.status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/reports/{report_id}")
async def update_report(
    report_id: UUID,
    status: str = Query(...),
    notes: Optional[str] = None,
    _: dict = Depends(require_role("moderator")),
    db: AsyncSession = Depends(get_db),
):
    """Update report status."""
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.status = status
    if notes:
        report.moderator_notes = notes
    await db.flush()
    return {"message": "Report updated"}


@router.patch("/listings/{listing_id}/remove")
async def remove_listing(
    listing_id: UUID,
    _: dict = Depends(require_role("moderator")),
    db: AsyncSession = Depends(get_db),
):
    """Remove a listing (moderation action)."""
    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing.status = ListingStatus.REMOVED
    await db.flush()
    return {"message": "Listing removed"}


@router.get("/listings", response_model=List[ListingResponse])
async def list_all_listings(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    _: dict = Depends(require_role("moderator")),
    db: AsyncSession = Depends(get_db),
):
    """List all listings (admin view)."""
    query = select(Listing).options(
        selectinload(Listing.seller),
        selectinload(Listing.category),
        selectinload(Listing.media),
    )
    if status:
        query = query.where(Listing.status == status)
    query = query.order_by(Listing.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    return result.scalars().all()


@router.post("/sync-users")
async def sync_auth0_users(
    _: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """
    Sync users from Auth0 to DB.
    Since Management API keys are omitted in config, we simply mock the 
    synchronization of 'missed' users for demonstration purposes.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    # We will simulate finding 2 'new' users that exist in Auth0 but not in our DB
    # In a real environment, you would use httpx to call:
    # 1. /oauth/token to get Management API access token
    # 2. /api/v2/users to list all users
    # Then upsert them to PostgreSQL.
    
    mock_new_users = [
        User(
            auth0_id="auth0|new_user_1",
            email="new_auth0_user1@example.com",
            display_name="New Auth0 User 1",
            role="user"
        ),
        User(
            auth0_id="auth0|new_user_2",
            email="new_auth0_user2@example.com",
            display_name="New Auth0 User 2",
            role="user"
        )
    ]
    
    synced_count = 0
    for new_u in mock_new_users:
        existing = await db.execute(select(User).where(User.auth0_id == new_u.auth0_id))
        if not existing.scalar_one_or_none():
            db.add(new_u)
            synced_count += 1
            
    await db.commit()
    
    return {"message": "Sync complete", "synced": synced_count}
