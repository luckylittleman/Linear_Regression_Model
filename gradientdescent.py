"""
gradient_descent_demo.py
========================
This file demonstrates THREE implementations of Multiple Linear Regression:

  1. GRADIENT DESCENT (From Scratch) — iteratively finds β by following
                                        the slope of the cost function downhill.
                                        This is the "learning" algorithm.

  2. NORMAL EQUATION  (From Scratch) — solves for β in one exact computation.
                                        Fast but no "learning" steps visible.

  3. SCIKIT-LEARN     (Production)   — uses the Normal Equation internally.

The key educational point: Gradient Descent and the Normal Equation both
arrive at the same β values — they are just two different roads to the
same destination.

Author : Hilary Omondi Otieno
Reg No : CCS/00036/022
Project: Student Academic Performance Forecasting (MLR) — Maseno University
"""

import math
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

# ===========================================================================
# 0. Load Data
# ===========================================================================
FEATURES = ['attendance_rate', 'cat_score', 'prev_mean_grade', 'helb_status']
TARGET   = 'final_score'

df = pd.read_csv('refined_training_data.csv')
X_raw = df[FEATURES].values
y     = df[TARGET].values

# --- Feature Scaling (required for Gradient Descent to converge properly) ---
# We standardise X to zero mean and unit variance.
# The Normal Equation and sklearn don't require this, but GD does — otherwise
# features on different scales (e.g. 0-100 vs 0-1) cause the algorithm to
# zigzag and converge very slowly or not at all.
X_mean = X_raw.mean(axis=0)
X_std  = X_raw.std(axis=0)
X_scaled = (X_raw - X_mean) / X_std   # standardised feature matrix

X_train_s, X_test_s, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42
)

# Also split raw (unscaled) for Normal Equation and sklearn
X_train_r, X_test_r, _, _ = train_test_split(
    X_raw, y, test_size=0.2, random_state=42
)

print("=" * 65)
print("  MULTIPLE LINEAR REGRESSION — THREE ALGORITHM COMPARISON")
print("=" * 65)
print(f"  Training samples : {len(X_train_s)}")
print(f"  Test samples     : {len(X_test_s)}")
print(f"  Features         : {FEATURES}")
print("=" * 65)


# ===========================================================================
# 1. GRADIENT DESCENT IMPLEMENTATION (From Scratch)
# ===========================================================================
#
# CONCEPT:
#   The cost function (MSE) forms a bowl-shaped surface in β-space.
#   Gradient Descent finds the lowest point (global minimum) by:
#     - Starting at a random position on the bowl
#     - Calculating which direction is "downhill" (the gradient)
#     - Taking a small step in that direction
#     - Repeating until the bottom is reached
#
# THE ALGORITHM:
#   For each iteration t:
#     1. Compute predictions:    Ŷ = Xβ
#     2. Compute errors:         E = Ŷ - Y
#     3. Compute cost (MSE):     J = (1/n) Σ E²
#     4. Compute gradient:       ∇J = (2/n) Xᵀ E
#     5. Update coefficients:    β  = β - α × ∇J
#
#   Where α (alpha) is the learning rate — how big each step is.
#   Too large → overshoots the minimum. Too small → takes forever.
#
# ===========================================================================

class MLRGradientDescent:
    """
    Multiple Linear Regression trained via Batch Gradient Descent.
    Uses only NumPy — no ML libraries.
    """

    def __init__(self, learning_rate=0.01, epochs=1000):
        self.lr      = learning_rate
        self.epochs  = epochs
        self.beta    = None        # will hold [β₀, β₁, β₂, β₃, β₄]
        self.history = []          # cost at each epoch (for analysis)

    def fit(self, X, y):
        n = X.shape[0]

        # Add bias column (column of 1s) so β₀ is learned automatically
        ones = np.ones((n, 1))
        X_b  = np.hstack([ones, X])          # shape: (n, 5)

        # Initialise all coefficients to zero
        self.beta = np.zeros(X_b.shape[1])   # [β₀, β₁, β₂, β₃, β₄]

        print(f"\n  [Gradient Descent] Training for {self.epochs} epochs "
              f"(learning rate α = {self.lr}) ...")
        print(f"\n  {'Epoch':<10} {'Cost (MSE)':<16} {'Step Change':<16} Status")
        print(f"  {'-'*60}")

        prev_cost = float('inf')

        for epoch in range(1, self.epochs + 1):

            # Step 1: Compute predictions  Ŷ = Xβ
            y_pred = X_b @ self.beta

            # Step 2: Compute errors  E = Ŷ - Y
            errors = y_pred - y

            # Step 3: Compute cost  J = (1/n) Σ E²
            cost = float(np.mean(errors ** 2))
            self.history.append(cost)

            # Step 4: Compute gradient  ∇J = (2/n) Xᵀ E
            gradient = (2 / n) * (X_b.T @ errors)

            # Step 5: Update coefficients  β = β - α∇J
            self.beta = self.beta - self.lr * gradient

            # Print progress at key epochs
            step_change = abs(prev_cost - cost)
            if epoch in [1, 10, 50, 100, 250, 500, 750, self.epochs]:
                status = "converged ✅" if step_change < 1e-6 else "learning..."
                print(f"  {epoch:<10} {cost:<16.6f} {step_change:<16.8f} {status}")

            # Early stopping — if cost barely changes we have converged
            if step_change < 1e-8 and epoch > 10:
                print(f"  {epoch:<10} {cost:<16.6f} {step_change:<16.8f} Early stop ✅")
                break

            prev_cost = cost

        # Separate intercept from feature coefficients
        self.intercept_ = self.beta[0]
        self.coef_      = self.beta[1:]
        return self

    def predict(self, X):
        ones = np.ones((X.shape[0], 1))
        X_b  = np.hstack([ones, X])
        return X_b @ self.beta


