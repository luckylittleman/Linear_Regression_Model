from sqlalchemy import Column, Integer, Float, String, DateTime
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func
from .database import Base


class StudentRecord(Base):
    __tablename__ = "individual_predictions"

    id = Column(Integer, primary_key=True, index=True)
    student_name = Column(String, nullable=False)
    reg_no = Column(String, nullable=False)
    study_hours = Column(Float)
    prev_mean_grade = Column(Float)
    sleep_hours = Column(Float)
    revision_intensity = Column(Integer)
    predicted_score = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class BatchRecord(Base):
    __tablename__ = "current_batch"

    id = Column(Integer, primary_key=True, index=True)
    student_name = Column(String, nullable=False)
    reg_no = Column(String, nullable=False)
    predicted_score = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    student_name = Column(String, nullable=False)
    reg_no = Column(String, nullable=False)
    study_hours = Column(Float)
    prev_mean_grade = Column(Float)
    sleep_hours = Column(Float)
    revision_intensity = Column(Integer)
    predicted_score = Column(Float)
    prediction_type = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())