# Student Grade Predictor

This project implements a predictive analytics system to forecast student grades (Mean Score) based on various academic and socio-economic factors. It is specifically tailored for the Kenyan higher education context.

## 🚀 Project Status: Milestone 1 Complete
- [x] **Infrastructure**: PostgreSQL database integration and SQLAlchemy ORM setup.
- [x] **API Layer**: FastAPI backend with automated database initialization.
- [x] **Data Validation**: Pydantic V2 schemas for strict data integrity.
- [ ] **Milestone 2**: Machine Learning Model Training (Multiple Linear Regression).
- [ ] **Milestone 3**: Dashboard & Visualization.

## 🛠️ Tech Stack
- **Language**: Python 3.12
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Data Logic**: Pydantic V2, Pandas

## 📂 Project Structure
```text
├── app/
│   ├── database.py      # Database connection & engine
│   ├── models.py        # SQLAlchemy relational models
│   ├── schemas.py       # Pydantic data validation
│   └── main.py          # FastAPI application entry point
├── data/                # Raw Kaggle CSV storage
├── .gitignore           # Environment & cache filters
└── requirements.txt     # Project dependencies

## Setup & Installation
Activate virtual environment: source venv/bin/activate

Install dependencies: pip install -r requirements.txt

Run the server: python3 -m uvicorn app.main:app --reload