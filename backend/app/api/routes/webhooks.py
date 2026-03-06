"""Webhook endpoints for payment providers."""
from fastapi import APIRouter, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import Depends
import json

from app.core.database import get_db
from app.core.config import settings
from app.models.order import Order, Payment, OrderStatus, PaymentStatus
from app.models.listing import Listing, ListingStatus

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/stripe")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Handle Stripe webhook events. In production, verify signature."""
    payload = await request.body()

    # In production: verify Stripe signature
    # sig_header = request.headers.get("stripe-signature")
    # try:
    #     event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    # except Exception:
    #     raise HTTPException(status_code=400, detail="Invalid signature")

    try:
        event = json.loads(payload)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = event.get("type", "")

    if event_type == "payment_intent.succeeded":
        intent = event.get("data", {}).get("object", {})
        intent_id = intent.get("id", "")

        result = await db.execute(select(Payment).where(Payment.intent_id == intent_id))
        payment = result.scalar_one_or_none()
        if payment:
            payment.status = PaymentStatus.SUCCEEDED
            payment.raw_webhook_event = event

            # Update order
            order_result = await db.execute(select(Order).where(Order.id == payment.order_id))
            order = order_result.scalar_one_or_none()
            if order:
                order.status = OrderStatus.PAID

                # Mark listing as sold
                listing_result = await db.execute(select(Listing).where(Listing.id == order.listing_id))
                listing = listing_result.scalar_one_or_none()
                if listing:
                    listing.status = ListingStatus.SOLD

            await db.flush()

    elif event_type == "payment_intent.payment_failed":
        intent = event.get("data", {}).get("object", {})
        intent_id = intent.get("id", "")

        result = await db.execute(select(Payment).where(Payment.intent_id == intent_id))
        payment = result.scalar_one_or_none()
        if payment:
            payment.status = PaymentStatus.FAILED
            payment.raw_webhook_event = event

            # Unreserve listing
            order_result = await db.execute(select(Order).where(Order.id == payment.order_id))
            order = order_result.scalar_one_or_none()
            if order:
                order.status = OrderStatus.CANCELLED
                listing_result = await db.execute(select(Listing).where(Listing.id == order.listing_id))
                listing = listing_result.scalar_one_or_none()
                if listing:
                    listing.status = ListingStatus.ACTIVE

            await db.flush()

    return {"status": "received"}


@router.post("/klarna")
async def klarna_webhook(request: Request):
    """Placeholder for Klarna webhooks (Phase 2)."""
    return {"status": "received"}


@router.post("/swish")
async def swish_webhook(request: Request):
    """Placeholder for Swish webhooks (Phase 2)."""
    return {"status": "received"}
