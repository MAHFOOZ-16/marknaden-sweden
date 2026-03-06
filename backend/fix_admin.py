import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import text
from app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def fix():
    async with AsyncSessionLocal() as session:
        await session.execute(text("UPDATE users SET role = 'admin' WHERE email = 'mahfoozalikhan16@gmail.com';"))
        await session.commit()
    print("Done!")

if __name__ == "__main__":
    asyncio.run(fix())
