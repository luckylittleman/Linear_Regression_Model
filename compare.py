import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
from app.database import engine


# 1. Load your dataset
df = pd.read_sql("SELECT * FROM academic_records", con=engine)

# 2. Features & Target
X = df[['study_hours', 'prev_mean_grade', 'sleep_hours', 'revision_intensity']]
y = df['target_mean_score']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. The Regression Suite
models = {
    "Multiple Linear Regression": LinearRegression(),
    "Ridge Regression (L2)": Ridge(alpha=1.0),
    "Random Forest Regressor": RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42),
    "Gradient Boosting Regressor": GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, random_state=42)
}

performance = []

print(f"{'Model':<30} | {'MAE':<8} | {'MSE':<8} | {'R2 Score':<8}")
print("-" * 65)

best_r2 = -1
best_model = None

for name, model in models.items():
    # Training
    model.fit(X_train, y_train)
    
    # Prediction
    preds = model.predict(X_test)
    
    # Metrics
    mae = mean_absolute_error(y_test, preds)
    mse = mean_squared_error(y_test, preds)
    r2 = r2_score(y_test, preds)
    
    print(f"{name:<30} | {mae:.4f} | {mse:.4f} | {r2:.4f}")
    
    performance.append({"model": name, "r2": r2})
    
    # Track the winner
    if r2 > best_r2:
        best_r2 = r2
        best_model = model
        winner_name = name

# 4. Export the Champion
joblib.dump(best_model, 'student_model.pkl')
print(f"\n🏆 WINNER: {winner_name} saved as 'student_model.pkl'")