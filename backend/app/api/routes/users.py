"""User profile endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.listing import Listing, ListingStatus
from pydantic import BaseModel, Field
from sqlalchemy.orm import selectinload
from app.schemas.schemas import UserResponse, UserPublicResponse, UserUpdate, ListingListResponse

class RateUserRequest(BaseModel):
    score: int = Field(..., ge=1, le=5)

router = APIRouter(prefix="/users", tags=["users"])


async def get_or_create_user(db: AsyncSession, user_claims: dict) -> User:
    """Get user from DB or create if first login."""
    auth0_id = user_claims.get("sub", "")
    result = await db.execute(select(User).where(User.auth0_id == auth0_id))
    user = result.scalar_one_or_none()
    if not user:
        email = user_claims.get("email", f"{auth0_id}@marketplace.local")
        role = "admin" if email == "mahfoozalikhan16@gmail.com" else "user"
        user = User(
            auth0_id=auth0_id,
            email=email,
            display_name=user_claims.get("name", "New User"),
            role=role,
        )
        db.add(user)
        await db.flush()
    else:
        # Sync email if it was previously saved as a placeholder
        auth0_email = user_claims.get("email")
        needs_sync = False
        if auth0_email and user.email.endswith("@marketplace.local"):
            user.email = auth0_email
            needs_sync = True
            
        if user.email == "mahfoozalikhan16@gmail.com" and user.role != "admin":
            user.role = "admin"
            needs_sync = True
            
        if needs_sync:
            db.add(user)
            await db.flush()
            
    return user


async def enrich_user_with_stats(db: AsyncSession, user: User) -> User:
    """Calculate and attach listing/sold counts to the user object for the response."""
    # Count non-removed listings
    listings_query = select(Listing).where(
        Listing.seller_id == user.id,
        Listing.status != ListingStatus.REMOVED
    )
    result = await db.execute(listings_query)
    user.listings_count = len(result.scalars().all())
    
    # Count sold listings
    sold_query = select(Listing).where(
        Listing.seller_id == user.id,
        Listing.status == ListingStatus.SOLD
    )
    result = await db.execute(sold_query)
    user.sold_count = len(result.scalars().all())
    
    return user


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    user_claims: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's profile."""
    user = await get_or_create_user(db, user_claims)
    user = await enrich_user_with_stats(db, user)
    return user


@router.patch("/me", response_model=UserResponse)
async def update_my_profile(
    data: UserUpdate,
    user_claims: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user's profile."""
    user = await get_or_create_user(db, user_claims)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    await db.flush()
    await db.refresh(user)
    await db.refresh(user)
    return user


@router.get("/me/listings", response_model=ListingListResponse)
async def get_my_listings(
    user_claims: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's listings including active and sold (but not removed)."""
    user = await get_or_create_user(db, user_claims)
    
    query = (
        select(Listing)
        .where(Listing.seller_id == user.id)
        .where(Listing.status != ListingStatus.REMOVED)
        .options(
            selectinload(Listing.seller),
            selectinload(Listing.category),
            selectinload(Listing.media),
        )
        .order_by(Listing.created_at.desc())
    )
    result = await db.execute(query)
    listings = result.scalars().all()
    
    return ListingListResponse(
        items=listings,
        total=len(listings),
        page=1,
        page_size=max(len(listings), 1),
        total_pages=1
    )

@router.get("", response_model=list[UserResponse])
async def list_users(
    user_claims: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all users (Admin only)."""
    current_user = await get_or_create_user(db, user_claims)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only administrators can list users")

    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    for user in users:
        await enrich_user_with_stats(db, user)
    return users


@router.get("/{user_id}", response_model=UserPublicResponse)
async def get_user_profile(user_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get a user's public profile."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user = await enrich_user_with_stats(db, user)
    return user


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: UUID,
    user_claims: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a user profile (Admin only)."""
    current_user = await get_or_create_user(db, user_claims)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only administrators can delete users")

    # Prevent self-deletion via admin panel for safety
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account here")

    result = await db.execute(select(User).where(User.id == user_id))
    target_user = result.scalar_one_or_none()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(target_user)
    await db.commit()

@router.post("/{user_id}/rate", response_model=UserPublicResponse)
async def rate_user(
    user_id: UUID,
    rating_data: RateUserRequest,
    _: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Rate a seller (1-5 stars) and update their average."""
    result = await db.execute(select(User).where(User.id == user_id))
    target_user = result.scalar_one_or_none()
    
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Calculate new average rating
    current_total = target_user.rating * target_user.rating_count
    target_user.rating_count += 1
    target_user.rating = (current_total + rating_data.score) / target_user.rating_count
    
    await db.commit()
    await db.refresh(target_user)
    return target_user
