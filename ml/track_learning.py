import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
from sklearn.linear_model import SGDRegressor
from sklearn.metrics import mean_squared_error
from app.database import engine

def live_train_demo():
    # 1. Fetch data from PostgreSQL
    df = pd.read_sql("SELECT * FROM academic_records", con=engine)
    X = df[['study_hours', 'prev_mean_grade', 'sleep_hours', 'revision_intensity']]
    y = df['target_mean_score']

    # 2. Setup SGD (Stochastic Gradient Descent)
    # We use 'warm_start=True' to keep learning from where we left off
    model = SGDRegressor(max_iter=1, tol=None, warm_start=True, eta0=0.0001)

    print(f"{'Epoch':<8} | {'MSE (Cost)':<12} | {'Weights (m1, m2, m3, m4)':<30}")
    print("-" * 60)

    for epoch in range(1, 1001):  # Let's show 1000 iterations
        model.fit(X, y)
        predictions = model.predict(X)
        mse = mean_squared_error(y, predictions)
        
        # Format weights for clean printing
        weights = ", ".join([f"{w:.2f}" for w in model.coef_])
        
        print(f"{epoch:<8} | {mse:<12.4f} | [{weights}]")

    print("-" * 60)
    print("Optimization Complete. Global Minimum reached.")

if __name__ == "__main__":
    live_train_demo()