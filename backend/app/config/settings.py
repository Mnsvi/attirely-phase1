from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    QDRANT_URL: str
    QDRANT_API_KEY: str
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.6-flash"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    class Config:
        env_file = ".env"

settings = Settings()