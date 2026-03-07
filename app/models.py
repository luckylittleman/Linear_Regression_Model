from sqlalchemy import Column, Integer, Float, String, Boolean
from .database import Base

class StudentRecord(Base):
    __tablename__ = "academic_records"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, unique=True, index=True)
    study_hours = Column(Float)
    prev_mean_grade = Column(Float)
    att_rate = Column(Float)
    helb_status = Column(Boolean)
    sleep_hours = Column(Float)
    revision_intensity = Column(Integer)
    target_mean_score = Column(Float) # The Y value for our math