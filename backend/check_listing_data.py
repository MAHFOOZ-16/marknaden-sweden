import asyncio
from sqlalchemy import select
from app.models.listing import Listing, ListingMedia
from app.core.config import settings
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

async def check():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as db:
        res = await db.execute(
            select(Listing.title, ListingMedia.url)
            .join(ListingMedia)
            .filter(Listing.title.in_(['Tesla Model 3 LR 2023', 'Smart Home Bundle - Philips Hue']))
        )
        rows = res.all()
        for title, url in rows:
            print(f"{title}: {url}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check())
