from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Update with your specific PostgreSQL credentials
SQLALCHEMY_DATABASE_URL = "postgresql://hilary:Lucky004@localhost/dropout_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()