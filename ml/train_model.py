"""
ml/train_model.py
-----------------
Authoritative training script for the Student Performance Forecasting model.

Features (from project proposal):
  attendance_rate  – Attendance rate 0–100 %
  cat_score        – CAT score 0–100
  prev_mean_grade  – Previous mean grade 0–100
  helb_status      – HELB funding status (1 = funded, 0 = not funded)

Target: final_score (0–100, continuous)

Algorithm: sklearn.linear_model.LinearRegression (OLS) — as specified in proposal.
Ridge is only available in compare.py for academic comparison.

Outputs:
  • student_model.pkl      — saved at project root
  • model_metadata.json    — r2_score, rmse, cv_mean_r2, cv_mean_rmse, records_used
"""

import sys
import os
import json
import math

# Allow imports from project root (e.g. app.database)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
import joblib
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split, cross_validate, KFold
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error


# ── Paths ────────────────────────────────────────────────────────────────────
PROJECT_ROOT    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH        = os.path.join(PROJECT_ROOT, "refined_training_data.csv")
MODEL_PATH      = os.path.join(PROJECT_ROOT, "student_model.pkl")
METADATA_PATH   = os.path.join(PROJECT_ROOT, "model_metadata.json")

FEATURES = ["attendance_rate", "cat_score", "prev_mean_grade", "helb_status"]
TARGET   = "final_score"


def train_student_model():
    # ── 1. Load data ─────────────────────────────────────────────────────────
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(
            f"Training data not found at {CSV_PATH}.\n"
            "Run `python refined_data.py` first to generate it."
        )
    df = pd.read_csv(CSV_PATH)
    print(f"✅  Loaded {len(df):,} records from {CSV_PATH}")

    X = df[FEATURES]
    y = df[TARGET]

    # ── 2. Train / test split (80 / 20) ──────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # ── 3. Train model (OLS Linear Regression) ───────────────────────────────
    print("⚙️   Training Multiple Linear Regression (OLS)…")
    model = LinearRegression()
    model.fit(X_train, y_train)

    # ── 4. Coefficients ───────────────────────────────────────────────────────
    coeffs = pd.DataFrame({"Feature": FEATURES, "Coefficient": model.coef_})
    print("\n--- Regression Coefficients ---")
    print(coeffs.to_string(index=False))
    print(f"Intercept : {model.intercept_:.4f}\n")

    # ── 5. Hold-out evaluation ────────────────────────────────────────────────
    preds    = model.predict(X_test)
    r2       = r2_score(y_test, preds)
    mse      = mean_squared_error(y_test, preds)
    rmse     = math.sqrt(mse)
    mae      = mean_absolute_error(y_test, preds)

    print("--- Hold-out Performance (20 % test set) ---")
    print(f"  R² Score : {r2:.4f}  ({r2*100:.2f} %)")
    print(f"  RMSE     : {rmse:.4f} marks")
    print(f"  MAE      : {mae:.4f} marks")

    # ── 6. 5-Fold Cross-Validation ────────────────────────────────────────────
    print("\n⚙️   Running 5-Fold Cross-Validation…")
    kf = KFold(n_splits=5, shuffle=True, random_state=42)
    cv_results = cross_validate(
        LinearRegression(), X, y, cv=kf,
        scoring=["r2", "neg_root_mean_squared_error"],
        return_train_score=False
    )
    cv_mean_r2   = float(np.mean(cv_results["test_r2"]))
    cv_mean_rmse = float(np.mean(-cv_results["test_neg_root_mean_squared_error"]))

    print(f"  CV Mean R²   : {cv_mean_r2:.4f}  ({cv_mean_r2*100:.2f} %)")
    print(f"  CV Mean RMSE : {cv_mean_rmse:.4f} marks")

    # ── 7. Save model ─────────────────────────────────────────────────────────
    joblib.dump(model, MODEL_PATH)
    print(f"\n✅  Model saved → {MODEL_PATH}")

    # ── 8. Save metadata ──────────────────────────────────────────────────────
    metadata = {
        "r2_score":     round(r2 * 100, 2),       # percentage form
        "rmse":         round(rmse, 4),
        "mae":          round(mae, 4),
        "cv_mean_r2":   round(cv_mean_r2 * 100, 2),
        "cv_mean_rmse": round(cv_mean_rmse, 4),
        "records_used": len(df),
        "features":     FEATURES,
    }
    with open(METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=4)
    print(f"✅  Metadata saved → {METADATA_PATH}")
    print("\n" + "─" * 50)
    print(json.dumps(metadata, indent=2))
    print("─" * 50)


if __name__ == "__main__":
    train_student_model()