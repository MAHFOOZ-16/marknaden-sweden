"""Favorites endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.favorite import Favorite
from app.models.listing import Listing, ListingStatus
from app.models.user import User
from app.schemas.schemas import FavoriteResponse, MessageOut

router = APIRouter(prefix="/favorites", tags=["favorites"])


async def _get_user(db: AsyncSession, user_claims: dict) -> User:
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
    return user


@router.get("", response_model=List[FavoriteResponse])
async def list_favorites(
    user_claims: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's favorites."""
    user = await _get_user(db, user_claims)
    result = await db.execute(
        select(Favorite)
        .join(Favorite.listing)
        .where(
            Favorite.user_id == user.id,
            Listing.status != ListingStatus.REMOVED
        )
        .options(
            selectinload(Favorite.listing).selectinload(Listing.seller),
            selectinload(Favorite.listing).selectinload(Listing.media),
        )
        .order_by(Favorite.created_at.desc())
    )
    return result.scalars().all()


@router.post("/{listing_id}", response_model=FavoriteResponse, status_code=201)
async def add_favorite(
    listing_id: UUID,
    user_claims: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a listing to favorites."""
    user = await _get_user(db, user_claims)

    # Check listing exists
    listing_result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = listing_result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Check not already favorited
    existing = await db.execute(
        select(Favorite).where(Favorite.user_id == user.id, Favorite.listing_id == listing_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Already in favorites")

    favorite = Favorite(user_id=user.id, listing_id=listing_id)
    db.add(favorite)

    # Increment listing favorite count
    listing.favorite_count += 1

    await db.flush()
    
    # Reload with relationships fully eager loaded
    result = await db.execute(
        select(Favorite)
        .where(Favorite.id == favorite.id)
        .options(
            selectinload(Favorite.listing).selectinload(Listing.seller),
            selectinload(Favorite.listing).selectinload(Listing.media),
            selectinload(Favorite.listing).selectinload(Listing.category)
        )
    )
    loaded_favorite = result.scalar_one()
    return loaded_favorite


@router.delete("/{listing_id}", response_model=MessageOut)
async def remove_favorite(
    listing_id: UUID,
    user_claims: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a listing from favorites."""
    user = await _get_user(db, user_claims)

    result = await db.execute(
        select(Favorite).where(Favorite.user_id == user.id, Favorite.listing_id == listing_id)
    )
    favorite = result.scalar_one_or_none()
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")

    await db.delete(favorite)

    # Decrement listing favorite count
    listing_result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = listing_result.scalar_one_or_none()
    if listing and listing.favorite_count > 0:
        listing.favorite_count -= 1

    await db.flush()
    return MessageOut(message="Favorite removed")
