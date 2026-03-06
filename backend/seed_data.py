"""Seed database with sample data for visualization and testing."""
import asyncio
import uuid
from datetime import datetime, timezone, timedelta
import random

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.models.base import Base
from app.models.user import User
from app.models.listing import Listing, ListingMedia, Category, ListingStatus, ListingCondition
from app.models.favorite import Favorite
from app.models.conversation import Conversation, Message
from app.core.config import settings

# Sample image URLs (using picsum for realistic placeholder images)
LISTING_IMAGES = {
    "electronics": [
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",  # Laptop
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",  # MacBook
        "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800",  # Phone
        "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800",  # TV
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",  # Headphones
        "https://images.unsplash.com/photo-1504270997636-07ddfbd48945?w=800",  # Camera
    ],
    "furniture": [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",  # Sofa
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800",  # Table
        "https://images.unsplash.com/photo-1505691938895-1758d7eaa511?w=800",  # Bed
        "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800",  # Chair
    ],
    "vehicles": [
        "https://images.unsplash.com/photo-1617788130097-38a97f338ca8?w=800",  # Tesla Model 3
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",  # Car
        "https://images.unsplash.com/photo-1549416805-492160980119?w=800",  # Volvo
        "https://images.unsplash.com/photo-1485291571170-e4a0d8ecd931?w=800",  # Car interior
    ],
    "fashion": [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",  # Jacket
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",  # Jeans
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",  # Shoes
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",  # Bag
    ],
    "sports": [
        "https://images.unsplash.com/photo-1532124958908-fb532c17436f?w=800",  # Bike
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",  # Gym
        "https://images.unsplash.com/photo-1551698618-1fed5d9e1ff0?w=800",  # Skiing
    ],
    "home": [
        "https://images.unsplash.com/photo-1558002038-1055907df827?w=800",  # Smart Home / Hue
        "https://images.unsplash.com/photo-1503602642458-232111445657?w=800",  # Kitchen
        "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800",  # Dyson / Vacuum
    ],
    "books": [
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800",
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800",
    ],
    "garden": [
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
        "https://images.unsplash.com/photo-1589118944235-9141be135832?w=800",  # BBQ
    ],
    "other": [
        "https://images.unsplash.com/photo-1580828369019-2238b90939eb?w=800",
        "https://images.unsplash.com/photo-1628191010210-a59de33e5941?w=800",
    ],
}

CATEGORIES = [
    {"name": "Electronics", "slug": "electronics", "icon": "laptop", "description": "Phones, computers, tablets, cameras, and more"},
    {"name": "Furniture", "slug": "furniture", "icon": "sofa", "description": "Sofas, tables, chairs, beds, and storage"},
    {"name": "Vehicles", "slug": "vehicles", "icon": "car", "description": "Cars, motorcycles, boats, and parts"},
    {"name": "Fashion", "slug": "fashion", "icon": "shirt", "description": "Clothing, shoes, bags, and accessories"},
    {"name": "Sports & Outdoors", "slug": "sports", "icon": "dumbbell", "description": "Sports gear, camping, cycling, and fitness"},
    {"name": "Home & Garden", "slug": "home", "icon": "home", "description": "Kitchen, bathroom, decoration, and tools"},
    {"name": "Books & Media", "slug": "books", "icon": "book-open", "description": "Books, movies, music, and games"},
    {"name": "Garden & Plants", "slug": "garden", "icon": "flower-2", "description": "Plants, tools, outdoor furniture"},
    {"name": "Kids & Baby", "slug": "kids", "icon": "baby", "description": "Toys, clothing, strollers, and gear"},
    {"name": "Services", "slug": "services", "icon": "wrench", "description": "Handyman, tutoring, cleaning, and more"},
    {"name": "Other / Miscellaneous", "slug": "other", "icon": "package", "description": "Everything else that doesn't fit"},
]

SWEDISH_CITIES = [
    ("Stockholm", "Stockholms län"),
    ("Göteborg", "Västra Götalands län"),
    ("Malmö", "Skåne län"),
    ("Uppsala", "Uppsala län"),
    ("Linköping", "Östergötlands län"),
    ("Västerås", "Västmanlands län"),
    ("Örebro", "Örebro län"),
    ("Helsingborg", "Skåne län"),
    ("Norrköping", "Östergötlands län"),
    ("Jönköping", "Jönköpings län"),
    ("Lund", "Skåne län"),
    ("Umeå", "Västerbottens län"),
]

