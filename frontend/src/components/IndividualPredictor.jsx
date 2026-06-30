import React, { useState, useRef } from 'react';
import axios from 'axios';
import { User, BookOpen, Activity, CheckCircle, AlertTriangle, TrendingUp, Brain, RotateCcw, Download, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/** Map predicted score to a traffic-light risk profile */
const getRiskProfile = (score) => {
  if (score < 40) return { label: 'High Risk', color: '#f87171', bg: 'rgba(248,113,113,0.12)', icon: AlertTriangle };
  if (score < 60) return { label: 'Moderate Risk', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', icon: TrendingUp };
  return { label: 'Safe', color: '#34d399', bg: 'rgba(52,211,153,0.12)', icon: CheckCircle };
};

const FEATURE_LABELS = {
  attendance_rate: { name: 'Attendance Rate', icon: '📅' },
  cat_score: { name: 'CAT Score', icon: '📝' },
  prev_mean_grade: { name: 'Previous Grade', icon: '📊' },
  helb_status: { name: 'HELB Status', icon: '💰' },
};

const IndividualPredictor = () => {
  const initialFormState = {
    student_name: '', reg_no: '',
    attendance_rate: '', cat_score: '', prev_mean_grade: '', helb_status: 0,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    if (!formData.student_name || !formData.attendance_rate || !formData.cat_score || !formData.prev_mean_grade) {
      setError('Please fill in Name, Attendance Rate, CAT Score, and Previous Grade.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/predict/individual`, {
        student_name: formData.student_name,
        reg_no: formData.reg_no || '—',
        attendance_rate: parseFloat(formData.attendance_rate),
        cat_score: parseFloat(formData.cat_score),
        prev_mean_grade: parseFloat(formData.prev_mean_grade),
        helb_status: parseInt(formData.helb_status, 10),
      });
      setResult(res.data);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Prediction failed. Ensure the backend is running on port 8000.';
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => { setFormData(initialFormState); setResult(null); setError(null); };

  const resultRef = useRef(null);

  const handleDownloadPDF = async () => {
    if (!resultRef.current) return;
    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#0c0d21',
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Header
      pdf.setFillColor(9, 10, 30);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      pdf.setTextColor(45, 212, 191);
      pdf.setFontSize(18);
      pdf.text('Student Performance Forecast', pageWidth / 2, 20, { align: 'center' });
      pdf.setTextColor(161, 161, 170);
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: 'center' });

      // Result image
      const imgWidth = pageWidth - 30;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 15, 35, imgWidth, imgHeight);

      const studentName = formData.student_name || 'student';
      const safeName = studentName.replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`${safeName}_prediction.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    }
  };

  const risk = result ? getRiskProfile(result.predicted_score) : null;

  return (
    <div className="predictor-layout">

      {/* ── LEFT: INPUT FORM ─────────────────────────────────────────────── */}
      <div className="card" style={{ background: '#11122d' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ color: '#2dd4bf', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={24} /> Precision Predictor
          </h2>
          <button onClick={handleClear} style={secondaryBtnStyle}>
            <RotateCcw size={14} /> Clear
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid #f87171', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#f87171', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* Row 1 – Identity */}
        <div className="predictor-form-row">
          <div>
            <label style={labelStyle}><User size={14} /> Full Name</label>
            <input value={formData.student_name} style={inputStyle} placeholder="Ochieng Maina"
              onChange={(e) => setFormData({ ...formData, student_name: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}><User size={14} /> Registration No.</label>
            <input value={formData.reg_no} style={inputStyle} placeholder="K12/XXXX/22"
              onChange={(e) => setFormData({ ...formData, reg_no: e.target.value })} />
          </div>
        </div>

        {/* Row 2 – Attendance & CAT Score */}
        <div className="predictor-form-row">
          <div>
            <label style={labelStyle}>📅 Attendance Rate (%)</label>
            <input value={formData.attendance_rate} type="number" step="0.1" min="0" max="100"
              style={inputStyle} placeholder="e.g. 85"
              onChange={(e) => setFormData({ ...formData, attendance_rate: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>📝 CAT Score (0–100)</label>
            <input value={formData.cat_score} type="number" step="0.1" min="0" max="100"
              style={inputStyle} placeholder="e.g. 72"
              onChange={(e) => setFormData({ ...formData, cat_score: e.target.value })} />
          </div>
        </div>

        {/* Row 3 – Previous Mean Grade & HELB Status */}
        <div className="predictor-form-row" style={{ marginBottom: '30px' }}>
          <div>
            <label style={labelStyle}><BookOpen size={14} /> Prev. Mean Grade (%)</label>
            <input value={formData.prev_mean_grade} type="number" step="0.1" min="0" max="100"
              style={inputStyle} placeholder="e.g. 68"
              onChange={(e) => setFormData({ ...formData, prev_mean_grade: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>💰 HELB Funding Status</label>
            <select
              value={formData.helb_status}
              onChange={(e) => setFormData({ ...formData, helb_status: e.target.value })}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value={1}>1 — HELB-Funded ✅</option>
              <option value={0}>0 — Not Funded ❌</option>
            </select>
          </div>
        </div>

        <button onClick={handlePredict} disabled={loading}
          style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Computing Regression…' : 'Execute Prediction'}
        </button>
      </div>

      {/* ── RIGHT: RESULT CARD ───────────────────────────────────────────── */}
      <div className="card" id="printable-result" style={{
        border: result ? `2px solid ${risk?.color}` : '1px solid #2b2d42',
        background: result ? risk?.bg : '#0c0d21',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center',
        transition: 'border 0.3s, background 0.3s'
      }}>
        {!result ? (
          <div style={{ color: '#a1a1aa', padding: '40px 20px' }}>
            <Brain size={60} style={{ marginBottom: '20px', opacity: 0.2 }} />
            <h3 style={{ color: '#e2e8f0' }}>Engine Latent…</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Enter student metrics to trigger the Multiple Linear Regression model.
            </p>
          </div>
        ) : (
          <div ref={resultRef} style={{ padding: '20px', animation: 'fadeIn 0.4s ease-in' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleDownloadPDF} className="no-print"
                style={{ background: 'none', border: 'none', color: '#2dd4bf', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                <Download size={16} /> PDF
              </button>
            </div>

            {/* Score */}
            <h4 style={{ color: '#a1a1aa', margin: 0, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
              Forecast Result
            </h4>
            <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', color: risk.color, margin: '8px 0', fontWeight: '800' }}>
              {result.predicted_score}%
            </h1>
            <p style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '10px', fontWeight: '600' }}>
              {formData.student_name}
            </p>

            {/* Risk Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 16px', borderRadius: '20px', marginBottom: '16px',
              background: risk.bg, border: `1px solid ${risk.color}`, color: risk.color,
              fontSize: '0.85rem', fontWeight: '700'
            }}>
              <risk.icon size={14} />
              {result.risk_category}
            </div>

            {/* Primary Risk Factor Warning */}
            {result.primary_risk_factor && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px',
                background: result.primary_risk_factor.startsWith('Warning')
                  ? 'rgba(248,113,113,0.1)' : 'rgba(52,211,153,0.1)',
                border: `1px solid ${result.primary_risk_factor.startsWith('Warning') ? '#f87171' : '#34d399'}`,
                borderRadius: '8px', padding: '10px 12px', marginBottom: '16px',
                textAlign: 'left', fontSize: '0.8rem',
                color: result.primary_risk_factor.startsWith('Warning') ? '#f87171' : '#34d399',
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>{result.primary_risk_factor}</span>
              </div>
            )}

            {/* Feature Contributions */}
            {result.contributions && (() => {
              const entries = Object.entries(result.contributions);
              const totalAbs = entries.reduce((s, [, v]) => s + Math.abs(v), 0) || 1;
              return (
                <div style={{ textAlign: 'left', marginTop: '8px' }}>
                  <p style={{ fontSize: '0.72rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: '600' }}>
                    Feature Contributions
                  </p>
                  <div style={{ background: '#090a1e', padding: '14px', borderRadius: '10px', border: '1px solid #2b2d42' }}>
                    {entries.map(([key, val]) => {
                      const pct = Math.abs(val) / totalAbs * 100;
                      const positive = val >= 0;
                      const barColor = positive ? '#2dd4bf' : '#f87171';
                      const { name, icon } = FEATURE_LABELS[key] || { name: key, icon: '•' };
                      return (
                        <div key={key} style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#e2e8f0', marginBottom: '5px' }}>
                            <span>{icon} {name}</span>
                            <span style={{ color: barColor, fontWeight: '700' }}>
                              {positive ? '+' : ''}{val.toFixed(2)} pts
                            </span>
                          </div>
                          <div style={{ background: '#1c1e3a', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${pct.toFixed(1)}%`, height: '100%', background: barColor,
                              borderRadius: '4px', transition: 'width 0.6s ease', boxShadow: `0 0 6px ${barColor}88`
                            }} />
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ borderTop: '1px solid #2b2d42', paddingTop: '10px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#a1a1aa' }}>
                      <span>Base intercept</span>
                      <span style={{ color: '#818cf8' }}>{result.intercept > 0 ? '+' : ''}{result.intercept} pts</span>
                    </div>
                  </div>
                </div>
              );
            })()}
            <p style={{ fontSize: '0.7rem', color: '#a1a1aa', marginTop: '18px' }}>
              CS Predictive Engine · Record ID #{result.id}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const labelStyle = { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.8rem', color: '#a1a1aa' };
const inputStyle = { width: '100%', padding: '12px', background: '#090a1e', border: '1px solid #2b2d42', color: 'white', borderRadius: '8px', boxSizing: 'border-box', outline: 'none', fontSize: '0.9rem' };
const btnStyle = { width: '100%', padding: '16px', background: '#2dd4bf', border: 'none', color: '#090a1e', fontWeight: '700', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' };
const secondaryBtnStyle = { background: 'transparent', border: '1px solid #2b2d42', color: '#a1a1aa', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' };

export default IndividualPredictor;