"""
app/main.py
-----------
FastAPI backend for Student Academic Performance Forecasting.

Features accepted by the prediction endpoints:
  attendance_rate  – 0–100 %
  cat_score        – 0–100
  prev_mean_grade  – 0–100
  helb_status      – 0 | 1

Risk bands (proposal thresholds):
  < 40  → High Risk    (Red)
  40–59 → Moderate Risk (Amber)
  ≥ 60  → Safe          (Green)
"""

from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import pandas as pd
import joblib
import io
import os
import numpy as np
from . import models, schemas
from .database import SessionLocal, engine
import json

# ── DB init ──────────────────────────────────────────────────────────────────
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Student Analytics API", version="2.0.0")

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load model (absolute path — works regardless of cwd) ─────────────────────
_MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "student_model.pkl"
)
model = joblib.load(_MODEL_PATH)

_METADATA_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "model_metadata.json"
)

# ── Feature names (must match training order) ─────────────────────────────────
FEATURE_NAMES = ["attendance_rate", "cat_score", "prev_mean_grade", "helb_status"]

FEATURE_LABELS = {
    "attendance_rate":  "Attendance Rate",
    "cat_score":        "CAT Score",
    "prev_mean_grade":  "Previous Mean Grade",
    "helb_status":      "HELB Status",
}


# ── Helpers ───────────────────────────────────────────────────────────────────
def get_risk_category(score: float) -> str:
    if score < 40:
        return "High Risk"
    elif score < 60:
        return "Moderate Risk"
    return "Safe"


def get_primary_risk_factor(contributions: dict, predicted_score: float) -> str:
    """
    Return a plain-English warning identifying the primary risk factor.

    Strategy:
    - If any contribution is negative, the most-negative one is the primary risk.
    - Otherwise (all-positive coefficients like OLS on bounded features), the
      feature with the SMALLEST contribution is the primary risk factor for
      at-risk students (score < 60).
    - Safe students (score >= 60) get a positive message.
    """
    if predicted_score >= 60:
        return "Student is on track"

    # Prefer a negative contribution if one exists
    negative = {k: v for k, v in contributions.items() if v < 0}
    if negative:
        worst_key = min(negative, key=lambda k: negative[k])
    else:
        # All contributions positive — weakest one is the drag on performance
        worst_key = min(contributions, key=lambda k: contributions[k])

    label = FEATURE_LABELS.get(worst_key, worst_key)
    return f"Warning: Low {label} is the primary risk factor"





# ── DB dependency ─────────────────────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ═════════════════════════════════════════════════════════════════════════════
# INDIVIDUAL PREDICTION
# ═════════════════════════════════════════════════════════════════════════════
@app.post("/predict/individual")
def predict_individual(data: schemas.StudentCreate, db: Session = Depends(get_db)):
    feature_values = [
        data.attendance_rate,
        data.cat_score,
        data.prev_mean_grade,
        data.helb_status,
    ]
    X = np.array([feature_values])

    raw_pred  = float(model.predict(X)[0])
    final_score = round(max(0.0, min(100.0, raw_pred)), 2)

    # ── XAI: feature contributions = coef_i × value_i ─────────────────────
    contributions = {
        name: round(float(coef) * float(val), 4)
        for name, coef, val in zip(FEATURE_NAMES, model.coef_, feature_values)
    }

    risk_category       = get_risk_category(final_score)
    primary_risk_factor = get_primary_risk_factor(contributions, final_score)

    # ── Persist ───────────────────────────────────────────────────────────────
    new_record = models.StudentRecord(
        student_name        = data.student_name,
        reg_no              = data.reg_no,
        attendance_rate     = data.attendance_rate,
        cat_score           = data.cat_score,
        prev_mean_grade     = data.prev_mean_grade,
        helb_status         = data.helb_status,
        predicted_score     = final_score,
        risk_category       = risk_category,
        primary_risk_factor = primary_risk_factor,
    )
    history_record = models.PredictionHistory(
        student_name        = data.student_name,
        reg_no              = data.reg_no,
        attendance_rate     = data.attendance_rate,
        cat_score           = data.cat_score,
        prev_mean_grade     = data.prev_mean_grade,
        helb_status         = data.helb_status,
        predicted_score     = final_score,
        risk_category       = risk_category,
        primary_risk_factor = primary_risk_factor,
        prediction_type     = "Individual",
    )
    db.add(new_record)
    db.add(history_record)
    db.commit()
    db.refresh(new_record)

    return {
        "predicted_score":     final_score,
        "risk_category":       risk_category,
        "primary_risk_factor": primary_risk_factor,
        "id":                  new_record.id,
        "intercept":           round(float(model.intercept_), 4),
        "contributions":       contributions,
    }


