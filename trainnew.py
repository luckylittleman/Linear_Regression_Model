import pandas as pd
import joblib
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