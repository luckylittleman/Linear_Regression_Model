from fastapi import FastAPI,HTTPException
from app.database import engine
from app import models
import joblib
import os
from pydantic import BaseModel

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

# 1. Path to your saved brain
MODEL_PATH = os.path.join("ml", "student_model.pkl")
model = joblib.load(MODEL_PATH)


# 2. Define what the input should look like (The Schema)
class PredictionInput(BaseModel):
    study_hours: float
    prev_mean_grade: float
    sleep_hours: float
    revision_intensity: int

@app.post("/predict")
def predict_score(data: PredictionInput):
    try:
        # 3. Format the data for the model
        features = [[
            data.study_hours, 
            data.prev_mean_grade, 
            data.sleep_hours, 
            data.revision_intensity
        ]]
        
        # 4. Make the prediction
        prediction = model.predict(features)
        
        return {
            "status": "success",
            "predicted_mean_score": round(float(prediction[0]), 2),
            "model_confidence_r2": 0.9887  # Showing off your score!
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))