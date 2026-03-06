"""User model — app-level profile linked to Auth0 identity."""
from sqlalchemy import Column, String, Boolean, Float, Integer, Text
from sqlalchemy.orm import relationship
from app.models.base import Base, UUIDMixin, TimestampMixin


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    auth0_id = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    phone = Column(String(20), nullable=True)
    phone_verified = Column(Boolean, default=False)
    bio = Column(Text, nullable=True)
    location = Column(String(200), nullable=True)
    rating = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    role = Column(String(20), default="user")  # user, moderator, admin

    # Relationships
    listings = relationship("Listing", back_populates="seller", lazy="selectin", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", lazy="selectin", cascade="all, delete-orphan")
    sent_messages = relationship("Message", back_populates="sender", lazy="selectin", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.display_name} ({self.email})>"