# Sample listing data per category
SAMPLE_LISTINGS = {
    "electronics": [
        {"title": "MacBook Pro 14\" M3 Pro", "description": "Barely used MacBook Pro 14-inch with M3 Pro chip, 18GB RAM, 512GB SSD. Includes original charger and box. Perfect condition, bought 6 months ago. Battery health 98%.", "price": 18500, "condition": "like_new"},
        {"title": "iPhone 15 Pro 256GB", "description": "iPhone 15 Pro in Natural Titanium, 256GB storage. Comes with original box, cable, and a Spigen case. Screen in perfect condition, always used with screen protector.", "price": 9900, "condition": "like_new"},
        {"title": "Samsung 55\" QLED 4K TV", "description": "Samsung Q70A 55-inch QLED 4K Smart TV from 2024. Excellent picture quality, barely used. Includes remote and wall mount bracket. Moving abroad, must sell.", "price": 5500, "condition": "good"},
        {"title": "Sony WH-1000XM5 Headphones", "description": "Sony WH-1000XM5 wireless noise-cancelling headphones in black. Amazing sound quality, best-in-class ANC. Includes case and USB-C cable. Used for 3 months.", "price": 2200, "condition": "like_new"},
        {"title": "DJI Mini 4 Pro Drone", "description": "DJI Mini 4 Pro with Fly More combo. Includes 3 batteries, charging hub, ND filters, and carrying case. Under 250g, no registration needed. Perfect for beginners.", "price": 7500, "condition": "good"},
        {"title": "iPad Air M2 256GB WiFi", "description": "iPad Air M2 in Space Gray, 256GB WiFi model. Comes with Apple Pencil Pro and Smart Folio keyboard. Perfect for students and creatives.", "price": 6800, "condition": "like_new"},
        {"title": "Gaming PC - RTX 4070 Ti", "description": "Custom built gaming PC: i7-14700K, RTX 4070 Ti, 32GB DDR5, 1TB NVMe. Includes 27\" 1440p 165Hz monitor. Built 4 months ago, selling as I'm moving.", "price": 15000, "condition": "like_new"},
        {"title": "Canon EOS R6 Mark II Body", "description": "Canon EOS R6 Mark II mirrorless camera body only. 24.2MP, 40fps burst, incredible autofocus. Shutter count under 5000. Includes extra battery.", "price": 14500, "condition": "good"},
    ],
    "furniture": [
        {"title": "IKEA SÖDERHAMN Corner Sofa", "description": "SÖDERHAMN corner sofa in Finnsta turquoise. 3 sections + chaise. Very comfortable, modular design. Washable covers. Used for 1 year, great condition.", "price": 4500, "condition": "good"},
        {"title": "Solid Oak Dining Table 180cm", "description": "Beautiful handcrafted solid oak dining table, 180x90cm. Seats 6-8 comfortably. Scandinavian design, natural oil finish. Bought from a local carpenter.", "price": 8500, "condition": "good"},
        {"title": "Standing Desk - FlexiSpot E7", "description": "FlexiSpot E7 electric standing desk with 160x80 bamboo top. Height adjustable 58-123cm, programmable memory. Used for 6 months in home office.", "price": 3200, "condition": "like_new"},
        {"title": "Mid-Century Teak Sideboard", "description": "Vintage 1960s Danish teak sideboard. Beautiful grain, original brass handles. 180cm wide. Some minor wear consistent with age, overall excellent condition.", "price": 12000, "condition": "fair"},
        {"title": "IKEA PAX Wardrobe System", "description": "PAX wardrobe system: 2x 100cm frames, sliding doors with mirror, internal organizers (shelves, drawers, clothes rail). White. Must be disassembled for transport.", "price": 2800, "condition": "good"},
    ],
    "vehicles": [
        {"title": "Volvo V60 T6 AWD 2022", "description": "Volvo V60 T6 Recharge AWD Plug-in Hybrid 2022. 26,000 km, Thunder Grey, fully loaded with driver assistance, air suspension, Bowers & Wilkins sound. Service at Volvo dealer.", "price": 385000, "condition": "like_new"},
        {"title": "VanMoof S5 Electric Bike", "description": "VanMoof S5 electric city bike in Thunder Grey. Anti-theft, boost button, integrated lights. Used for one summer season. Includes original charger and lock.", "price": 15000, "condition": "good"},
        {"title": "Tesla Model 3 LR 2023", "description": "Tesla Model 3 Long Range 2023, Pearl White. 18,000 km, FSD capability, new tires. Full self-driving transfer included. Immaculate condition, garage kept.", "price": 395000, "condition": "like_new"},
    ],
    "fashion": [
        {"title": "Canada Goose Expedition Parka", "description": "Canada Goose Expedition Parka in black, size M. Worn one winter season. Excellent warmth for Swedish winters. Dry cleaned, ready for next winter.", "price": 5500, "condition": "good"},
        {"title": "Nike Air Max 90 - Size 43", "description": "Nike Air Max 90 in classic white/grey colorway, size EU 43. Worn a few times, very clean. Comes with original box. Limited edition release.", "price": 800, "condition": "like_new"},
        {"title": "Leather Jacket - AllSaints", "description": "AllSaints Cargo leather biker jacket in black, size L. Soft lamb leather, broken in perfectly. A timeless wardrobe essential.", "price": 2200, "condition": "good"},
        {"title": "Fjällräven Kånken Backpack", "description": "Classic Fjällräven Kånken backpack in Frost Green. Used lightly, no stains or tears. Perfect everyday bag for school or casual use.", "price": 450, "condition": "good"},
        {"title": "Ray-Ban Wayfarer Classic", "description": "Ray-Ban Original Wayfarer sunglasses in tortoise with green G-15 lenses. Comes with case and cleaning cloth. Barely worn.", "price": 900, "condition": "like_new"},
    ],
    "sports": [
        {"title": "Specialized Tarmac SL7 Road Bike", "description": "Specialized Tarmac SL7 Expert in size 56. Shimano Ultegra Di2, carbon wheels. 6,000 km, always maintained. Includes spare tires and tool kit.", "price": 28000, "condition": "good"},
        {"title": "Complete Home Gym Set", "description": "Full home gym: adjustable dumbbells (2-32kg), Olympic barbell + plates (total 150kg), squat rack, adjustable bench, pull-up bar, resistance bands. All premium quality.", "price": 12000, "condition": "good"},
        {"title": "Patagonia Ski Jacket - Size M", "description": "Patagonia PowSlayer jacket in size M, used one season. Gore-Tex Pro, fully waterproof, incredibly breathable. Perfect for backcountry skiing.", "price": 2500, "condition": "good"},
        {"title": "Head Kore 99 Skis 180cm", "description": "Head Kore 99 all-mountain skis, 180cm with Tyrolia Attack 14 bindings. One season of use (approx. 30 days). Great all-round freeride ski.", "price": 3500, "condition": "good"},
    ],
    "home": [
        {"title": "Dyson V15 Detect Vacuum", "description": "Dyson V15 Detect cordless vacuum cleaner. Green laser reveals hidden dust. Includes all attachments and wall mount. Used for 5 months.", "price": 3800, "condition": "like_new"},
        {"title": "KitchenAid Artisan Stand Mixer", "description": "KitchenAid Artisan stand mixer in Empire Red. 4.8L bowl, includes flat beater, dough hook, and wire whisk. Perfect for baking enthusiasts.", "price": 3200, "condition": "good"},
        {"title": "Smart Home Bundle - Philips Hue", "description": "Complete Philips Hue setup: Bridge, 12 color bulbs, 4 light strips, 2 Play bars, 3 dimmer switches. Everything works perfectly. Moving to a smaller place.", "price": 4500, "condition": "good"},
    ],
    "books": [
        {"title": "Complete Harry Potter Box Set", "description": "Complete Harry Potter book collection (1-7) in hardcover, British edition. Excellent condition, stored in bookshelf. Gift-worthy condition.", "price": 850, "condition": "good"},
        {"title": "Programming Library - 15 Books", "description": "Collection of 15 programming books: Clean Code, Design Patterns, SICP, CLRS Algorithms, The Pragmatic Programmer, and more. All in great condition.", "price": 1200, "condition": "good"},
    ],
    "garden": [
        {"title": "Husqvarna Automower 430X", "description": "Husqvarna Automower 430X robotic lawn mower. Handles up to 3200 m². Includes installation kit, boundary wire laid. 2 years old, well maintained.", "price": 12000, "condition": "good"},
        {"title": "Weber Genesis II BBQ", "description": "Weber Genesis II E-310 gas grill in black. 3 burners, side table, tool hooks. Used for 2 summers. Includes cover and grilling accessories set.", "price": 5500, "condition": "good"},
    ],
}

