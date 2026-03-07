from fastapi import FastAPI
from app.database import engine
from app import models

# THE AUTOMATIC BRIDGE: This creates the tables in PostgreSQL 
# according to the new blueprints in models.py
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Student Grade Predictor API",
    description="Backend infrastructure for predicting academic performance using Multiple Linear Regression.",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Student Grade Predictor API. Database initiated on Littleman."}