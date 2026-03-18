import pandas as pd
import joblib
import json
import os
from sklearn.model_selection import train_test_split
from sklearn.linear_model import Ridge
from sklearn.metrics import r2_score

# Load the smart data
df = pd.read_csv('refined_training_data.csv')
X = df[['study_hours', 'prev_mean_grade', 'sleep_hours', 'revision_intensity']]
y = df['score']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Use Ridge (alpha=1.0 is the penalty strength)
model = Ridge(alpha=1.0)
model.fit(X_train, y_train)

# Save the new model
joblib.dump(model, 'student_model.pkl')

print(f"Model Retrained! New R² Score: {r2_score(y_test, model.predict(X_test)):.4f}")
print("Coefficients:", dict(zip(X.columns, model.coef_)))

r2 = r2_score(y_test, model.predict(X_test))

metadata = {
    "r2_score": round(r2 * 100, 2),
    "records_used": len(df)
}

metadata_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'model_metadata.json')
with open(metadata_path, 'w') as f:
    json.dump(metadata, f, indent=4)

print(f"Metadata saved to {metadata_path}")