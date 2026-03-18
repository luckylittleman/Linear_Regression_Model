from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import pandas as pd
import joblib
import io
import os
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
from . import models, schemas
from .database import SessionLocal, engine
import json

# Initialize Database
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Student Analytics API", version="1.0.0")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model using absolute path relative to this file — works regardless of cwd
_MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "student_model.pkl")
model = joblib.load(_MODEL_PATH)


# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- INDIVIDUAL PREDICTION ---
@app.post("/predict/individual")
def predict_individual(data: schemas.StudentCreate, db: Session = Depends(get_db)):
    features = np.array([[
        data.study_hours,
        data.prev_mean_grade,
        data.sleep_hours,
        data.revision_intensity
    ]])

    prediction = model.predict(features)[0]
    final_score = round(max(0, min(100, float(prediction))), 2)

    # Compute feature contributions: coef_i × value_i
    feature_names = ['study_hours', 'prev_mean_grade', 'sleep_hours', 'revision_intensity']
    feature_values = [data.study_hours, data.prev_mean_grade, data.sleep_hours, data.revision_intensity]
    contributions = {
        name: round(float(coef) * float(val), 4)
        for name, coef, val in zip(feature_names, model.coef_, feature_values)
    }

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
    
    history_record = models.PredictionHistory(
        student_name=data.student_name,
        reg_no=data.reg_no,
        study_hours=data.study_hours,
        prev_mean_grade=data.prev_mean_grade,
        sleep_hours=data.sleep_hours,
        revision_intensity=data.revision_intensity,
        predicted_score=final_score,
        prediction_type="Individual"
    )
    db.add(history_record)
    
    db.commit()
    db.refresh(new_record)

    return {
        "predicted_score": final_score,
        "id": new_record.id,
        "intercept": round(float(model.intercept_), 4),
        "contributions": contributions,
    }


# --- BATCH UPLOAD & PREDICTION ---
@app.post("/predict/batch")
async def predict_batch(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))

    required_cols = {'study_hours', 'prev_mean_grade', 'sleep_hours', 'revision_intensity'}
    if not required_cols.issubset(df.columns):
        raise HTTPException(status_code=422, detail=f"CSV must contain columns: {required_cols}")

    X_new = df[['study_hours', 'prev_mean_grade', 'sleep_hours', 'revision_intensity']]
    preds = model.predict(X_new)
    df['predicted_score'] = [round(max(0, min(100, float(p))), 2) for p in preds]

    # Replace current batch
    db.query(models.BatchRecord).delete()
    for _, row in df.iterrows():
        student_name = row.get('name', row.get('student_name', 'Unknown'))
        reg_no = row.get('reg_no', '—')
        predicted_score = row['predicted_score']
        
        new_entry = models.BatchRecord(
            student_name=student_name,
            reg_no=reg_no,
            predicted_score=predicted_score
        )
        db.add(new_entry)
        
        history_entry = models.PredictionHistory(
            student_name=student_name,
            reg_no=reg_no,
            study_hours=row.get('study_hours'),
            prev_mean_grade=row.get('prev_mean_grade'),
            sleep_hours=row.get('sleep_hours'),
            revision_intensity=row.get('revision_intensity'),
            predicted_score=predicted_score,
            prediction_type="Batch"
        )
        db.add(history_entry)
    db.commit()

    scores = df['predicted_score'].tolist()
    mean_score = round(sum(scores) / len(scores), 2) if scores else 0
    at_risk_count = len([s for s in scores if s < 50])

    return {
        "count": len(df),
        "mean_score": mean_score,
        "at_risk_count": at_risk_count,
        "results": df.to_dict(orient="records")
    }


# --- DASHBOARD ANALYTICS ---
@app.get("/analytics/current-batch")
def get_batch_analytics(db: Session = Depends(get_db)):
    records = db.query(models.BatchRecord).all()

    if not records:
        return {
            "total": 0,
            "mean": 0,
            "atRisk": 0,
            "chartData": [],
            "detailed_results": []
        }

    scores = [r.predicted_score for r in records]
    student_list = [
        {"student_name": r.student_name, "reg_no": r.reg_no, "predicted_score": r.predicted_score}
        for r in records
    ]

    chart_data = [
        {"range": "0–40",  "count": len([s for s in scores if s <= 40]),            "color": "#f87171"},
        {"range": "41–60", "count": len([s for s in scores if 40 < s <= 60]),       "color": "#fbbf24"},
        {"range": "61–80", "count": len([s for s in scores if 60 < s <= 80]),       "color": "#34d399"},
        {"range": "81–100","count": len([s for s in scores if s > 80]),             "color": "#2dd4bf"},
    ]

    return {
        "total": len(records),
        "mean": round(sum(scores) / len(records), 2),
        "atRisk": len([s for s in scores if s < 50]),
        "chartData": chart_data,
        "detailed_results": student_list
    }


# --- RESET BATCH DATA ---
@app.delete("/analytics/reset")
def reset_data(db: Session = Depends(get_db)):
    db.query(models.BatchRecord).delete()
    db.commit()
    return {"message": "Batch data cleared successfully"}

# --- PREDICTION HISTORY ---
@app.get("/history", response_model=list[schemas.PredictionHistoryResponse])
def get_prediction_history(db: Session = Depends(get_db)):
    records = db.query(models.PredictionHistory).order_by(models.PredictionHistory.created_at.desc()).all()
    return records

# --- MODEL CONFIG & RETRAINING ---
@app.get("/model/config")
def get_model_config():
    feature_names = ['Study Hours', 'Prev. Mean Grade', 'Sleep Hours', 'Revision Intensity']
    weights = [
        {"feature": name, "weight": round(float(coef), 4)}
        for name, coef in zip(feature_names, model.coef_)
    ]
    
    # Try fetching model evaluation metadata
    r2_score = 0
    records_used = 0
    
    metadata_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "model_metadata.json")
    if os.path.exists(metadata_path):
        try:
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
                r2_score = metadata.get("r2_score", 0)
                records_used = metadata.get("records_used", 0)
        except Exception as e:
            print(f"Error reading model metadata: {e}")

    return {
        "weights": weights,
        "intercept": round(float(model.intercept_), 4),
        "status": "active",
        "r2_score": r2_score,
        "records_used": records_used
    }
