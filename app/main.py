from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import pandas as pd
import joblib
import io
import numpy as np
from . import models, schemas
from .database import SessionLocal, engine

# Initialize Database
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# 1. CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your Model
model = joblib.load("student_model.pkl")

# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- MISSING COMPONENT 1: INDIVIDUAL PREDICTION ---
@app.post("/predict/individual")
def predict_individual(data: schemas.StudentCreate, db: Session = Depends(get_db)):
    # Prepare features for the model
    features = np.array([[
        data.study_hours, 
        data.prev_mean_grade, 
        data.sleep_hours, 
        data.revision_intensity
    ]])
    
    # Run Inference
    prediction = model.predict(features)[0]
    final_score = round(max(0, min(100, float(prediction))), 2)

    # Save to Individual Records table (StudentRecord)
    new_record = models.StudentRecord(
        student_name=data.student_name,
        reg_no=data.reg_no,
        study_hours=data.study_hours,
        prev_mean_grade=data.prev_mean_grade,
        sleep_hours=data.sleep_hours,
        revision_intensity=data.revision_intensity,
        predicted_score=final_score
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return {"predicted_score": final_score, "id": new_record.id}

# --- EXISTING: BATCH UPLOAD & PREDICTION ---
@app.post("/predict/batch")
async def predict_batch(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    
    # Column mapping to ensure it works even if CSV headers vary slightly
    X_new = df[['study_hours', 'prev_mean_grade', 'sleep_hours', 'revision_intensity']]
    preds = model.predict(X_new)
    df['predicted_score'] = [round(max(0, min(100, float(p))), 2) for p in preds]

    # Clear old batch and save new session
    db.query(models.BatchRecord).delete()
    for _, row in df.iterrows():
        new_entry = models.BatchRecord(
            student_name=row['name'],
            reg_no=row['reg_no'],
            predicted_score=row['predicted_score']
        )
        db.add(new_entry)
    db.commit()

    return {"count": len(df), "results": df.to_dict(orient="records")}

# --- EXISTING: DASHBOARD ANALYTICS ---
@app.get("/analytics/current-batch")
def get_batch_analytics(db: Session = Depends(get_db)):
    records = db.query(models.BatchRecord).all()
    scores = [r.predicted_score for r in records]
    
    student_list = []
    for r in records:
        student_list.append({
            "student_name": r.student_name,
            "reg_no": r.reg_no,
            "predicted_score": r.predicted_score
        })

    chart_data = [
        {"range": "0-40", "count": len([s for s in scores if s <= 40]), "color": "#f87171"},
        {"range": "41-60", "count": len([s for s in scores if 40 < s <= 60]), "color": "#fbbf24"},
        {"range": "61-80", "count": len([s for s in scores if 60 < s <= 80]), "color": "#34d399"},
        {"range": "81-100", "count": len([s for s in scores if s > 80]), "color": "#2dd4bf"},
    ]

    return {
        "total": len(records),
        "mean": round(sum(scores) / len(records), 2) if records else 0,
        "atRisk": len([s for s in scores if s < 50]),
        "chartData": chart_data,
        "detailed_results": student_list
    }

# --- MISSING COMPONENT 2: RESET/CLEANUP ---
@app.delete("/analytics/reset")
def reset_data(db: Session = Depends(get_db)):
    db.query(models.BatchRecord).delete()
    db.commit()
    return {"message": "Batch data cleared successfully"}