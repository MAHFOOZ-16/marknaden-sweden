"""Listings CRUD endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from typing import Optional
from uuid import UUID
import math

from app.core.database import get_db
from app.core.auth import get_current_user, get_optional_user
from app.models.listing import Listing, ListingMedia, ListingStatus, Category
from app.models.user import User
from app.schemas.schemas import (
    ListingCreate, ListingUpdate, ListingResponse, ListingListResponse
)

router = APIRouter(prefix="/listings", tags=["listings"])


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


@router.get("", response_model=ListingListResponse)
async def list_listings(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    condition: Optional[str] = None,
    city: Optional[str] = None,
    sort_by: Optional[str] = Query("newest", regex="^(newest|oldest|price_asc|price_desc|popular)$"),
    db: AsyncSession = Depends(get_db),
):
    """List listings with filters, search, and pagination."""
    query = select(Listing).where(Listing.status == ListingStatus.ACTIVE)

    # Filters
    if category:
        query = query.join(Category).where(Category.slug == category)
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Listing.title.ilike(search_term),
                Listing.description.ilike(search_term),
            )
        )
    if min_price is not None:
        query = query.where(Listing.price >= min_price)
    if max_price is not None:
        query = query.where(Listing.price <= max_price)
    if condition:
        query = query.where(Listing.condition == condition)
    if city:
        query = query.where(Listing.location_city.ilike(f"%{city}%"))

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Sorting
    if sort_by == "oldest":
        query = query.order_by(Listing.created_at.asc())
    elif sort_by == "price_asc":
        query = query.order_by(Listing.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Listing.price.desc())
    elif sort_by == "popular":
        query = query.order_by(Listing.view_count.desc())
    else:
        query = query.order_by(Listing.created_at.desc())

    # Pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    query = query.options(
        selectinload(Listing.seller),
        selectinload(Listing.category),
        selectinload(Listing.media),
    )

    result = await db.execute(query)
    listings = result.scalars().all()

    return ListingListResponse(
        items=listings,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 0,
    )


@router.get("/{listing_id}", response_model=ListingResponse)
async def get_listing(listing_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get a single listing by ID."""
    query = select(Listing).where(Listing.id == listing_id).options(
        selectinload(Listing.seller),
        selectinload(Listing.category),
        selectinload(Listing.media),
    )
    result = await db.execute(query)
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Increment view count
    listing.view_count += 1
    await db.flush()

    return listing


@router.post("", response_model=ListingResponse, status_code=201)
async def create_listing(
    data: ListingCreate,
    user_claims: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new listing."""
    try:
        user = await get_or_create_user(db, user_claims)

        listing = Listing(
            seller_id=user.id,
            title=data.title,
            description=data.description,
            price=data.price,
            currency=data.currency,
            category_id=data.category_id,
            condition=data.condition,
            location_city=data.location_city,
            location_region=data.location_region,
            shipping_available=data.shipping_available,
            shipping_cost=data.shipping_cost,
            status=ListingStatus.ACTIVE,
        )
        db.add(listing)
        await db.flush()

        # Add media
        if data.media_urls:
            for i, url in enumerate(data.media_urls):
                media = ListingMedia(
                    listing_id=listing.id,
                    url=url,
                    sort_order=i,
                )
                db.add(media)
            await db.flush()

        # Reload with relationships
        await db.refresh(listing)
        return listing
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{listing_id}", response_model=ListingResponse)
async def update_listing(
    listing_id: UUID,
    data: ListingUpdate,
    user_claims: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a listing (owner only)."""
    user = await get_or_create_user(db, user_claims)

    query = select(Listing).where(Listing.id == listing_id).options(
        selectinload(Listing.seller),
        selectinload(Listing.category),
        selectinload(Listing.media),
    )
    result = await db.execute(query)
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.seller_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this listing")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(listing, field, value)

    await db.flush()
    await db.refresh(listing)
    return listing


@router.delete("/{listing_id}", status_code=204)
async def delete_listing(
    listing_id: UUID,
    user_claims: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete a listing (mark as removed)."""
    user = await get_or_create_user(db, user_claims)

    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.seller_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    listing.status = ListingStatus.REMOVED
    await db.flush()
