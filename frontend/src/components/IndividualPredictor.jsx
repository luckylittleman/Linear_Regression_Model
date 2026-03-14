import React, { useState } from 'react';
import axios from 'axios';
import { User, BookOpen, Clock, Brain, CheckCircle, AlertTriangle, TrendingUp, Activity, Moon, Zap, RotateCcw, Printer } from 'lucide-react';

const getRiskProfile = (score) => {
  if (score < 50) return { label: 'At Risk',          color: '#f87171', bg: 'rgba(248,113,113,0.12)',  icon: AlertTriangle };
  if (score < 70) return { label: 'Needs Attention',  color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',   icon: TrendingUp   };
  return            { label: 'On Track',              color: '#34d399', bg: 'rgba(52,211,153,0.12)',   icon: CheckCircle  };
};

const IndividualPredictor = () => {
  const initialFormState = {
    student_name: '', reg_no: '', study_hours: '',
    prev_mean_grade: '', sleep_hours: '', revision_intensity: 5
  };

  const [formData, setFormData]   = useState(initialFormState);
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const handlePredict = async () => {
    if (!formData.student_name || !formData.study_hours || !formData.prev_mean_grade || !formData.sleep_hours) {
      setError('Please fill in Name, Study Hours, Previous Grade, and Sleep Hours.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/predict/individual', {
        ...formData,
        study_hours:        parseFloat(formData.study_hours),
        prev_mean_grade:    parseFloat(formData.prev_mean_grade),
        sleep_hours:        parseFloat(formData.sleep_hours),
        revision_intensity: parseInt(formData.revision_intensity, 10),
      });
      setResult(res.data);
    } catch (err) {
      setError('Prediction failed. Ensure the backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData(initialFormState);
    setResult(null);
    setError(null);
  };

  const risk = result ? getRiskProfile(result.predicted_score) : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '30px' }}>

      {/* LEFT: INPUT FORM */}
      <div className="card" style={{ background: '#11122d' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}><User size={14} /> Full Name</label>
            <input value={formData.student_name} style={inputStyle} placeholder="Odipo Eliazar"
              onChange={(e) => setFormData({ ...formData, student_name: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}><User size={14} /> Registration No.</label>
            <input value={formData.reg_no} style={inputStyle} placeholder="K12/XXXX/22"
              onChange={(e) => setFormData({ ...formData, reg_no: e.target.value })} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}><Clock size={14} /> Study Hours / Week</label>
            <input value={formData.study_hours} type="number" step="0.1" min="0" max="168" style={inputStyle} placeholder="e.g. 45.5"
              onChange={(e) => setFormData({ ...formData, study_hours: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}><BookOpen size={14} /> Prev. Mean Grade (%)</label>
            <input value={formData.prev_mean_grade} type="number" step="0.1" min="0" max="100" style={inputStyle} placeholder="e.g. 78.2"
              onChange={(e) => setFormData({ ...formData, prev_mean_grade: e.target.value })} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div>
            <label style={labelStyle}><Moon size={14} /> Sleep Hours / Night</label>
            <input value={formData.sleep_hours} type="number" step="0.1" min="0" max="24" style={inputStyle} placeholder="e.g. 7.5"
              onChange={(e) => setFormData({ ...formData, sleep_hours: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}><Zap size={14} /> Revision Intensity: <span style={{ color: '#2dd4bf' }}>{formData.revision_intensity}/10</span></label>
            <input type="range" min="1" max="10" value={formData.revision_intensity} style={rangeStyle}
              onChange={(e) => setFormData({ ...formData, revision_intensity: e.target.value })} />
          </div>
        </div>

        <button onClick={handlePredict} disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Computing Regression…' : 'Execute Prediction'}
        </button>
      </div>

      {/* RIGHT: RESULT CARD */}
      <div className="card" id="printable-result" style={{
        border: result ? `2px solid ${risk?.color}` : '1px solid #2b2d42',
        background: result ? risk?.bg : '#0c0d21',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center',
        transition: 'border 0.3s, background 0.3s'
      }}>
        {!result ? (
          <div style={{ color: '#a1a1aa', padding: '40px' }}>
            <Brain size={60} style={{ marginBottom: '20px', opacity: 0.2 }} />
            <h3 style={{ color: '#e2e8f0' }}>Engine Latent…</h3>
            <p style={{ fontSize: '0.9rem' }}>Enter student metrics to trigger the Multiple Linear Regression model.</p>
          </div>
        ) : (
          <div style={{ padding: '20px', animation: 'fadeIn 0.4s ease-in' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => window.print()} className="no-print"
                style={{ background: 'none', border: 'none', color: '#2dd4bf', cursor: 'pointer', padding: '4px' }}>
                <Printer size={18} />
              </button>
            </div>

            {/* Score */}
            <h4 style={{ color: '#a1a1aa', margin: 0, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Forecast Result</h4>
            <h1 style={{ fontSize: '4.5rem', color: risk.color, margin: '8px 0', fontWeight: '800' }}>
              {result.predicted_score}%
            </h1>
            <p style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '10px', fontWeight: '600' }}>
              {formData.student_name}
            </p>

            {/* Risk Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 16px', borderRadius: '20px', marginBottom: '24px',
              background: risk.bg, border: `1px solid ${risk.color}`, color: risk.color,
              fontSize: '0.85rem', fontWeight: '700'
            }}>
              <risk.icon size={14} />
              {risk.label}
            </div>

            {/* Feature Contributions */}
            {result.contributions && (() => {
              const labels = {
                study_hours:       { name: 'Study Hours',        icon: '🕐' },
                prev_mean_grade:   { name: 'Previous Grade',     icon: '📊' },
                sleep_hours:       { name: 'Sleep Quality',      icon: '🌙' },
                revision_intensity:{ name: 'Revision Intensity', icon: '⚡' },
              };
              const entries = Object.entries(result.contributions);
              const totalAbs = entries.reduce((s, [, v]) => s + Math.abs(v), 0) || 1;
              return (
                <div style={{ textAlign: 'left', marginTop: '20px' }}>
                  <p style={{ fontSize: '0.72rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: '600' }}>
                    Feature Contributions
                  </p>
                  <div style={{ background: '#090a1e', padding: '14px', borderRadius: '10px', border: '1px solid #2b2d42' }}>
                    {entries.map(([key, val]) => {
                      const pct = Math.abs(val) / totalAbs * 100;
                      const positive = val >= 0;
                      const barColor = positive ? '#2dd4bf' : '#f87171';
                      const { name, icon } = labels[key] || { name: key, icon: '•' };
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
                              width: `${pct.toFixed(1)}%`,
                              height: '100%',
                              background: barColor,
                              borderRadius: '4px',
                              transition: 'width 0.6s ease',
                              boxShadow: `0 0 6px ${barColor}88`,
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

const labelStyle    = { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.8rem', color: '#a1a1aa' };
const inputStyle    = { width: '100%', padding: '12px', background: '#090a1e', border: '1px solid #2b2d42', color: 'white', borderRadius: '8px', boxSizing: 'border-box', outline: 'none', fontSize: '0.9rem' };
const rangeStyle    = { width: '100%', accentColor: '#2dd4bf', cursor: 'pointer', marginTop: '8px' };
const btnStyle      = { width: '100%', padding: '16px', background: '#2dd4bf', border: 'none', color: '#090a1e', fontWeight: '700', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' };
const secondaryBtnStyle = { background: 'transparent', border: '1px solid #2b2d42', color: '#a1a1aa', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' };
const statRow       = { display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '8px 0', borderBottom: '1px solid #1c1e3a', color: '#e2e8f0' };

export default IndividualPredictor;