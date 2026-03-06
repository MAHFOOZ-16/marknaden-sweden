import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import text
from app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def remove_admin():
    email_to_demote = "anna.lindqvist@mail.se"
    async with AsyncSessionLocal() as session:
        # Check if user exists and is admin
        result = await session.execute(text(f"SELECT role FROM users WHERE email = '{email_to_demote}';"))
        role = result.scalar()
        if role == 'admin':
            await session.execute(text(f"UPDATE users SET role = 'user' WHERE email = '{email_to_demote}';"))
            await session.commit()
            print(f"✅ Successfully demoted {email_to_demote} to user.")
        else:
            print(f"ℹ️ User {email_to_demote} is already not an admin (Current role: {role}).")
    print("Done!")

if __name__ == "__main__":
    asyncio.run(remove_admin())
