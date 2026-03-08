import pandas as pd
from app.database import engine
from app.models import StudentRecord

def clean_and_ingest(file_path: str):
    # 1. Load Data
    df = pd.read_csv(file_path)
    print("Original Data Loaded.")

    # 2. MANIPULATION (Your suggestion)
    # Generate Student IDs for all rows at once
    df['student_id'] = [f"STU-{i+1:04d}" for i in range(len(df))]
    
    # Map Extracurriculars to Boolean (Kenya-fied)
    df['helb_status'] = df['Extracurricular Activities'].map({'Yes': True, 'No': False})
    
    # Rename columns to match your 'models.py'
    df = df.rename(columns={
        'Hours Studied': 'study_hours',
        'Previous Scores': 'prev_mean_grade',
        'Sleep Hours': 'sleep_hours',
        'Sample Question Papers Practiced': 'revision_intensity',
        'Performance Index': 'target_mean_score'
    })

   
    # 3. Filter only the columns that exist in our Database Model
    final_df = df[['student_id', 'study_hours', 'prev_mean_grade', 'att_rate', 
                   'helb_status', 'sleep_hours', 'revision_intensity', 'target_mean_score']]
    

    # 4. FAST INGESTION
    print("Ingesting cleaned data into PostgreSQL...")
    final_df.to_sql('academic_records', con=engine, if_exists='replace', index=False)
    print("Success! Milestone 2.1 Complete.")

if __name__ == "__main__":
    clean_and_ingest("Data/Student_Performance.csv")