# init_db.py
from app.database import engine, Base
from app import models

print("Creating all tables defined in models.py...")
Base.metadata.create_all(bind=engine)
print("Done! Check your project folder for the .db file now.")