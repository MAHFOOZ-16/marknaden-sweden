"""Application configuration via environment variables."""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Marketplace API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    API_PREFIX: str = "/api/v1"

    # Database
    # Neon usually requires ?sslmode=require or connect_args={"ssl": True}
    DATABASE_URL: str = "postgresql+asyncpg://marketplace:marketplace@localhost:5432/marketplace"
    DATABASE_URL_SYNC: str = "postgresql+psycopg2://marketplace:marketplace@localhost:5432/marketplace"
    DATABASE_SSL: bool = False  # Set to True for Neon/Production

    # Auth0
    AUTH0_DOMAIN: str = "dev-nc7m1b5u53tsisac.eu.auth0.com"
    AUTH0_API_AUDIENCE: str = "https://api.marketplace.production"
    AUTH0_CLIENT_ID: str = "d0m5MHpwfzUTInrabA9aDGYhEkWLAHSL"
    AUTH0_CLIENT_SECRET: str = "" # Set via environment variable
    # Set True for local dev without Auth0
    AUTH_MOCK_ENABLED: bool = False
    AUTH0_ALGORITHMS: str = "RS256"

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # S3 / Object Storage
    S3_BUCKET_NAME: str = "marketplace-media"
    S3_REGION: str = "eu-north-1"
    S3_ACCESS_KEY: str = ""
    S3_SECRET_KEY: str = ""
    S3_ENDPOINT_URL: Optional[str] = None  # For MinIO or R2

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,https://marknaden-sweden.azurewebsites.net"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
