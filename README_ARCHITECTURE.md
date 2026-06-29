# Student Academic Performance Forecasting: Architectural Deep Dive

This document provides a technical deep dive into the architecture of the Student Academic Performance Forecasting project. It is intended to supplement the main `README.md` by detailing the inner workings of the frontend, backend, and machine learning components.

## Architecture Overview

The system is a classic three-tier, full-stack application designed to serve a predictive analytics engine.

!Architecture Diagram

1.  **Frontend**: A responsive and interactive dashboard built with **React** and **Vite**. It is the sole interface for all user interactions, from making single predictions to viewing historical analytics.
2.  **Backend**: A high-performance REST API built with **FastAPI** (Python). It acts as the central nervous system, handling user requests, orchestrating database interactions, and performing real-time inference using the machine learning model.
3.  **ML Model**: A **Multiple Linear Regression (OLS)** model trained using **Scikit-learn**. It is serialized and loaded by the backend to provide predictions on student performance.

These components are decoupled but work in concert. The frontend communicates with the backend via a RESTful API. The backend, in turn, loads and queries the ML model for predictions and uses a PostgreSQL database for data persistence.

---

## Frontend

The frontend is a modern Single-Page Application (SPA) providing a comprehensive user interface for interacting with the prediction engine.

### Key Features & Components

The UI is organized into a five-tab interface, with each tab corresponding to a distinct user workflow:

*   **Individual Predictor (`IndividualPredictor.jsx`)**: A form for submitting the four key features of a single student. It displays the predicted score and the XAI-powered risk analysis in real-time.
*   **Dashboard Analytics (`Dashboard.jsx`)**: Presents high-level visualizations and aggregated statistics from the prediction history, likely using a charting library to render data fetched from the backend's analytics endpoint.
*   **Batch Upload (`BatchUpload.jsx`)**: A drag-and-drop interface for uploading CSV files containing multiple student records for batch prediction.
*   **Prediction History (`HistoryTab.jsx`)**: A paginated, searchable log of every prediction made through the system, providing a complete audit trail.
*   **Model Insights (`ModelInsights.jsx`)**: A dedicated view that displays the core metrics and metadata of the currently deployed model, including its R² score, RMSE, cross-validation results, and learned coefficients (weights).

### Tech Stack

*   **Framework/Library**: React
*   **Build Tool**: Vite
*   **Language**: JavaScript (JSX)
*   **API Communication**: Asynchronous `fetch` or a library like `axios` to interact with the FastAPI backend.

---

## Backend (Deep Dive)

The backend is the core of the application, responsible for business logic, data persistence, and model serving. It is built using a modern Python stack chosen for performance and ease of development.

### Tech Stack

