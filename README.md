# 🎓 Student Performance Forecasting System (MLR)

This project implements a high-precision predictive analytics system to forecast student performance (Mean Score) based on behavioral and academic factors. Optimized for the Kenyan higher education context.

## 🚀 Development Phases (SDLC)

### 🔹 Phase 1: Research & Data Engineering
- [x] **Exploratory Data Analysis (EDA)**: Generated Correlation Heatmaps to identify feature relationships.
- [x] **Feature Engineering**: Dropped zero-variance features (e.g., constant attendance) and normalized behavioral metrics.
- [x] **Synthetic Population Generation**: Created a 10,000-record dataset modeled with non-linear academic behaviors.

### 🔹 Phase 2: Model Architecture & Optimization
- [x] **Multiple Linear Regression (MLR)**: Initial implementation using Ordinary Least Squares (OLS).
- [x] **Ridge Regularization**: Transitioned to Ridge Regression ($\alpha=1.0$) to penalize over-dominant weights and improve generalization.
- [x] **Stochastic Modeling**: Introduced Gaussian noise and logarithmic study hours to mimic real-world unpredictability.

### 🔹 Phase 3: Backend Infrastructure (Littleman-01)
- [x] **API Development**: Built a high-performance REST API using **FastAPI**.
- [x] **Schema Validation**: Implemented Pydantic V2 models with strict constraints (0-168h weekly study limits).
- [x] **Persistence**: Integrated SQLite/PostgreSQL with SQLAlchemy ORM for batch record storage.

### 🔹 Phase 4: Frontend & Dashboard Visualization
- [x] **Interface Design**: Developed a dark-themed UI using **Vite + React**.
- [x] **Real-time Inference**: Integrated Individual Predictor view with instant model feedback.
- [x] **Batch Processing**: Built a CSV upload engine to process 10,000 students in a single transaction.

### 🔹 Phase 5: Validation & Quality Assurance
- [x] **Sensitivity Analysis**: Verified the model's high sensitivity to **Sleep Hours** (65.5% importance).
- [x] **Case Study Testing**: Successfully validated the "Sleep Penalty" and "Historical Anchor" logic against 4 distinct student profiles.
- [x] **UI/UX Polishing**: Fixed dynamic percentage rendering and responsive metric cards.

## 🧠 Machine Learning Intelligence
The system utilizes a **Ridge Regression** engine to ensure that predictions remain grounded in historical performance while respecting the physiological limits of student effort.

### 📊 Performance Metrics
- **R-Squared ($R^2$): 0.8374** (Balanced fit for real-world generalization).
- **Primary Anchor**: Previous Mean Grade (14.9% importance).
- **Secondary Multiplier**: Sleep Hours (65.5% importance - High Sensitivity).



## 🛠️ Tech Stack
- **Frontend**: React 18, Tailwind CSS, Lucide Icons, Recharts.
- **Backend**: FastAPI, Uvicorn, Python 3.12.
- **ML Logic**: Scikit-learn, Pandas, NumPy, Joblib.

## ⚙️ Setup & Installation
1. **Activate venv**: `source venv/bin/activate`
2. **Install Dependencies**: `pip install -r requirements.txt`
3. **Run Services**:
   - Backend: `uvicorn app.main:app --reload`
   - Frontend: `npm run dev`

---
*Developed by Otieno Hilary Omondi as a Final Year Project (2026).*