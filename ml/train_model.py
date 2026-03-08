import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import pandas as pd
import joblib  # To save the model
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score
from app.database import engine

def train_student_model():
    # 1. Fetch data from PostgreSQL
    print("Fetching 10,000 records from 'Littleman'...")
    df = pd.read_sql("SELECT * FROM academic_records", con=engine)

    # 2. Feature Selection (Dropping non-math columns)
    # We keep study_hours, prev_mean_grade, sleep_hours, and revision_intensity
    X = df[['study_hours', 'prev_mean_grade', 'sleep_hours', 'revision_intensity']]
    y = df['target_mean_score']

    # 3. Split data (80% for training, 20% for testing)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 4. Initialize and Train the Model
    print("Training Multiple Linear Regression model...")
    model = LinearRegression()
    model.fit(X_train, y_train)

    # 5. Evaluate the "Intelligence"
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)

    print(f"\n--- Model Performance ---")
    print(f"R-Squared Score: {r2:.4f}")
    print(f"Mean Absolute Error: {mae:.2f} marks")
    print("-------------------------\n")

    # 6. Save the model to a file
    joblib.dump(model, "student_model.pkl")
    print("Model saved as 'student_model.pkl'. Milestone 2.3 Complete!")

if __name__ == "__main__":
    train_student_model()