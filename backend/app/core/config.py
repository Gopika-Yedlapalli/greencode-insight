import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60)
    )

    SUPPORTED_EXTENSIONS = {".py", ".java"}
    MAX_FILES: int = int(os.getenv("MAX_ANALYSIS_FILES", 5))
    BASE_ANALYSIS_PATH: str = os.getenv(
        "BASE_ANALYSIS_PATH", "/tmp/greencode"
    )

settings = Settings()
