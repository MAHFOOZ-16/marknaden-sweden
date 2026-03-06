"""Order and checkout endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.order import Order, Payment, OrderStatus, PaymentStatus, PaymentProvider
from app.models.listing import Listing, ListingStatus
from app.models.user import User
from app.schemas.schemas import CheckoutRequest, OrderResponse, PaymentIntentResponse

router = APIRouter(prefix="/orders", tags=["orders"])

PLATFORM_FEE_PERCENT = 5.0  # 5% platform fee


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


@router.post("/checkout", response_model=PaymentIntentResponse)
async def create_checkout(
    data: CheckoutRequest,
    user_claims: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create an order and payment intent."""
    user = await _get_user(db, user_claims)

    # Get listing
    listing_result = await db.execute(select(Listing).where(Listing.id == data.listing_id))
    listing = listing_result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.status != ListingStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Listing is not available")
    if listing.seller_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot buy your own listing")

    # Calculate amounts
    shipping_cost = listing.shipping_cost or 0
    subtotal = listing.price + shipping_cost
    platform_fee = round(listing.price * (PLATFORM_FEE_PERCENT / 100), 2)
    total = subtotal + platform_fee

    # Create order
    order = Order(
        buyer_id=user.id,
        seller_id=listing.seller_id,
        listing_id=listing.id,
        status=OrderStatus.PENDING_PAYMENT,
        amount=total,
        currency=listing.currency,
        platform_fee=platform_fee,
        shipping_cost=shipping_cost,
        shipping_address=data.shipping_address,
    )
    db.add(order)
    await db.flush()

    # Reserve listing
    listing.status = ListingStatus.RESERVED

    # Create payment record (in real app, create Stripe PaymentIntent here)
    client_secret = f"pi_mock_{order.id}_secret"  # Mock for local dev
    payment = Payment(
        order_id=order.id,
        provider=PaymentProvider.STRIPE,
        provider_ref=f"pi_mock_{order.id}",
        intent_id=f"pi_mock_{order.id}",
        status=PaymentStatus.PENDING,
        amount=total,
        currency=listing.currency,
    )
    db.add(payment)
    await db.flush()

    return PaymentIntentResponse(
        order_id=order.id,
        client_secret=client_secret,
        payment_provider=data.payment_provider,
        amount=total,
        currency=listing.currency,
    )


@router.get("", response_model=list[OrderResponse])
async def list_orders(
    user_claims: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's orders (as buyer)."""
    user = await _get_user(db, user_claims)
    result = await db.execute(
        select(Order)
        .where(Order.buyer_id == user.id)
        .order_by(Order.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: UUID,
    user_claims: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific order."""
    user = await _get_user(db, user_claims)
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.buyer_id != user.id and order.seller_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return order
