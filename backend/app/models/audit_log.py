"""Audit log for tracking all significant actions."""
from sqlalchemy import Column, String, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, UUIDMixin, TimestampMixin


class AuditLog(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "audit_log"

    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)  # e.g. listing.created, order.paid
    entity_type = Column(String(50), nullable=False, index=True)  # user, listing, order, payment
    entity_id = Column(String(100), nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True)  # Additional context
    ip_address = Column(String(45), nullable=True)

    def __repr__(self):
        return f"<AuditLog {self.action} on {self.entity_type}:{self.entity_id}>"
