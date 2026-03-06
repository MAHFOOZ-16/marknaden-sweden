import asyncio
from sqlalchemy import select, update
from app.models.listing import Listing, ListingMedia
from app.core.config import settings
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# Explicit, confirmed working URLs
FIXES = {
    "Tesla Model 3 LR 2023": "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
    "Smart Home Bundle - Philips Hue": "https://images.unsplash.com/photo-1558002038-1055907df827?w=800",
    "Specialized Tarmac SL7 Road Bike": "https://images.unsplash.com/photo-1649651244819-79b28e4a9ce1?auto=format&fit=crop&q=80&w=800",
    "Head Kore 99 Skis 180cm": "https://images.unsplash.com/photo-1642366188419-2dcdd1bfe54a?auto=format&fit=crop&q=80&w=800",
    "Mid-Century Teak Sideboard": "https://images.unsplash.com/photo-1721385675060-9982ec72385e?auto=format&fit=crop&q=80&w=800",
    "IKEA SÖDERHAMN Corner Sofa": "https://images.unsplash.com/photo-1759722668253-1767030ad9b2?auto=format&fit=crop&q=80&w=800"
}

async def fix():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as db:
        for title, url in FIXES.items():
            print(f"🛠 Fixing {title} -> {url}")
            # Get listing ID
            res = await db.execute(select(Listing).filter(Listing.title == title))
            listing = res.scalar_one_or_none()
            if listing:
                print(f"  Found listing ID: {listing.id}")
                # Update all media associated with this listing
                # Using hard update to be sure
                await db.execute(
                    update(ListingMedia)
                    .where(ListingMedia.listing_id == listing.id)
                    .values(url=url, thumbnail_url=url.replace("w=800", "w=400"))
                )
            else:
                print(f"  ❌ Listing '{title}' NOT FOUND!")
        
        await db.commit()
        print("✅ Finished targeted fix.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(fix())
