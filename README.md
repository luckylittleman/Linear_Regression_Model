# Student Academic Performance Forecasting
**Maseno University, Kenya — Final Year CS Project**

A full-stack system for predicting student final percentage scores using **Multiple Linear Regression**.

## Four Model Features
| Feature | Range | Description |
|---|---|---|
| `attendance_rate` | 0–100 % | Proxy for student commitment |
| `cat_score` | 0–100 | Continuous Assessment Test (strongest predictor) |
| `prev_mean_grade` | 0–100 | Historical academic trajectory (cumulative GPA) |
| `helb_status` | 0 or 1 | HELB funding status — socio-economic proxy |

## Risk Bands
| Score Range | Label | Color |
|---|---|---|
| < 40 % | **High Risk** | 🔴 Red |
| 40 – 59 % | **Moderate Risk** | 🟡 Amber |
| ≥ 60 % | **Safe** | 🟢 Green |

---

## Quick Start

### 1 — Generate Synthetic Training Data
```bash
python refined_data.py
# Creates refined_training_data.csv with 10,000 records
```

### 2 — Train the Model
```bash
python ml/train_model.py
# Trains LinearRegression (OLS), saves student_model.pkl + model_metadata.json
# Reports: R², RMSE, 5-Fold CV Mean R², 5-Fold CV Mean RMSE
```

### 3 — (Optional) Compare Models
```bash
python compare.py
# Compares LinearRegression vs Ridge vs Random Forest vs Gradient Boosting
# Does NOT overwrite the production model
```

### 4 — Initialise the Database
```bash
python initdb.py
# Creates PostgreSQL tables (drops old tables if they exist)
```

### 5 — Run the Backend API
```bash
uvicorn app.main:app --reload --port 8000
# API docs: http://localhost:8000/docs
```

### 6 — Run the Frontend
```bash
cd frontend
npm install   # first time only
npm run dev
# Open: http://localhost:5173
```

---

## Architecture
```
linear_regression_model2/
├── refined_data.py          ← Generate 10,000 synthetic training records
├── refined_training_data.csv
├── student_model.pkl        ← Trained production model (OLS)
├── model_metadata.json      ← r2_score, rmse, cv_mean_r2, cv_mean_rmse
├── compare.py               ← Academic comparison (Ridge, RF, GB) — read-only
├── ingest_data.py           ← Load external CSV into PostgreSQL
├── initdb.py                ← Create/reset DB tables
├── requirements.txt
│
├── ml/
│   ├── train_model.py       ← Authoritative training script
│   ├── correlation.py       ← Correlation heatmap
│   ├── inspect_math.py      ← Print learned regression equation
│   └── track_learning.py    ← SGD live demo (academic illustration)
│
├── app/                     ← FastAPI backend
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   └── database.py
│
└── frontend/                ← React + Vite
    └── src/
        └── components/
            ├── IndividualPredictor.jsx
            ├── Dashboard.jsx
            ├── BatchUpload.jsx
            ├── HistoryTab.jsx
            └── ModelInsights.jsx
```

## CSV Upload Format (Batch Prediction)
Your CSV file must contain these exact column names:
```
name,reg_no,attendance_rate,cat_score,prev_mean_grade,helb_status
Otieno James,K12/0023/22,82.5,67,74,1
Wanjiru Faith,K12/0099/22,55,45,50,0
```

## API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/predict/individual` | Single student prediction + XAI |
| POST | `/predict/batch` | Bulk CSV upload |
| GET | `/analytics/current-batch` | Dashboard analytics |
| GET | `/history` | Full prediction history log |
| GET | `/model/config` | Model weights, R², RMSE, CV metrics |
| DELETE | `/analytics/reset` | Clear current batch data |

## Dependencies
See `requirements.txt`. Key packages:
- `fastapi`, `uvicorn`, `sqlalchemy`, `psycopg2-binary`
- `scikit-learn`, `pandas`, `numpy`, `joblib`
- `react`, `recharts`, `axios` (frontend)