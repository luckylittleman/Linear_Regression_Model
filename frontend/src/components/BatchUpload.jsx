import React, { useState } from 'react';
import axios from 'axios';
import { Upload, CheckCircle } from 'lucide-react';

const BatchUpload = () => {
  const [file, setFile]           = useState(null);
  const [stats, setStats]         = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging]   = useState(false);

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
      alert(`Batch error: ${detail}`);
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
        <p style={{ color: '#a1a1aa', margin: 0, fontSize: '0.9rem' }}>Upload a student CSV for bulk academic forecasting.</p>

        {/* Drop Zone */}
        <div
          style={{
            border: `2px dashed ${dragging ? '#2dd4bf' : file ? '#34d399' : '#2b2d42'}`,
            borderRadius: '12px',
            padding: '35px 30px',
            margin: '24px auto',
            maxWidth: '500px',
            cursor: 'pointer',
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
          onClick={handleUpload}
          disabled={!file || uploading}
          style={{ ...btnStyle, opacity: (!file || uploading) ? 0.5 : 1 }}
        >
          {uploading ? 'Analyzing Dataset…' : 'Execute Batch Prediction'}
        </button>
      </div>

      {stats && (
        <div style={{ borderTop: '1px solid #2b2d42', paddingTop: '24px', textAlign: 'center', animation: 'fadeIn 0.4s ease-in' }}>
          <CheckCircle size={40} color="#34d399" style={{ marginBottom: '12px' }} />
          <h3 style={{ color: '#34d399', margin: '0 0 6px' }}>Batch Processed Successfully</h3>
          <p style={{ color: '#a1a1aa', margin: '0 0 20px', fontSize: '0.9rem' }}>
            {stats.count} students analysed · Mean grade <strong style={{ color: '#2dd4bf' }}>{stats.mean_score}%</strong> · <strong style={{ color: '#f87171' }}>{stats.at_risk_count} at risk</strong>
          </p>
          <p style={{ color: '#a1a1aa', fontSize: '0.8rem', margin: 0 }}>
            Head to the <strong style={{ color: '#2dd4bf' }}>Dashboard</strong> tab to explore the full results table.
          </p>
        </div>
      )}
    </div>
  );
};

const btnStyle = {
  padding: '12px 40px', background: '#2dd4bf', border: 'none',
  color: '#090a1e', fontWeight: '700', borderRadius: '6px', cursor: 'pointer', marginTop: '10px'
};

export default BatchUpload;