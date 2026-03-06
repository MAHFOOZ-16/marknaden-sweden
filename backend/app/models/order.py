"""Order and Payment models."""
from sqlalchemy import Column, String, Float, Text, ForeignKey, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base, UUIDMixin, TimestampMixin


class OrderStatus(str, enum.Enum):
    CREATED = "created"
    PENDING_PAYMENT = "pending_payment"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    DISPUTED = "disputed"


class PaymentStatus(str, enum.Enum):
    CREATED = "created"
    PENDING = "pending"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    REFUNDED = "refunded"
    DISPUTED = "disputed"


class PaymentProvider(str, enum.Enum):
    STRIPE = "stripe"
    KLARNA = "klarna"
    SWISH = "swish"


class Order(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "orders"

    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"), nullable=False, index=True)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.CREATED, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="SEK")
    platform_fee = Column(Float, default=0.0)
    shipping_cost = Column(Float, default=0.0)
    shipping_address = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    # Relationships
    buyer = relationship("User", foreign_keys=[buyer_id], lazy="selectin")
    seller = relationship("User", foreign_keys=[seller_id], lazy="selectin")
    listing = relationship("Listing", lazy="selectin")
    payment = relationship("Payment", back_populates="order", uselist=False, lazy="selectin")

    def __repr__(self):
        return f"<Order {self.id} status={self.status}>"


class Payment(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "payments"

    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False, unique=True, index=True)
    provider = Column(Enum(PaymentProvider), nullable=False)
    provider_ref = Column(String(255), nullable=True, index=True)  # Stripe PaymentIntent ID etc.
    intent_id = Column(String(255), nullable=True)
    session_id = Column(String(255), nullable=True)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.CREATED, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="SEK")
    raw_webhook_event = Column(JSON, nullable=True)  # Full webhook payload for audit

    # Relationships
    order = relationship("Order", back_populates="payment")

    def __repr__(self):
        return f"<Payment {self.id} {self.provider} status={self.status}>"
