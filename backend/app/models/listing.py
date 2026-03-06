"""Listing, ListingMedia, and Category models."""
from sqlalchemy import Column, String, Text, Float, Integer, Boolean, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base, UUIDMixin, TimestampMixin


class ListingStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    SOLD = "sold"
    RESERVED = "reserved"
    EXPIRED = "expired"
    REMOVED = "removed"


class ListingCondition(str, enum.Enum):
    NEW = "new"
    LIKE_NEW = "like_new"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"


class Category(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "categories"

    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    icon = Column(String(50), nullable=True)  # Lucide icon name
    description = Column(Text, nullable=True)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    sort_order = Column(Integer, default=0)

    # Relationships
    parent = relationship("Category", remote_side="Category.id", lazy="selectin")
    listings = relationship("Listing", back_populates="category", lazy="selectin")

    def __repr__(self):
        return f"<Category {self.name}>"


class Listing(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "listings"

    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    currency = Column(String(3), default="SEK")
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False, index=True)
    condition = Column(Enum(ListingCondition), default=ListingCondition.GOOD)
    status = Column(Enum(ListingStatus), default=ListingStatus.ACTIVE, index=True)

    # Location
    location_city = Column(String(100), nullable=True)
    location_region = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Shipping
    shipping_available = Column(Boolean, default=False)
    shipping_cost = Column(Float, nullable=True)

    # Stats
    view_count = Column(Integer, default=0)
    favorite_count = Column(Integer, default=0)

    # Relationships
    seller = relationship("User", back_populates="listings", lazy="selectin")
    category = relationship("Category", back_populates="listings", lazy="selectin")
    media = relationship("ListingMedia", back_populates="listing", lazy="selectin",
                          order_by="ListingMedia.sort_order")
    favorites = relationship("Favorite", back_populates="listing", lazy="selectin")

    def __repr__(self):
        return f"<Listing {self.title} ({self.price} {self.currency})>"


class ListingMedia(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "listing_media"

    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(Text, nullable=False)
    thumbnail_url = Column(Text, nullable=True)
    media_type = Column(String(20), default="image")  # image, video
    sort_order = Column(Integer, default=0)

    # Relationships
    listing = relationship("Listing", back_populates="media")

    def __repr__(self):
        return f"<ListingMedia {self.url}>"