# ═════════════════════════════════════════════════════════════════════════════
# BATCH PREDICTION
# ═════════════════════════════════════════════════════════════════════════════
@app.post("/predict/batch")
async def predict_batch(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))

    required_cols = {"attendance_rate", "cat_score", "prev_mean_grade", "helb_status"}
    missing = required_cols - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"CSV is missing required columns: {missing}. "
                   f"Required: attendance_rate, cat_score, prev_mean_grade, helb_status"
        )

    X_new = df[FEATURE_NAMES].astype(float)
    preds = model.predict(X_new)
    df["predicted_score"] = [round(max(0.0, min(100.0, float(p))), 2) for p in preds]
    df["risk_category"]   = df["predicted_score"].apply(get_risk_category)

    # ── Replace current batch (bulk insert for performance) ────────────────────
    db.query(models.BatchRecord).delete()

    batch_records   = []
    history_records = []

    for _, row in df.iterrows():
        student_name    = row.get("name", row.get("student_name", "Unknown"))
        reg_no          = row.get("reg_no", "—")
        predicted_score = row["predicted_score"]
        risk_cat        = row["risk_category"]

        batch_records.append(models.BatchRecord(
            student_name    = student_name,
            reg_no          = reg_no,
            attendance_rate = row.get("attendance_rate"),
            cat_score       = row.get("cat_score"),
            prev_mean_grade = row.get("prev_mean_grade"),
            helb_status     = int(row.get("helb_status", 0)),
            predicted_score = predicted_score,
            risk_category   = risk_cat,
        ))

        # XAI for each row
        fvals = [
            row.get("attendance_rate", 0),
            row.get("cat_score", 0),
            row.get("prev_mean_grade", 0),
            row.get("helb_status", 0),
        ]
        contribs = {
            name: float(coef) * float(val)
            for name, coef, val in zip(FEATURE_NAMES, model.coef_, fvals)
        }
        primary_rf = get_primary_risk_factor(contribs, predicted_score)

        history_records.append(models.PredictionHistory(
            student_name        = student_name,
            reg_no              = reg_no,
            attendance_rate     = row.get("attendance_rate"),
            cat_score           = row.get("cat_score"),
            prev_mean_grade     = row.get("prev_mean_grade"),
            helb_status         = int(row.get("helb_status", 0)),
            predicted_score     = predicted_score,
            risk_category       = risk_cat,
            primary_risk_factor = primary_rf,
            prediction_type     = "Batch",
        ))

    db.bulk_save_objects(batch_records)
    db.bulk_save_objects(history_records)
    db.commit()

    scores = df["predicted_score"].tolist()
    mean_score        = round(sum(scores) / len(scores), 2) if scores else 0
    high_risk_count   = int((df["risk_category"] == "High Risk").sum())
    moderate_risk_count = int((df["risk_category"] == "Moderate Risk").sum())
    safe_count        = int((df["risk_category"] == "Safe").sum())

    return {
        "count":              len(df),
        "mean_score":         mean_score,
        "high_risk_count":    high_risk_count,
        "moderate_risk_count": moderate_risk_count,
        "safe_count":         safe_count,
        # kept for backward compat
        "at_risk_count":      high_risk_count,
        "results":            df.to_dict(orient="records"),
    }


