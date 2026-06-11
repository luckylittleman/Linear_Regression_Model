"""
compare.py
----------
Academic comparison of multiple regression algorithms on the student dataset.
This script is for research/analysis only — it does NOT save a model file.

The production model (LinearRegression) is trained exclusively in ml/train_model.py.
Ridge Regression, Random Forest, and Gradient Boosting are shown here for comparison.
"""

import pandas as pd
import numpy as np
import math
import os
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
CSV_PATH     = os.path.join(PROJECT_ROOT, "refined_training_data.csv")

FEATURES = ["attendance_rate", "cat_score", "prev_mean_grade", "helb_status"]
TARGET   = "final_score"

# 1. Load dataset
df = pd.read_csv(CSV_PATH)
X  = df[FEATURES]
y  = df[TARGET]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 2. The Regression Suite
models = {
    "Multiple Linear Regression (OLS)": LinearRegression(),
    "Ridge Regression (L2, α=1.0)":     Ridge(alpha=1.0),
    "Random Forest Regressor":           RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42),
    "Gradient Boosting Regressor":       GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, random_state=42),
}

print(f"\n{'Model':<35} | {'MAE':>7} | {'RMSE':>7} | {'R² Score':>9}")
print("─" * 70)

for name, model in models.items():
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    mae  = mean_absolute_error(y_test, preds)
    rmse = math.sqrt(mean_squared_error(y_test, preds))
    r2   = r2_score(y_test, preds)
    print(f"{name:<35} | {mae:7.4f} | {rmse:7.4f} | {r2:9.4f}")

print("─" * 70)
print("\nNote: The production model is Multiple Linear Regression (OLS) as")
print("      specified in the project proposal.  Ridge is shown for comparison.")
print("      To retrain the production model run: python ml/train_model.py\n")