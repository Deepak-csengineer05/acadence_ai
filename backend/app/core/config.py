import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load local environment variables from .env
load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Acadence AI Backend"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super_secret_development_key_for_acadence_ai_2026")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 Days
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
    
    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    UPLOADS_DIR: Path = DATA_DIR / "uploads"
    QDRANT_DIR: Path = DATA_DIR / "qdrant"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR}/database.db")
    
    # Vector DB
    QDRANT_URL: str = os.getenv("QDRANT_URL", "")
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY", "")
    
    # Cloud AI Services
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Cloud Object Storage (S3 / R2)
    S3_BUCKET_NAME: str = os.getenv("S3_BUCKET_NAME", "")
    S3_ACCESS_KEY: str = os.getenv("S3_ACCESS_KEY", "")
    S3_SECRET_KEY: str = os.getenv("S3_SECRET_KEY", "")
    S3_ENDPOINT_URL: str = os.getenv("S3_ENDPOINT_URL", "")
    
    # Local AI Services
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.2")
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# Validation for SECRET_KEY security
INSECURE_KEYS = [
    "",
    "super_secret_development_key_for_acadence_ai_2026",
    "secret",
    "change_me",
    "your_secret_key"
]
if (not settings.SECRET_KEY or settings.SECRET_KEY in INSECURE_KEYS) and settings.ENVIRONMENT.lower() not in ["development", "dev", "test", "testing"]:
    raise ValueError(
        "CRITICAL SECURITY ERROR: SECRET_KEY is missing or set to an insecure default value! "
        "Set a strong SECRET_KEY environment variable in non-development environments."
    )

# Create data directories if they don't exist
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
settings.QDRANT_DIR.mkdir(parents=True, exist_ok=True)


