

import os
import joblib

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH   = os.path.join(PROJECT_ROOT, "student_model.pkl")

model = joblib.load(MODEL_PATH)

FEATURES = [
    "Attendance Rate (%)",
    "CAT Score",
    "Prev. Mean Grade",
    "HELB Status",
]

print("\n" + "─" * 45)
print(" REGRESSION EQUATION COEFFICIENTS")
print("─" * 45)
print(f"  Intercept (β₀) : {model.intercept_:.4f}")
for feature, coef in zip(FEATURES, model.coef_):
    sign = "+" if coef >= 0 else "−"
    print(f"  {feature:<22} : {sign}{abs(coef):.4f}")
print("─" * 45)
print()

eq_parts = " + ".join(
    f"({c:.4f} × {f})"
    for c, f in zip(model.coef_, FEATURES)
)
print(f"  ŷ = {model.intercept_:.4f} + {eq_parts}")
print()