# ═════════════════════════════════════════════════════════════════════════════
# DASHBOARD ANALYTICS
# ═════════════════════════════════════════════════════════════════════════════
@app.get("/analytics/current-batch")
def get_batch_analytics(db: Session = Depends(get_db)):
    records = db.query(models.BatchRecord).all()

    if not records:
        return {
            "total": 0, "mean": 0,
            "atRisk": 0, "moderateRisk": 0, "safe": 0,
            "chartData": [], "detailed_results": [],
        }

    scores       = [r.predicted_score for r in records]
    student_list = [
        {
            "student_name":   r.student_name,
            "reg_no":         r.reg_no,
            "predicted_score": r.predicted_score,
            "risk_category":  r.risk_category or get_risk_category(r.predicted_score),
        }
        for r in records
    ]

    # Single-pass counting for traffic-light bands
    high_risk_count = moderate_risk_count = safe_count = 0
    for s in scores:
        if s < 40:
            high_risk_count += 1
        elif s < 60:
            moderate_risk_count += 1
        else:
            safe_count += 1

    chart_data = [
        {"range": "0–39 (High Risk)",     "label": "High Risk",     "count": high_risk_count,     "color": "#f87171"},
        {"range": "40–59 (Moderate Risk)", "label": "Moderate Risk", "count": moderate_risk_count, "color": "#fbbf24"},
        {"range": "60–100 (Safe)",         "label": "Safe",          "count": safe_count,          "color": "#34d399"},
    ]

    return {
        "total":        len(records),
        "mean":         round(sum(scores) / len(records), 2),
        "atRisk":       high_risk_count,         # students below 40 %
        "moderateRisk": moderate_risk_count,
        "safe":         safe_count,
        "chartData":    chart_data,
        "detailed_results": student_list,
    }


# ═════════════════════════════════════════════════════════════════════════════
# RESET BATCH DATA
# ═════════════════════════════════════════════════════════════════════════════
@app.delete("/analytics/reset")
def reset_data(db: Session = Depends(get_db)):
    db.query(models.BatchRecord).delete()
    db.commit()
    return {"message": "Batch data cleared successfully"}


# ═════════════════════════════════════════════════════════════════════════════
# PREDICTION HISTORY
# ═════════════════════════════════════════════════════════════════════════════
@app.get("/history")
def get_prediction_history(
    skip: int  = Query(0,   ge=0,           description="Records to skip"),
    limit: int = Query(100, ge=1, le=1000,  description="Max records to return"),
    db: Session = Depends(get_db),
):
    total = db.query(models.PredictionHistory).count()
    records = (
        db.query(models.PredictionHistory)
          .order_by(models.PredictionHistory.created_at.desc())
          .offset(skip)
          .limit(limit)
          .all()
    )
    return {
        "total":   total,
        "skip":    skip,
        "limit":   limit,
        "records": [
            schemas.PredictionHistoryResponse.model_validate(r).model_dump()
            for r in records
        ],
    }


# ═════════════════════════════════════════════════════════════════════════════
# MODEL CONFIG
# ═════════════════════════════════════════════════════════════════════════════
@app.get("/model/config")
def get_model_config():
    feature_display = {
        "attendance_rate":  "Attendance Rate (%)",
        "cat_score":        "CAT Score",
        "prev_mean_grade":  "Prev. Mean Grade",
        "helb_status":      "HELB Status",
    }
    weights = [
        {"feature": feature_display.get(name, name), "weight": round(float(coef), 4)}
        for name, coef in zip(FEATURE_NAMES, model.coef_)
    ]

    # Load metadata
    r2_score_val    = 0.0
    rmse_val        = 0.0
    cv_mean_r2      = 0.0
    cv_mean_rmse    = 0.0
    records_used    = 0

    if os.path.exists(_METADATA_PATH):
        try:
            with open(_METADATA_PATH, "r") as f:
                meta = json.load(f)
            r2_score_val = meta.get("r2_score", 0.0)
            rmse_val     = meta.get("rmse", 0.0)
            cv_mean_r2   = meta.get("cv_mean_r2", 0.0)
            cv_mean_rmse = meta.get("cv_mean_rmse", 0.0)
            records_used = meta.get("records_used", 0)
        except Exception as e:
            print(f"Error reading metadata: {e}")

    return {
        "weights":       weights,
        "intercept":     round(float(model.intercept_), 4),
        "status":        "active",
        "r2_score":      r2_score_val,     # percentage (e.g. 88.43)
        "rmse":          rmse_val,
        "cv_mean_r2":    cv_mean_r2,
        "cv_mean_rmse":  cv_mean_rmse,
        "records_used":  records_used,
    }