*   **Framework**: **FastAPI** for building high-performance, asynchronous REST APIs with automatic OpenAPI/Swagger documentation.
*   **Data Validation**: **Pydantic** for defining clear, type-hinted data schemas (`schemas.py`) that ensure all incoming requests and outgoing responses are correctly structured.
*   **Database ORM**: **SQLAlchemy** for interacting with the PostgreSQL database, defining data models (`models.py`) and managing sessions (`database.py`).
*   **Database**: **PostgreSQL** for robust, transactional storage of all prediction records and batch job information.
*   **ML Library**: **Joblib** (part of Scikit-learn's ecosystem) to load the serialized `.pkl` model file into memory.

### API Endpoints (`main.py`)

The backend exposes a RESTful API with at least six documented endpoints, accessible at `/docs` on the running server.

*   `POST /predict/individual`
    *   **Description**: Accepts data for a single student and returns a real-time prediction with XAI analysis.
    *   **Request Body (Pydantic Schema)**: `{ "attendance_rate": float, "cat_score": float, "prev_mean_grade": float, "helb_status": int }`
    *   **Action**: Validates input, passes it to the loaded model for inference, calculates risk category and feature contributions, logs the result to the `History` table in PostgreSQL, and returns the complete analysis.
    *   **Response**: `{ "predicted_score": float, "risk_category": "High Risk" | "Moderate Risk" | "Safe", "contributions": {...} }`

*   `POST /predict/batch`
    *   **Description**: Accepts a CSV file for batch predictions.
    *   **Request Body**: `multipart/form-data` containing the CSV file.
    *   **Action**: Streams the CSV file, processes each row, performs a prediction for each student, and logs the entire operation as a single entry in the `BatchRecord` table, with individual results potentially linked or stored.
    *   **Response**: A summary of the batch operation, such as `{ "job_id": "...", "records_processed": int, "status": "COMPLETED" }`.

*   `GET /analytics/dashboard`
    *   **Description**: Provides aggregated data for the main dashboard visualizations.
    *   **Action**: Executes analytical queries against the PostgreSQL database (e.g., distribution of risk categories, average predicted scores over time).
    *   **Response**: JSON data structured for easy consumption by a frontend charting library.

*   `GET /history`
    *   **Description**: Retrieves a paginated list of all past predictions from the `History` table.
    *   **Response**: A JSON array of historical prediction records.

*   `GET /model/config`
    *   **Description**: Returns the metadata of the currently loaded model.
    *   **Action**: Reads the `model_metadata.json` file.
    *   **Response**: `{ "r_squared": 0.83, "rmse": 4.56, "cv_scores": [...], ... }`

*   `POST /data/reset`
    *   **Description**: An administrative endpoint to clear and reset the database tables.
    *   **Action**: Truncates or drops and recreates the `StudentRecord`, `BatchRecord`, and `History` tables.

### Database Schema (`models.py`)

The PostgreSQL database uses three primary tables defined via SQLAlchemy ORM classes:

*   **`StudentRecord`**: Stores the features and actual outcomes of students, likely ingested from `Student_Performance_Cleaned.csv`.
*   **`BatchRecord`**: Logs metadata about each batch upload job.
*   **`History`**: An append-only log of every single prediction made, serving as a complete audit trail.

---

## Machine Learning Model

The predictive engine is powered by a classical machine learning model chosen for its interpretability and solid performance on this regression task.

### Model Type & Training

*   **Algorithm**: **Multiple Linear Regression (Ordinary Least Squares)**, implemented with `sklearn.linear_model.LinearRegression`.
*   **Training Data**: The model is trained on 10,000 synthetic records from `refined_training_data.csv`, generated by `refined_data.py`.
*   **Training Process (`ml/train_model.py`)**:
    1.  The data is loaded and split into an 80% training set and a 20% testing set.
    2.  The OLS model is fitted on the training data.
    3.  Performance is evaluated on the test set, yielding an **R² of approximately 83%** and an **RMSE of ~4.56 marks**.
    4.  Robustness is confirmed using **5-fold cross-validation**.
    5.  The trained model object is serialized to `student_model.pkl` and its performance metrics are saved to `model_metadata.json`.

### Features

The model uses exactly four features as defined in the project proposal:

1.  `attendance_rate` (float): The student's class attendance percentage.
2.  `cat_score` (float): The student's score in Continuous Assessment Tests.
3.  `prev_mean_grade` (float): The student's mean grade from the previous academic period.
4.  `helb_status` (int): A binary flag indicating if the student receives HELB funding (1 for funded, 0 for not funded).

### Explainable AI (XAI) & Risk Classification

A key feature of the engine is its ability to provide not just a prediction, but an explanation.

*   **Risk Bands**: The predicted final score is mapped to one of three categories:
    *   🔴 **High Risk**: Score < 40%
    *   🟡 **Moderate Risk**: Score between 40% and 59%
    *   🟢 **Safe**: Score ≥ 60%
*   **Feature Contributions**: For each prediction, the system calculates the contribution of each feature to the final score by multiplying the feature's input value by its learned coefficient (weight) from the model (`contribution = feature_value * coefficient`). This allows an analyst to see exactly which factors (e.g., low attendance) are most responsible for a student's predicted risk level.