"""
ml/correlation.py  (renamed from corelation.py — typo fixed)
--------------------------------------------------------------
Generates a correlation heatmap from the synthetic training dataset.
Run this after generating refined_training_data.csv.
"""

import os
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH     = os.path.join(PROJECT_ROOT, "refined_training_data.csv")
OUT_PATH     = os.path.join(os.path.dirname(os.path.abspath(__file__)), "correlation_heatmap.png")

# Load the dataset
df = pd.read_csv(CSV_PATH)

# Rename columns for prettier heatmap labels
label_map = {
    "attendance_rate": "Attendance Rate (%)",
    "cat_score":       "CAT Score",
    "prev_mean_grade": "Prev. Mean Grade",
    "helb_status":     "HELB Status",
    "final_score":     "Final Score",
}
df = df.rename(columns=label_map)

corr_matrix = df.corr(numeric_only=True)

plt.figure(figsize=(8, 6))
sns.heatmap(
    corr_matrix, annot=True, cmap="coolwarm",
    fmt=".2f", linewidths=0.5, square=True
)
plt.title("Correlation Heatmap – Student Performance Features")
plt.tight_layout()
plt.savefig(OUT_PATH, dpi=150)
print(f"✅  Heatmap saved → {OUT_PATH}")
