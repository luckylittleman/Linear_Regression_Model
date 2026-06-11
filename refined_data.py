"""
refined_data.py
---------------
Generates 10,000 synthetic student records for training the Multiple Linear
Regression model.  Features match the project proposal:

  attendance_rate  – 0–100  (proxy for commitment)
  cat_score        – 0–100  (Continuous Assessment Test; strongest predictor)
  prev_mean_grade  – 0–100  (historical academic trajectory)
  helb_status      – 0 or 1 (1 = HELB-funded; socio-economic proxy)

Target: final_score (0–100, continuous)

Realistic Kenyan university correlations:
  - CAT score is the strongest predictor  (~40 % weight)
  - Previous mean grade is next           (~30 % weight)
  - Attendance rate has a strong effect   (~25 % weight)
  - HELB status adds a small boost        (~+3 pts on average)
  - Gaussian noise simulates real-world unpredictability
"""

import numpy as np
import pandas as pd

def generate_training_data(n: int = 10_000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    # ── Feature distributions ────────────────────────────────────────────────
    # Attendance: most students attend 50-95 % of classes
    attendance_rate  = rng.uniform(40, 100, n)

    # CAT score: bell-shaped around 60, clipped to [20, 100]
    cat_score        = np.clip(rng.normal(60, 15, n), 20, 100)

    # Previous mean grade: spread from weak to excellent students
    prev_mean_grade  = np.clip(rng.normal(58, 18, n), 20, 100)

    # HELB status: ~55 % of Maseno students are HELB-funded
    helb_status      = rng.choice([0, 1], size=n, p=[0.45, 0.55]).astype(float)

    # ── Target variable ───────────────────────────────────────────────────────
    # Base linear combination – coefficients tuned for realistic Kenyan grades
    score = (
        0.38 * cat_score
        + 0.30 * prev_mean_grade
        + 0.25 * attendance_rate
        + 3.00 * helb_status
        + 2.50                       # small intercept baseline
    )

    # Attendance penalty: students attending < 50 % drop sharply
    score = np.where(attendance_rate < 50, score - 8, score)

    # Add Gaussian noise (σ = 4) to simulate real-world variability
    noise = rng.normal(0, 4, n)
    score = np.clip(score + noise, 0, 100)

    df = pd.DataFrame({
        "attendance_rate": np.round(attendance_rate, 2),
        "cat_score":       np.round(cat_score, 2),
        "prev_mean_grade": np.round(prev_mean_grade, 2),
        "helb_status":     helb_status.astype(int),
        "final_score":     np.round(score, 2),
    })
    return df


if __name__ == "__main__":
    df = generate_training_data()
    df.to_csv("refined_training_data.csv", index=False)
    print(f"✅  Dataset generated: {len(df):,} rows")
    print(df[["attendance_rate", "cat_score", "prev_mean_grade", "helb_status", "final_score"]].describe().round(2))