SAMPLE_USERS = [
    {"display_name": "Anna Lindqvist", "email": "anna.lindqvist@mail.se", "location": "Stockholm", "bio": "Tech enthusiast & furniture lover. Quick responses!"},
    {"display_name": "Erik Johansson", "email": "erik.johansson@mail.se", "location": "Göteborg", "bio": "Selling quality items I no longer need. All prices negotiable."},
    {"display_name": "Sofia Andersson", "email": "sofia.andersson@mail.se", "location": "Malmö", "bio": "Fashion and lifestyle. Only selling items in great condition."},
    {"display_name": "Oscar Nilsson", "email": "oscar.nilsson@mail.se", "location": "Uppsala", "bio": "Sports gear and outdoor equipment. Happy to answer questions!"},
    {"display_name": "Maja Eriksson", "email": "maja.eriksson@mail.se", "location": "Lund", "bio": "Decluttering my apartment. Great deals on quality stuff."},
    {"display_name": "Liam Svensson", "email": "liam.svensson@mail.se", "location": "Stockholm", "bio": "Car enthusiast and tech geek. Fast shipping available."},
    {"display_name": "Ella Persson", "email": "ella.persson@mail.se", "location": "Göteborg", "bio": "Home decoration and garden lover. Selling with care."},
    {"display_name": "Hugo Larsson", "email": "hugo.larsson@mail.se", "location": "Malmö", "bio": "Books, electronics, and everything in between."},
]


