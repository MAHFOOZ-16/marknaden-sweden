"""Auth0 JWT validation and RBAC middleware."""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import httpx
from typing import Optional
from app.core.config import settings

security = HTTPBearer(auto_error=False)

# Cache JWKS keys
_jwks_cache: Optional[dict] = None


async def _get_jwks() -> dict:
    """Fetch Auth0 JWKS (JSON Web Key Set)."""
    global _jwks_cache
    if _jwks_cache:
        return _jwks_cache
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"https://{settings.AUTH0_DOMAIN}/.well-known/jwks.json")
        _jwks_cache = resp.json()
        return _jwks_cache


# Mock user for local development
MOCK_USER = {
    "sub": "auth0|69a0e4b303d3e0b80a1d9d5c",
    "email": "mahfoozalikhan16@gmail.com",
    "name": "Mahfooz Ali Khan",
    "roles": ["admin"],
    "permissions": [],
}


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> dict:
    """Validate JWT and return user claims. Falls back to mock in dev mode."""
    # Mock mode for local development
    if settings.AUTH_MOCK_ENABLED:
        if credentials and credentials.credentials == "mock-admin":
            return {**MOCK_USER, "roles": ["admin"]}
        if credentials and credentials.credentials == "mock-moderator":
            return {**MOCK_USER, "sub": "auth0|mock-mod-001", "roles": ["moderator"]}
        return MOCK_USER

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    try:
        jwks = await _get_jwks()
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        for key in jwks.get("keys", []):
            if key["kid"] == unverified_header.get("kid"):
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"],
                }
        if not rsa_key:
            raise HTTPException(status_code=401, detail="Unable to find key")

        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=[settings.AUTH0_ALGORITHMS],
            audience=settings.AUTH0_API_AUDIENCE,
            issuer=f"https://{settings.AUTH0_DOMAIN}/",
        )
        
        # If email is missing from the access token, fetch it from Auth0 userinfo
        if "email" not in payload:
            async with httpx.AsyncClient() as client:
                userinfo_resp = await client.get(
                    f"https://{settings.AUTH0_DOMAIN}/userinfo",
                    headers={"Authorization": f"Bearer {token}"}
                )
                if userinfo_resp.status_code == 200:
                    userinfo = userinfo_resp.json()
                    if "email" in userinfo:
                        payload["email"] = userinfo["email"]
                    if "name" in userinfo:
                        payload["name"] = userinfo["name"]
                        
        return payload
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Token validation failed: {str(e)}")


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[dict]:
    """Optional auth — returns None for unauthenticated requests."""
    if not credentials:
        if settings.AUTH_MOCK_ENABLED:
            return MOCK_USER
        return None
    return await get_current_user(credentials)


from app.core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

def require_role(required_role: str):
    """Dependency factory: require a specific role."""
    async def role_checker(
        user_claims: dict = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
    ) -> dict:
        # First check token claims as fallback
        roles = user_claims.get("roles", [])
        namespace_roles = user_claims.get("https://marketplace.local/roles", [])
        all_roles = roles + namespace_roles
        
        # Then check actual DB user's role 
        from app.models.user import User
        auth0_id = user_claims.get("sub", "")
        result = await db.execute(select(User).where(User.auth0_id == auth0_id))
        db_user = result.scalar_one_or_none()
        
        if db_user and db_user.role:
            all_roles.append(db_user.role)

        role_hierarchy = {"admin": 3, "moderator": 2, "user": 1}
        user_level = max(role_hierarchy.get(r, 0) for r in all_roles) if all_roles else 1
        required_level = role_hierarchy.get(required_role, 1)

        if user_level < required_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{required_role}' required",
            )
        return user_claims
    return role_checker
