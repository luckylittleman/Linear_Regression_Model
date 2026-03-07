from pydantic import BaseModel, Field, ConfigDict

class StudentBase(BaseModel):
    student_id: str
    study_hours: float = Field(ge=0, le=24)
    prev_mean_grade: float = Field(ge=0, le=100)
    helb_status: bool
    sleep_hours: float = Field(ge=0, le=24)
    revision_intensity: int = Field(ge=0)
    target_mean_score: float = Field(ge=0, le=100)

    model_config = ConfigDict(from_attributes=True)