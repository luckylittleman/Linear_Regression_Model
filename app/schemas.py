from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class StudentBase(BaseModel):
    # ── Identity ─────────────────────────────────────────────────────────────
    student_name: str
    reg_no: str

    # ── 4 Proposal Features ───────────────────────────────────────────────────
    attendance_rate:  float = Field(ge=0, le=100,  description="Attendance rate 0–100 %")
    cat_score:        float = Field(ge=0, le=100,  description="CAT score 0–100")
    prev_mean_grade:  float = Field(ge=0, le=100,  description="Previous mean grade 0–100")
    helb_status:      int   = Field(ge=0, le=1,    description="HELB funding: 1=funded, 0=not funded")

    model_config = ConfigDict(from_attributes=True)


class StudentCreate(StudentBase):
    """Request body for POST /predict/individual."""
    pass


class StudentResponse(StudentBase):
    """Response for individual prediction."""
    id: int


class PredictionHistoryResponse(BaseModel):
    id:                  int
    student_name:        str
    reg_no:              str
    attendance_rate:     Optional[float] = None
    cat_score:           Optional[float] = None
    prev_mean_grade:     Optional[float] = None
    helb_status:         Optional[int]   = None
    predicted_score:     float
    risk_category:       Optional[str]   = None
    primary_risk_factor: Optional[str]   = None
    prediction_type:     str
    created_at:          datetime

    model_config = ConfigDict(from_attributes=True)