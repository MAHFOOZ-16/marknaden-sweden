"""Report model for flagging listings/users."""
from sqlalchemy import Column, String, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base, UUIDMixin, TimestampMixin


class ReportStatus(str, enum.Enum):
    PENDING = "pending"
    REVIEWING = "reviewing"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class ReportReason(str, enum.Enum):
    SPAM = "spam"
    SCAM = "scam"
    INAPPROPRIATE = "inappropriate"
    PROHIBITED = "prohibited"
    WRONG_CATEGORY = "wrong_category"
    DUPLICATE = "duplicate"
    OTHER = "other"


class Report(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "reports"

    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"), nullable=True, index=True)
    reported_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    reason = Column(Enum(ReportReason), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(ReportStatus), default=ReportStatus.PENDING, index=True)
    moderator_notes = Column(Text, nullable=True)

    # Relationships
    reporter = relationship("User", foreign_keys=[reporter_id], lazy="selectin")
    reported_user = relationship("User", foreign_keys=[reported_user_id], lazy="selectin")
    listing = relationship("Listing", lazy="selectin")

    def __repr__(self):
        return f"<Report {self.id} reason={self.reason}>"
