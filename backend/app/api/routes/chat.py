"""Chat/messaging endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.conversation import Conversation, Message
from app.models.user import User
from app.schemas.schemas import (
    ConversationCreate, ConversationResponse, MessageCreate, MessageResponse
)

router = APIRouter(prefix="/chat", tags=["chat"])


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


@router.get("/conversations", response_model=List[ConversationResponse])
async def list_conversations(
    user_claims: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all conversations for the current user."""
    user = await _get_user(db, user_claims)
    from sqlalchemy import func
    
    unread_subq = (
        select(func.count(Message.id))
        .where(
            Message.conversation_id == Conversation.id,
            Message.is_read == False,
            Message.sender_id != user.id
        )
        .correlate(Conversation)
        .scalar_subquery()
    )

    result = await db.execute(
        select(Conversation, unread_subq.label("unread_count"))
        .where(or_(Conversation.buyer_id == user.id, Conversation.seller_id == user.id))
        .options(
            selectinload(Conversation.buyer),
            selectinload(Conversation.seller),
            selectinload(Conversation.listing),
        )
        .order_by(Conversation.updated_at.desc())
    )
    
    conversations = []
    for conv, unread_count in result.all():
        conv.unread_count = unread_count or 0
        conversations.append(conv)
        
    return conversations


@router.get("/unread-count")
async def get_unread_count(
    user_claims: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get total number of unread messages for the user."""
    from sqlalchemy import func
    user = await _get_user(db, user_claims)
    result = await db.execute(
        select(func.count(Message.id))
        .join(Conversation, Message.conversation_id == Conversation.id)
        .where(
            Message.is_read == False,
            Message.sender_id != user.id,
            or_(Conversation.buyer_id == user.id, Conversation.seller_id == user.id)
        )
    )
    return {"count": result.scalar() or 0}


@router.post("/conversations", response_model=ConversationResponse, status_code=201)
async def create_conversation(
    data: ConversationCreate,
    user_claims: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Start a new conversation about a listing."""
    user = await _get_user(db, user_claims)

    if user.id == data.seller_id:
        raise HTTPException(status_code=400, detail="Cannot message yourself")

    # Check if conversation already exists
    existing = await db.execute(
        select(Conversation)
        .where(
            Conversation.listing_id == data.listing_id,
            Conversation.buyer_id == user.id,
            Conversation.seller_id == data.seller_id,
        )
        .options(
            selectinload(Conversation.buyer),
            selectinload(Conversation.seller),
            selectinload(Conversation.listing),
        )
    )
    existing_conv = existing.scalar_one_or_none()
    if existing_conv:
        # If it exists, append the new initial message instead of dropping it
        if data.initial_message.strip():
            message = Message(
                conversation_id=existing_conv.id,
                sender_id=user.id,
                content=data.initial_message,
            )
            message.sender = user # Eagerly load for Pydantic
            db.add(message)
            existing_conv.last_message_preview = data.initial_message[:200]
            await db.flush()
            # No need to refresh entire conversation to return it, we already have it
            return existing_conv
        return existing_conv

    conversation = Conversation(
        listing_id=data.listing_id,
        buyer_id=user.id,
        seller_id=data.seller_id,
        last_message_preview=data.initial_message[:200],
    )
    db.add(conversation)
    await db.flush()

    # Add initial message
    message = Message(
        conversation_id=conversation.id,
        sender_id=user.id,
        content=data.initial_message,
    )
    message.sender = user # Eagerly load for Pydantic
    db.add(message)
    await db.flush()
    # Need to load relationships for a new conversation to satisfy ConversationResponse
    await db.refresh(conversation, ["buyer", "seller", "listing"])
    return conversation


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    conversation_id: UUID,
    mark_read: bool = Query(True),
    user_claims: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get messages in a conversation."""
    user = await _get_user(db, user_claims)

    # Verify user is part of conversation
    conv_result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = conv_result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conversation.buyer_id != user.id and conversation.seller_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .options(selectinload(Message.sender))
        .order_by(Message.created_at.asc())
    )
    messages = result.scalars().all()

    # Mark unread messages as read
    if mark_read:
        for msg in messages:
            if msg.sender_id != user.id and not msg.is_read:
                msg.is_read = True
        await db.flush()

    return list(messages)


@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse, status_code=201)
async def send_message(
    conversation_id: UUID,
    data: MessageCreate,
    user_claims: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a message in a conversation."""
    user = await _get_user(db, user_claims)

    # Verify user is part of conversation
    conv_result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = conv_result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conversation.buyer_id != user.id and conversation.seller_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    message = Message(
        conversation_id=conversation_id,
        sender_id=user.id,
        content=data.content,
        attachment_url=data.attachment_url,
    )
    db.add(message)

    # Update conversation preview
    conversation.last_message_preview = data.content[:200]

    await db.flush()
    # Refresh to get DB-generated fields like id, created_at
    await db.refresh(message)
    # Re-assign sender AFTER refresh to prevent lazy load errors during Pydantic serialization
    message.sender = user
    return message
