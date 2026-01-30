from __future__ import annotations

from typing import Annotated, Any

from pydantic import BeforeValidator, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


def parse_cors(v: Any) -> list[str]:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",") if i.strip()]
    elif isinstance(v, (list, str)):
        return v
    raise ValueError(v)


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, extra="ignore")

    POSTGRES_URL: str
    JWT_SECRET_KEY: str

    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_TTL_MINUTES: int = 30
    REFRESH_TOKEN_TTL_MINUTES: int = 60 * 24 * 30  # 30 days
    
    CORS_ALLOW_ORIGINS: Annotated[list[str], BeforeValidator(parse_cors)] = ["*"]

    @computed_field
    @property
    def postgres_url(self) -> str:
        """Back-compat alias for postgres_url (lowercase) access if needed, 
        or ensuring scheme is correct for asyncio/sync drivers.
        """
        return self.POSTGRES_URL

    @property
    def cors_allow_origins(self) -> list[str]:
        return self.CORS_ALLOW_ORIGINS
        
    @property
    def jwt_secret_key(self) -> str:
        return self.JWT_SECRET_KEY

    @property
    def jwt_algorithm(self) -> str:
        return self.JWT_ALGORITHM

    @property
    def access_token_ttl_minutes(self) -> int:
        return self.ACCESS_TOKEN_TTL_MINUTES

    @property
    def refresh_token_ttl_minutes(self) -> int:
        return self.REFRESH_TOKEN_TTL_MINUTES


# PUBLIC_INTERFACE
def get_settings() -> Settings:
    return Settings()
