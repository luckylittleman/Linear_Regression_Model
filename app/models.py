from sqlalchemy import Column, Integer, Float, String, Boolean
from .database import Base

class StudentRecord(Base):
    __tablename__ = "individual_predictions"
    id = Column(Integer, primary_key=True, index=True)
    student_name = Column(String)
    reg_no = Column(String)
    study_hours = Column(Float)
    prev_mean_grade = Column(Float)
    sleep_hours = Column(Float)
    revision_intensity = Column(Integer)
    predicted_score = Column(Float)
    
class BatchRecord(Base):
    __tablename__ = "current_batch"

    id = Column(Integer, primary_key=True, index=True)
    student_name = Column(String)
    reg_no = Column(String)
    predicted_score = Column(Float)    