async def seed():
    """Main seed function."""
    engine_kwargs = {"echo": False}
    if settings.DATABASE_SSL:
        engine_kwargs["connect_args"] = {"ssl": True}
        
    engine = create_async_engine(settings.DATABASE_URL, **engine_kwargs)

    # Create all tables (without dropping existing ones to preserve user data)
    async with engine.begin() as conn:
        # await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        # Check if we already have data
        res = await db.execute(text("SELECT 1 FROM categories LIMIT 1"))
        if res.scalar_one_or_none():
            print("🌱 Database already seeded! Skipping to preserve your custom listings.")
            return

        print("🌱 Seeding database...")

        # 1. Create categories
        print("  📁 Creating categories...")
        categories = {}
        for i, cat_data in enumerate(CATEGORIES):
            cat = Category(
                name=cat_data["name"],
                slug=cat_data["slug"],
                icon=cat_data["icon"],
                description=cat_data["description"],
                sort_order=i,
            )
            db.add(cat)
            categories[cat_data["slug"]] = cat
        await db.flush()

        # 2. Create users
        print("  👤 Creating users...")
        users = []
        for i, user_data in enumerate(SAMPLE_USERS):
            user = User(
                auth0_id=f"auth0|seed-user-{i+1:03d}",
                email=user_data["email"],
                display_name=user_data["display_name"],
                location=user_data["location"],
                bio=user_data["bio"],
                rating=round(random.uniform(3.5, 5.0), 1),
                rating_count=random.randint(5, 50),
                is_verified=random.choice([True, True, True, False]),
                role="user",
                avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_data['display_name'].replace(' ', '')}",
            )
            db.add(user)
            users.append(user)
        await db.flush()

        # Also create the mock dev user
        dev_user = User(
            auth0_id="auth0|69a0e4b303d3e0b80a1d9d5c",
            email="mahfoozalikhan16@gmail.com",
            display_name="Mahfooz Ali Khan",
            location="Stockholm",
            bio="Platform administrator",
            rating=5.0,
            rating_count=10,
            is_verified=True,
            role="admin",
            avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=MahfoozAliKhan",
        )
        db.add(dev_user)
        await db.flush()

        # 3. Create listings with images
        print("  📦 Creating listings...")
        all_listings = []
        for cat_slug, items in SAMPLE_LISTINGS.items():
            if cat_slug not in categories:
                continue
            cat = categories[cat_slug]
            images = LISTING_IMAGES.get(cat_slug, [])

            for item_data in items:
                seller = random.choice(users)
                city, region = random.choice(SWEDISH_CITIES)
                days_ago = random.randint(1, 60)

                listing = Listing(
                    seller_id=seller.id,
                    title=item_data["title"],
                    description=item_data["description"],
                    price=item_data["price"],
                    currency="SEK",
                    category_id=cat.id,
                    condition=item_data.get("condition", "good"),
                    status=ListingStatus.ACTIVE,
                    location_city=city,
                    location_region=region,
                    shipping_available=random.choice([True, True, False]),
                    shipping_cost=random.choice([0, 49, 79, 99, 149]) if random.random() > 0.3 else None,
                    view_count=random.randint(10, 500),
                    favorite_count=random.randint(0, 30),
                )
                listing.created_at = datetime.now(timezone.utc) - timedelta(days=days_ago)
                db.add(listing)
                all_listings.append(listing)
                await db.flush()

                # Add images
                selected_images = random.sample(images, min(len(images), random.randint(1, 3)))
                for j, img_url in enumerate(selected_images):
                    media = ListingMedia(
                        listing_id=listing.id,
                        url=img_url,
                        thumbnail_url=img_url.replace("w=800", "w=400"),
                        media_type="image",
                        sort_order=j,
                    )
                    db.add(media)

        await db.flush()

        # 4. Create favorites
        print("  ❤️ Creating favorites...")
        for user in users[:5]:
            fav_listings = random.sample(all_listings, min(len(all_listings), random.randint(3, 8)))
            for listing in fav_listings:
                if listing.seller_id != user.id:
                    fav = Favorite(user_id=user.id, listing_id=listing.id)
                    db.add(fav)
        await db.flush()

        # 5. Create conversations with messages
        print("  💬 Creating conversations...")
        conversation_messages = [
            ["Hej! Is this still available?", "Yes, it is! Are you interested?", "Definitely! Can I come see it this weekend?", "Saturday afternoon works for me. I'll send you the address."],
            ["Hi, would you accept 80% of the listed price?", "I could do 90%, it's in really good condition.", "Deal! When can I pick it up?", "Anytime after 5pm on weekdays."],
            ["Hello! Can you ship this to Malmö?", "Yes, shipping is available. It would be about 79 SEK extra.", "That works for me. I'll place the order.", "Great! I'll ship it tomorrow."],
        ]

        for i, (buyer, listing) in enumerate(
            [(users[0], all_listings[3]), (users[2], all_listings[0]), (users[4], all_listings[7])]
        ):
            if i >= len(conversation_messages):
                break
            seller_user = None
            for u in users:
                if u.id == listing.seller_id:
                    seller_user = u
                    break
            if not seller_user or buyer.id == seller_user.id:
                continue

            conv = Conversation(
                listing_id=listing.id,
                buyer_id=buyer.id,
                seller_id=seller_user.id,
                last_message_preview=conversation_messages[i][-1][:200],
            )
            db.add(conv)
            await db.flush()

            for j, msg_content in enumerate(conversation_messages[i]):
                sender = buyer if j % 2 == 0 else seller_user
                msg = Message(
                    conversation_id=conv.id,
                    sender_id=sender.id,
                    content=msg_content,
                    is_read=True,
                )
                msg.created_at = datetime.now(timezone.utc) - timedelta(hours=len(conversation_messages[i]) - j)
                db.add(msg)

        await db.commit()

        print(f"\n✅ Seed complete!")
        print(f"   📁 {len(CATEGORIES)} categories")
        print(f"   👤 {len(users) + 1} users (including dev user)")
        print(f"   📦 {len(all_listings)} listings")
        print(f"   💬 {min(3, len(conversation_messages))} conversations")
        print(f"\n🔑 Admin user: auth0|69a0e4b303d3e0b80a1d9d5c (mahfoozalikhan16@gmail.com)")


if __name__ == "__main__":
    asyncio.run(seed())
