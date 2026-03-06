"""Async database engine and session management."""
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# Engine configuration with SSL support for cloud databases like Neon
engine_kwargs = {
    "echo": settings.DEBUG,
    "pool_size": 20,
    "max_overflow": 10,
    "pool_pre_ping": True,
}

if settings.DATABASE_SSL:
    engine_kwargs["connect_args"] = {"ssl": True}

engine = create_async_engine(
    settings.DATABASE_URL,
    **engine_kwargs
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:
    """Dependency: yields an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
