import React, { useState } from 'react';
import axios from 'axios';
import { Upload, CheckCircle, Info } from 'lucide-react';

const BatchUpload = () => {
  const [file,      setFile]      = useState(null);
  const [stats,     setStats]     = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragging,  setDragging]  = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:8000/predict/batch', formData);
      setStats(res.data);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Check that the backend is running and the CSV format is correct.';
      alert(`Batch error: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith('.csv')) setFile(dropped);
  };

  return (
    <div className="card">
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#2dd4bf', margin: '0 0 6px' }}>Batch Prediction View</h2>
        <p style={{ color: '#a1a1aa', margin: 0, fontSize: '0.9rem' }}>
          Upload a student CSV for bulk academic forecasting.
        </p>

        {/* CSV template hint */}
        <div style={{
          display: 'inline-flex', alignItems: 'flex-start', gap: '10px',
          background: 'rgba(45,212,191,0.07)', border: '1px solid rgba(45,212,191,0.25)',
          borderRadius: '8px', padding: '10px 16px', margin: '16px 0',
          textAlign: 'left', maxWidth: '560px'
        }}>
          <Info size={16} color="#2dd4bf" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.78rem', color: '#a1a1aa', lineHeight: '1.6' }}>
            <strong style={{ color: '#2dd4bf' }}>Required CSV columns:</strong><br />
            <code style={{ color: '#e2e8f0' }}>
              name, reg_no, attendance_rate, cat_score, prev_mean_grade, helb_status
            </code>
            <br />
            <span style={{ fontSize: '0.72rem' }}>
              <em>attendance_rate</em> 0–100 | <em>cat_score</em> 0–100 |{' '}
              <em>prev_mean_grade</em> 0–100 | <em>helb_status</em> 0 or 1
            </span>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          style={{
            border: `2px dashed ${dragging ? '#2dd4bf' : file ? '#34d399' : '#2b2d42'}`,
            borderRadius: '12px', padding: '35px 30px', margin: '0 auto 20px',
            maxWidth: '500px', cursor: 'pointer',
            background: dragging ? 'rgba(45,212,191,0.07)' : file ? 'rgba(52,211,153,0.05)' : '#0c0d21',
            transition: 'all 0.25s',
          }}
          onClick={() => document.getElementById('fileInput').click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <Upload size={40} color={file ? '#34d399' : '#2dd4bf'} style={{ marginBottom: '10px' }} />
          <p style={{ color: file ? '#ffffff' : '#a1a1aa', margin: 0 }}>
            {file ? file.name : 'Click or drag & drop a CSV file here'}
          </p>
          {file && (
            <p style={{ color: '#a1a1aa', fontSize: '0.75rem', margin: '6px 0 0' }}>
              {(file.size / 1024).toFixed(1)} KB
            </p>
          )}
          <input id="fileInput" type="file" hidden onChange={(e) => setFile(e.target.files[0])} accept=".csv" />
        </div>

        <button
          onClick={handleUpload} disabled={!file || uploading}
          style={{ ...btnStyle, opacity: (!file || uploading) ? 0.5 : 1 }}
        >
          {uploading ? 'Analyzing Dataset…' : 'Execute Batch Prediction'}
        </button>
      </div>

      {stats && (
        <div style={{ borderTop: '1px solid #2b2d42', paddingTop: '24px', textAlign: 'center', animation: 'fadeIn 0.4s ease-in' }}>
          <CheckCircle size={40} color="#34d399" style={{ marginBottom: '12px' }} />
          <h3 style={{ color: '#34d399', margin: '0 0 6px' }}>Batch Processed Successfully</h3>
          <p style={{ color: '#a1a1aa', margin: '0 0 16px', fontSize: '0.9rem' }}>
            <strong style={{ color: '#2dd4bf' }}>{stats.count}</strong> students analysed ·{' '}
            Mean grade <strong style={{ color: '#2dd4bf' }}>{stats.mean_score}%</strong>
          </p>

          {/* Traffic-light risk summary */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <span style={riskPill('#f87171')}>🔴 High Risk: {stats.high_risk_count ?? stats.at_risk_count}</span>
            <span style={riskPill('#fbbf24')}>🟡 Moderate: {stats.moderate_risk_count ?? '—'}</span>
            <span style={riskPill('#34d399')}>🟢 Safe: {stats.safe_count ?? '—'}</span>
          </div>

          <p style={{ color: '#a1a1aa', fontSize: '0.8rem', margin: 0 }}>
            Head to the <strong style={{ color: '#2dd4bf' }}>Dashboard</strong> tab to explore the full results table.
          </p>
        </div>
      )}
    </div>
  );
};

const riskPill = (color) => ({
  padding: '5px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700',
  background: `${color}22`, border: `1px solid ${color}`, color,
});

const btnStyle = {
  padding: '12px 40px', background: '#2dd4bf', border: 'none',
  color: '#090a1e', fontWeight: '700', borderRadius: '6px', cursor: 'pointer', marginTop: '10px'
};

export default BatchUpload;