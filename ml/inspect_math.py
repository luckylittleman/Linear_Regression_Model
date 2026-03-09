import joblib
import os

# Load the brain 
model_path = os.path.join(os.path.dirname(__file__), "student_model.pkl")
model = joblib.load(model_path)

# The Features  used
features = ['Study Hours', 'Prev Mean Grade', 'Sleep Hours', 'Revision Intensity']

print("--- THE MATHEMATICAL WEIGHTS ---")
print(f"Intercept (b): {model.intercept_:.4f}")
print("-" * 30)

# Match each 'm' to its feature name
for feature, coef in zip(features, model.coef_):
    print(f"Weight (m) for {feature}: {coef:.4f}")
print("-" * 30)