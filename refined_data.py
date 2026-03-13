import pandas as pd
import numpy as np

def generate_smart_data(n=10000):
    np.random.seed(42)
    # Features
    prev_grade = np.random.uniform(30, 95, n)
    study_hours = np.random.uniform(5, 60, n)
    sleep_hours = np.random.uniform(3, 10, n)
    rev_intensity = np.random.randint(1, 11, n)
    
    # Logic: Score = Baseline(Prev Grade) + Study Bonus - Sleep Penalty + Noise
    # Note: Study bonus is log-scaled to prevent 100% logic
    score = (prev_grade * 0.6) + (np.log1p(study_hours) * 8) + (rev_intensity * 0.5)
    
    # Apply penalty for sleep deprivation
    score = np.where(sleep_hours < 5, score - 10, score)
    score = np.where(sleep_hours > 8, score + 2, score)
    
    # Add random noise to simulate real-world unpredictability
    noise = np.random.normal(0, 5, n)
    score = score + noise
    
    # Clip between 0 and 100
    score = np.clip(score, 0, 100)
    
    return pd.DataFrame({
        'prev_mean_grade': prev_grade,
        'study_hours': study_hours,
        'sleep_hours': sleep_hours,
        'revision_intensity': rev_intensity,
        'score': score
    })

df = generate_smart_data()
df.to_csv('refined_training_data.csv', index=False)
print("Smart dataset created.")