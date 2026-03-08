# 🎓 Student Grade Predictor (Multiple Linear Regression)

This project implements a high-precision predictive analytics system to forecast student performance (Mean Score) based on academic and socio-economic factors. It is specifically optimized for the Kenyan higher education context.

## 🚀 Project Status: Milestone 2 Complete ✅
- [x] **Infrastructure**: PostgreSQL database integration and SQLAlchemy ORM setup.
- [x] **Data Ingestion**: Successful migration of 10,000 student records into PostgreSQL.
- [x] **ML Research**: Exploratory Data Analysis (EDA) and Correlation Heatmap generation.
- [x] **Model Training**: Achieved a **0.9887 R-Squared** score using Multiple Linear Regression.
- [x] **API Integration**: Functional `/predict` endpoint delivering real-time predictions.
- [ ] **Milestone 3**: Frontend Dashboard & Visualization.

## 🧠 Machine Learning Intelligence
The model was trained on **10,000 records** on **"Littleman"** using Scikit-Learn.

### Model Performance
- **R-Squared ($R^2$): 0.9887** (Explains 98.87% of grade variance).
- **Mean Absolute Error (MAE): 1.63 marks** (High precision prediction).
- **Cost Function**: Mean Squared Error (MSE).
- **Optimizer**: Gradient Descent.



### Key Insights (Feature Selection)
Analysis showed that **Previous Mean Grade (0.92 correlation)** is the strongest predictor of success, followed by **Study Hours (0.37 correlation)**. 
> **Note:** The `attendance_rate` feature was dropped during the engineering phase as it was constant (90%) for all records, providing zero variance for the model to learn from.



## 🛠️ Tech Stack
- **Backend**: FastAPI & Uvicorn.
- **Database**: PostgreSQL (Relational Storage).
- **Data Science**: Scikit-learn, Pandas, NumPy, Joblib.
- **Validation**: Pydantic V2 & SQLAlchemy.

## 📂 Project Structure
```text
├── app/                # Production API Logic (FastAPI, Models, DB)
├── ml/                 # Training scripts, Heatmap, and .pkl Model
├── Data/               # Raw and Cleaned CSV storage
├── requirements.txt    # Project dependencies


📡 API Usage
To get a prediction, send a POST request to /predict:

Request Body (JSON):
{
  "study_hours": 7.5,
  "prev_mean_grade": 82.0,
  "sleep_hours": 6.5,
  "revision_intensity": 4
}

⚙️ Setup & Installation
Activate venv: source venv/bin/activate

Install: pip install -r requirements.txt

Run Server: python3 -m uvicorn app.main:app --reload