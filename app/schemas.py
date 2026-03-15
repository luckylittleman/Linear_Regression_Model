from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class StudentBase(BaseModel):
    # Identity Fields
    student_name: str
    reg_no: str

    # Prediction Features (the 4 inputs the model was trained on)
    study_hours: float = Field(ge=0, le=168)
    prev_mean_grade: float = Field(ge=0, le=100)
    sleep_hours: float = Field(ge=0, le=24)
    revision_intensity: int = Field(ge=1, le=10)  # 1–10 scale

    model_config = ConfigDict(from_attributes=True)


# Used for POST /predict/individual
class StudentCreate(StudentBase):
    pass


# Response includes db-assigned ID
class StudentResponse(StudentBase):
    id: int


class PredictionHistoryResponse(BaseModel):
    id: int
    student_name: str
    reg_no: str
    study_hours: Optional[float] = None
    prev_mean_grade: Optional[float] = None
    sleep_hours: Optional[float] = None
    revision_intensity: Optional[int] = None
    predicted_score: float
    prediction_type: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)