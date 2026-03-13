import React, { useState } from 'react';
import axios from 'axios';
import { User, BookOpen, Clock, Brain, CheckCircle, Activity, Moon, Zap, RotateCcw, Printer } from 'lucide-react';

const IndividualPredictor = () => {
  const initialFormState = {
    student_name: '', reg_no: '', study_hours: '',
    prev_mean_grade: '', sleep_hours: '', revision_intensity: 5
  };

  const [formData, setFormData] = useState(initialFormState);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!formData.student_name || !formData.study_hours || !formData.prev_mean_grade || !formData.sleep_hours) {
      alert("Please fill in Name, Study Hours, Previous Grade, and Sleep Hours!");
      return;
    }
    setLoading(true);
    try {
      // Endpoint must match your FastAPI route
      const res = await axios.post('http://localhost:8000/predict/individual', formData);
      setResult(res.data);
    } catch (err) {
      alert("FastAPI Error: Ensure the backend is running on Littleman-01.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData(initialFormState);
    setResult(null);
  };

  // ADDED: Print functionality for student reports
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '30px' }}>
      
      {/* LEFT: INPUT FORM */}
      <div className="card" style={{ background: '#11122d' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ color: '#2dd4bf', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={24} /> Precision Predictor
          </h2>
          <button 
            onClick={handleClear}
            style={secondaryBtnStyle}
          >
            <RotateCcw size={14} /> Clear Form
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input value={formData.student_name} style={inputStyle} placeholder="Odipo Eliazar" onChange={(e) => setFormData({...formData, student_name: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}>Registration No.</label>
            <input value={formData.reg_no} style={inputStyle} placeholder="K12/XXXX/22" onChange={(e) => setFormData({...formData, reg_no: e.target.value})} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}><Clock size={14} /> Study Hours / Week</label>
            <input value={formData.study_hours} type="number" step="0.1" style={inputStyle} placeholder="e.g. 45.5" onChange={(e) => setFormData({...formData, study_hours: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}><BookOpen size={14} /> Prev. Mean Grade (%)</label>
            <input value={formData.prev_mean_grade} type="number" step="0.1" max="168" style={inputStyle} placeholder="e.g. 78.2" onChange={(e) => setFormData({...formData, prev_mean_grade: e.target.value})} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={labelStyle}><Moon size={14} /> Sleep Hours / Night</label>
            <input value={formData.sleep_hours} type="number" step="0.1" style={inputStyle} placeholder="e.g. 7.5" onChange={(e) => setFormData({...formData, sleep_hours: e.target.value})} />
          </div>
          <div>
            <label style={labelStyle}><Zap size={14} /> Revision Intensity: <span style={{color: '#2dd4bf'}}>{formData.revision_intensity}/10</span></label>
            <input type="range" min="1" max="10" value={formData.revision_intensity} style={rangeStyle} onChange={(e) => setFormData({...formData, revision_intensity: e.target.value})} />
          </div>
        </div>

        <button onClick={handlePredict} disabled={loading} style={btnStyle}>
          {loading ? "Computing Regression..." : "Execute Prediction"}
        </button>
      </div>

      {/* RIGHT: RESULT WINDOW */}
      <div className="card" id="printable-result" style={{ 
        border: result ? '2px solid #2dd4bf' : '1px solid #2b2d42',
        background: result ? 'rgba(45, 212, 191, 0.05)' : '#0c0d21',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center'
      }}>
        {!result ? (
          <div style={{ color: '#a1a1aa', padding: '40px' }}>
            <Brain size={60} style={{ marginBottom: '20px', opacity: 0.2 }} />
            <h3>Engine Latent...</h3>
            <p style={{ fontSize: '0.9rem' }}>Enter metrics to trigger the Multiple Linear Regression model.</p>
          </div>
        ) : (
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                 <button onClick={handlePrint} className="no-print" style={{ background: 'none', border: 'none', color: '#2dd4bf', cursor: 'pointer' }}>
                    <Printer size={18} />
                 </button>
            </div>
            <CheckCircle color="#2dd4bf" size={40} style={{ marginBottom: '15px' }} />
            <h4 style={{ color: '#a1a1aa', margin: 0, textTransform: 'uppercase', fontSize: '0.8rem' }}>Forecast Result</h4>
            
            {/* FIXED: Using result.predicted_score from backend */}
            <h1 style={{ fontSize: '4.5rem', color: '#2dd4bf', margin: '5px 0', fontWeight: '800' }}>
                {result.predicted_score}%
            </h1>
            
            <p style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '25px', fontWeight: 'bold' }}>
                {formData.student_name}
            </p>
            
            <div style={{ textAlign: 'left', background: '#090a1e', padding: '15px', borderRadius: '10px', border: '1px solid #2b2d42' }}>
              <div style={statRow}><span>Study Hours:</span> <span>{formData.study_hours}h</span></div>
              <div style={statRow}><span>Sleep Hours:</span> <span>{formData.sleep_hours}h</span></div>
              <div style={statRow}><span>Prev. Grade:</span> <span>{formData.prev_mean_grade}%</span></div>
              <div style={{...statRow, border: 'none'}}>
                <span>Confidence:</span> 
                <span style={{color: '#fbbf24'}}>0.9887 R²</span>
              </div>
            </div>
            
            <p style={{ fontSize: '0.7rem', color: '#a1a1aa', marginTop: '20px' }}>
                Generated on Littleman-01 System
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const labelStyle = { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.8rem', color: '#a1a1aa' };
const inputStyle = { width: '100%', padding: '12px', background: '#090a1e', border: '1px solid #2b2d42', color: 'white', borderRadius: '8px', boxSizing: 'border-box', outline: 'none' };
const rangeStyle = { width: '100%', accentColor: '#2dd4bf', cursor: 'pointer' };
const btnStyle = { width: '100%', padding: '16px', background: '#2dd4bf', border: 'none', color: '#090a1e', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', marginTop: '30px' };
const secondaryBtnStyle = { background: 'transparent', border: '1px solid #2b2d42', color: '#a1a1aa', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' };
const statRow = { display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '8px 0', borderBottom: '1px solid #1c1e3a' };

export default IndividualPredictor;