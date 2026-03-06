import asyncio
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.models.listing import Listing, ListingMedia, Category
from app.core.config import settings

# Updated working Unsplash URLs from seed_data.py
LISTING_IMAGES = {
    "electronics": [
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
        "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800",
        "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
    ],
    "furniture": [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800",
        "https://images.unsplash.com/photo-1505691938895-1758d7eaa511?w=800",
    ],
    "vehicles": [
        "https://images.unsplash.com/photo-1617788130097-38a97f338ca8?w=800",
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
        "https://images.unsplash.com/photo-1549416805-492160980119?w=800",
    ],
    "fashion": [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
    ],
    "sports": [
        "https://images.unsplash.com/photo-1532124958908-fb532c17436f?w=800",
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
    ],
    "home": [
        "https://images.unsplash.com/photo-1558002038-1055907df827?w=800",
        "https://images.unsplash.com/photo-1503602642458-232111445657?w=800",
        "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800",
    ],
    "books": [
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800",
    ],
    "garden": [
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
        "https://images.unsplash.com/photo-1589118944235-9141be135832?w=800",
    ],
}

# Known-good explicit URLs for specific titles
TARGET_IMAGES = {
    "Tesla Model 3 LR 2023": "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
    "Smart Home Bundle - Philips Hue": "https://images.unsplash.com/photo-1558002038-1055907df827?w=800",
    "Samsung 55\" QLED 4K TV": "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800",
    "Dyson V15 Detect Vacuum": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800",
    "Volvo V60 T6 AWD 2022": "https://images.unsplash.com/photo-1601051515286-63f58e1b1239?w=800",
    "iPad Air M2 256GB WiFi": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800",
    "Nike Air Max 90 - Size 43": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
    "DJI Mini 4 Pro Drone": "https://images.unsplash.com/photo-1473968512647-3e44a224fe8f?w=800",
}

async def fix():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        print("🔍 Scanning listings for broken images...")
        
        # Get all categories
        res = await db.execute(select(Category))
        categories = {c.slug: c.id for c in res.scalars().all()}
        
        # Map specific titles to categories for more accurate fixes
        title_map = {
            "Tesla Model 3 LR 2023": "vehicles",
            "Smart Home Bundle - Philips Hue": "home",
            "Samsung 55\" QLED 4K TV": "electronics",
            "Dyson V15 Detect Vacuum": "home",
            "Volvo V60 T6 AWD 2022": "vehicles",
            "iPad Air M2 256GB WiFi": "electronics",
            "Nike Air Max 90 - Size 43": "fashion",
            "DJI Mini 4 Pro Drone": "electronics"
        }

        # Update media for each listing
        res = await db.execute(select(Listing))
        listings = res.scalars().all()
        
        updated_count = 0
        for listing in listings:
            # Determine category slug
            slug = next((s for s, i in categories.items() if i == listing.category_id), "other")
            
            # Use title override if available for better accuracy
            if listing.title in title_map:
                slug = title_map[listing.title]
            
            images = LISTING_IMAGES.get(slug, LISTING_IMAGES.get("electronics"))
            
            # Use explicit target image if available
            if listing.title in TARGET_IMAGES:
                new_url = TARGET_IMAGES[listing.title]
            else:
                # Get media for this listing
                img_idx = hash(listing.title) % len(images)
                new_url = images[img_idx]
            
            media_res = await db.execute(select(ListingMedia).where(ListingMedia.listing_id == listing.id))
            medias = media_res.scalars().all()
            
            if not medias:
                continue

            # Update first image with a specific one from the category
            # We use modulo to distribute images if multiple listings in same category
            img_idx = hash(listing.title) % len(images)
            new_url = images[img_idx]
            
            for media in medias:
                if "unsplash.com" in media.url: # Only update seeded images
                    media.url = new_url
                    media.thumbnail_url = new_url.replace("w=800", "w=400")
                    updated_count += 1
        
        await db.commit()
        print(f"✅ Successfully updated {updated_count} image URLs.")

if __name__ == "__main__":
    asyncio.run(fix())
