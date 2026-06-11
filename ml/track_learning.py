"""
ml/track_learning.py
--------------------
Demonstrates online / incremental learning using SGDRegressor — for academic
illustration of gradient descent. Uses the correct 4 feature columns.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
from sklearn.linear_model import SGDRegressor
from sklearn.metrics import mean_squared_error

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH     = os.path.join(PROJECT_ROOT, "refined_training_data.csv")

FEATURES = ["attendance_rate", "cat_score", "prev_mean_grade", "helb_status"]
TARGET   = "final_score"


def live_train_demo():
    df = pd.read_csv(CSV_PATH)
    X  = df[FEATURES]
    y  = df[TARGET]

    # SGD: warm_start keeps learning from where we left off
    model = SGDRegressor(max_iter=1, tol=None, warm_start=True, eta0=0.0001)

    print(f"\n{'Epoch':<8} | {'MSE (Cost)':<14} | {'Weights (m1, m2, m3, m4)'}")
    print("─" * 65)

    for epoch in range(1, 201):   # 200 epochs for demo
        model.fit(X, y)
        predictions = model.predict(X)
        mse = mean_squared_error(y, predictions)
        weights = ", ".join([f"{w:.3f}" for w in model.coef_])
        if epoch % 10 == 0:      # print every 10 epochs to reduce noise
            print(f"{epoch:<8} | {mse:<14.4f} | [{weights}]")

    print("─" * 65)
    print("Gradient Descent complete.")


if __name__ == "__main__":
    live_train_demo()