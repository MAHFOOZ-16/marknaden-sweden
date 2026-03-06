"""Pydantic schemas for all API request/response models."""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum


# ═══════════════════════════════════════════
# Enums
# ═══════════════════════════════════════════

class ListingStatusEnum(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    SOLD = "sold"
    RESERVED = "reserved"
    EXPIRED = "expired"
    REMOVED = "removed"


class ListingConditionEnum(str, Enum):
    NEW = "new"
    LIKE_NEW = "like_new"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"


class OrderStatusEnum(str, Enum):
    CREATED = "created"
    PENDING_PAYMENT = "pending_payment"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    DISPUTED = "disputed"


class ReportReasonEnum(str, Enum):
    SPAM = "spam"
    SCAM = "scam"
    INAPPROPRIATE = "inappropriate"
    PROHIBITED = "prohibited"
    WRONG_CATEGORY = "wrong_category"
    DUPLICATE = "duplicate"
    OTHER = "other"


# ═══════════════════════════════════════════
# User
# ═══════════════════════════════════════════

class UserBase(BaseModel):
    display_name: str = Field(..., min_length=2, max_length=100)
    bio: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    auth0_id: str
    email: str

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

class UserResponse(UserBase):
    id: UUID
    email: str
    avatar_url: Optional[str] = None
    rating: float = 0.0
    rating_count: int = 0
    is_verified: bool = False
    role: str = "user"
    listings_count: int = 0
    sold_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}

class UserPublicResponse(BaseModel):
    id: UUID
    display_name: str
    avatar_url: Optional[str] = None
    rating: float = 0.0
    rating_count: int = 0
    is_verified: bool = False
    location: Optional[str] = None
    phone: Optional[str] = None
    listings_count: int = 0
    sold_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════
# Category
# ═══════════════════════════════════════════

class CategoryResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    icon: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[UUID] = None

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════
# Listing Media
# ═══════════════════════════════════════════

class MediaResponse(BaseModel):
    id: UUID
    url: str
    thumbnail_url: Optional[str] = None
    media_type: str = "image"
    sort_order: int = 0

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════
# Listing
# ═══════════════════════════════════════════

class ListingBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    price: float = Field(..., gt=0)
    currency: str = "SEK"
    category_id: UUID
    condition: ListingConditionEnum = ListingConditionEnum.GOOD
    location_city: Optional[str] = None
    location_region: Optional[str] = None
    shipping_available: bool = False
    shipping_cost: Optional[float] = None

class ListingCreate(ListingBase):
    media_urls: Optional[List[str]] = None

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    condition: Optional[ListingConditionEnum] = None
    status: Optional[ListingStatusEnum] = None
    location_city: Optional[str] = None
    location_region: Optional[str] = None
    shipping_available: Optional[bool] = None
    shipping_cost: Optional[float] = None

class ListingResponse(ListingBase):
    id: UUID
    seller_id: UUID
    status: ListingStatusEnum
    view_count: int = 0
    favorite_count: int = 0
    created_at: datetime
    updated_at: datetime
    seller: Optional[UserPublicResponse] = None
    category: Optional[CategoryResponse] = None
    media: List[MediaResponse] = []

    model_config = {"from_attributes": True}

class ListingListResponse(BaseModel):
    items: List[ListingResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# ═══════════════════════════════════════════
# Favorite
# ═══════════════════════════════════════════

class FavoriteResponse(BaseModel):
    id: UUID
    listing_id: UUID
    created_at: datetime
    listing: Optional[ListingResponse] = None

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════
# Chat
# ═══════════════════════════════════════════

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    attachment_url: Optional[str] = None

class MessageResponse(BaseModel):
    id: UUID
    conversation_id: UUID
    sender_id: UUID
    content: str
    is_read: bool = False
    attachment_url: Optional[str] = None
    message_type: str = "text"
    created_at: datetime
    sender: Optional[UserPublicResponse] = None

    model_config = {"from_attributes": True}

class ConversationCreate(BaseModel):
    listing_id: UUID
    seller_id: UUID
    initial_message: str = Field(..., min_length=1, max_length=2000)

class ConversationResponse(BaseModel):
    id: UUID
    listing_id: Optional[UUID] = None
    buyer_id: UUID
    seller_id: UUID
    last_message_preview: Optional[str] = None
    is_active: bool = True
    unread_count: int = 0
    created_at: datetime
    updated_at: datetime
    buyer: Optional[UserPublicResponse] = None
    seller: Optional[UserPublicResponse] = None
    listing: Optional[ListingResponse] = None

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════
# Order / Payment
# ═══════════════════════════════════════════

class CheckoutRequest(BaseModel):
    listing_id: UUID
    payment_provider: str = "stripe"  # stripe, klarna, swish
    shipping_address: Optional[str] = None

class OrderResponse(BaseModel):
    id: UUID
    buyer_id: UUID
    seller_id: UUID
    listing_id: UUID
    status: OrderStatusEnum
    amount: float
    currency: str
    platform_fee: float = 0.0
    shipping_cost: float = 0.0
    created_at: datetime
    listing: Optional[ListingResponse] = None

    model_config = {"from_attributes": True}

class PaymentIntentResponse(BaseModel):
    order_id: UUID
    client_secret: str
    payment_provider: str
    amount: float
    currency: str


# ═══════════════════════════════════════════
# Report
# ═══════════════════════════════════════════

class ReportCreate(BaseModel):
    listing_id: Optional[UUID] = None
    reported_user_id: Optional[UUID] = None
    reason: ReportReasonEnum
    description: Optional[str] = None

class ReportResponse(BaseModel):
    id: UUID
    reporter_id: UUID
    listing_id: Optional[UUID] = None
    reported_user_id: Optional[UUID] = None
    reason: ReportReasonEnum
    description: Optional[str] = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════
# Generic
# ═══════════════════════════════════════════

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str
    timestamp: datetime

class MessageOut(BaseModel):
    message: str