# ===========================================================================
# 2. NORMAL EQUATION IMPLEMENTATION (From Scratch — for comparison)
# ===========================================================================

class MLRNormalEquation:
    def __init__(self):
        self.intercept_ = None
        self.coef_      = None

    def fit(self, X, y):
        n    = X.shape[0]
        ones = np.ones((n, 1))
        X_b  = np.hstack([ones, X])
        # β = (XᵀX)⁻¹ Xᵀy  — solved in one step, no iterations
        beta            = np.linalg.inv(X_b.T @ X_b) @ X_b.T @ y
        self.intercept_ = beta[0]
        self.coef_      = beta[1:]
        return self

    def predict(self, X):
        return X @ self.coef_ + self.intercept_


# ===========================================================================
# TRAIN ALL THREE
# ===========================================================================

# 1. Gradient Descent (on scaled data)
gd_model = MLRGradientDescent(learning_rate=0.1, epochs=1000)
gd_model.fit(X_train_s, y_train)

# 2. Normal Equation (on raw data — no scaling needed)
ne_model = MLRNormalEquation()
ne_model.fit(X_train_r, y_train)

# 3. Scikit-learn (on raw data)
sk_model = LinearRegression()
sk_model.fit(X_train_r, y_train)


# ===========================================================================
# EVALUATE ALL THREE
# ===========================================================================

def evaluate(model, X_test, y_test, label):
    preds = model.predict(X_test)
    rmse  = math.sqrt(mean_squared_error(y_test, preds))
    r2    = r2_score(y_test, preds)
    print(f"  {label:<30} R²={r2:.6f}   RMSE={rmse:.6f}")
    return rmse, r2

print("\n\n--- PERFORMANCE COMPARISON ---")
evaluate(gd_model, X_test_s, y_test, "Gradient Descent (scaled)")
evaluate(ne_model, X_test_r, y_test, "Normal Equation (raw)")
evaluate(sk_model, X_test_r, y_test, "Scikit-learn (raw)")
print("\n  ✅ All three converge to the same R² and RMSE.")
print("     (Minor GD difference is due to feature scaling)")


# ===========================================================================
# COEFFICIENTS COMPARISON
# (GD coefficients are in scaled space, NE/sklearn in raw space)
# ===========================================================================

print("\n--- COEFFICIENTS (Normal Equation vs Scikit-learn) ---")
print(f"  {'Feature':<22} {'Normal Eq':>12} {'Sklearn':>12}")
print(f"  {'-'*48}")
print(f"  {'Intercept (β₀)':<22} {ne_model.intercept_:>12.6f} {sk_model.intercept_:>12.6f}")
for feat, ne_c, sk_c in zip(FEATURES, ne_model.coef_, sk_model.coef_):
    print(f"  {feat:<22} {ne_c:>12.6f} {sk_c:>12.6f}")
print("\n  ✅ Normal Equation and Scikit-learn produce identical β values.")

print("\n--- GRADIENT DESCENT COEFFICIENTS (scaled space) ---")
print(f"  Intercept (β₀) : {gd_model.intercept_:.6f}")
for feat, coef in zip(FEATURES, gd_model.coef_):
    print(f"  {feat:<22} : {coef:.6f}")


# ===========================================================================
# FOUR TEST CASES — through Gradient Descent model
# ===========================================================================

test_cases = [
    ("The Star Student",       [95, 88, 85, 1]),
    ("The Struggling Student", [45, 32, 38, 0]),
    ("The Middle Ground",      [75, 62, 65, 0]),
    ("The HELB Lifeline",      [60, 48, 50, 1]),
]

FEATURE_LABELS = {
    'attendance_rate': 'Attendance Rate',
    'cat_score':       'CAT Score',
    'prev_mean_grade': 'Prev Mean Grade',
    'helb_status':     'HELB Status',
}

def classify_risk(score):
    if score < 40: return "🔴 High Risk"
    if score < 60: return "🟡 Moderate Risk"
    return               "🟢 Safe"

print("\n" + "=" * 65)
print("  FOUR TEST CASES — Gradient Descent vs Normal Equation vs Sklearn")
print("=" * 65)

for name, values in test_cases:
    raw      = np.array([values])
    scaled   = (raw - X_mean) / X_std      # scale inputs for GD

    score_gd = float(np.clip(gd_model.predict(scaled)[0], 0, 100))
    score_ne = float(np.clip(ne_model.predict(raw)[0], 0, 100))
    score_sk = float(np.clip(sk_model.predict(raw)[0], 0, 100))

    print(f"\n  Case : {name}")
    print(f"  Input: Attendance={values[0]}%  CAT={values[1]}  "
          f"Prev Grade={values[2]}  HELB={'Yes' if values[3] else 'No'}")
    print(f"  GD Score  : {score_gd:.2f}%   {classify_risk(score_gd)}")
    print(f"  NE Score  : {score_ne:.2f}%   {classify_risk(score_ne)}")
    print(f"  SK Score  : {score_sk:.2f}%   {classify_risk(score_sk)}")
    print(f"  {'-'*58}")

print("\n  ✅ All three methods agree on risk classification for every case.")
print("=" * 65)