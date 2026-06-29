from sqlalchemy import Column, Integer, Float, String, DateTime
from sqlalchemy.sql import func
from .database import Base


class StudentRecord(Base):
    """Individual prediction records."""
    __tablename__ = "individual_predictions"

    id                  = Column(Integer, primary_key=True, index=True)
    student_name        = Column(String, nullable=False)
    reg_no              = Column(String, nullable=False)

    # ── 4 proposal features ──────────────────────────────────────────────────
    attendance_rate     = Column(Float)    # 0–100 %
    cat_score           = Column(Float)    # 0–100
    prev_mean_grade     = Column(Float)    # 0–100
    helb_status         = Column(Integer)  # 0 or 1

    # ── Model output ─────────────────────────────────────────────────────────
    predicted_score     = Column(Float)
    risk_category       = Column(String)   # "High Risk" | "Moderate Risk" | "Safe"
    primary_risk_factor = Column(String)   # plain-English XAI warning

    created_at          = Column(DateTime(timezone=True), server_default=func.now())


class BatchRecord(Base):
    """Current batch upload — replaced on every new upload."""
    __tablename__ = "current_batch"

    id              = Column(Integer, primary_key=True, index=True)
    student_name    = Column(String, nullable=False)
    reg_no          = Column(String, nullable=False)

    # ── 4 proposal features (for auditability) ───────────────────────────────
    attendance_rate  = Column(Float)
    cat_score        = Column(Float)
    prev_mean_grade  = Column(Float)
    helb_status      = Column(Integer)

    predicted_score = Column(Float)
    risk_category   = Column(String)  # "High Risk" | "Moderate Risk" | "Safe"
    created_at      = Column(DateTime(timezone=True), server_default=func.now())


class PredictionHistory(Base):
    """Append-only log of every individual and batch prediction."""
    __tablename__ = "prediction_history"

    id                  = Column(Integer, primary_key=True, index=True)
    student_name        = Column(String, nullable=False)
    reg_no              = Column(String, nullable=False)

    # ── 4 proposal features ──────────────────────────────────────────────────
    attendance_rate     = Column(Float)
    cat_score           = Column(Float)
    prev_mean_grade     = Column(Float)
    helb_status         = Column(Integer)

    # ── Model output ─────────────────────────────────────────────────────────
    predicted_score     = Column(Float)
    risk_category       = Column(String)
    primary_risk_factor = Column(String)
    prediction_type     = Column(String, nullable=False)  # "Individual" | "Batch"

    created_at          = Column(DateTime(timezone=True), server_default=func.now())