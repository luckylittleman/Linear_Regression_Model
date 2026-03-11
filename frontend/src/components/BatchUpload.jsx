import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Search, FileDown, CheckCircle } from 'lucide-react';

const BatchUpload = () => {
  const [file, setFile] = useState(null);
  const [stats, setStats] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Ensure this URL matches your FastAPI address on Littleman
      const res = await axios.post('http://localhost:8000/predict/batch', formData);
      
      // We ensure stats matches the backend response: { count, results, mean_score, at_risk_count }
      setStats(res.data);
      setSearchTerm(''); // Reset search on new upload
    } catch (err) {
      console.error(err);
      alert("Error processing batch. Please check if FastAPI is running and CSV format is correct.");
    } finally {
      setUploading(false);
    }
  };

  // The backend sends "results", but your code used "detailed_results". Fixed here:
  const dataToFilter = stats?.results || [];
  
  const filteredResults = dataToFilter.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.reg_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card">
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#2dd4bf' }}>Batch Prediction View</h2>
        <p style={{ color: '#a1a1aa' }}>Upload student data CSV for bulk academic forecasting on Littleman-01.</p>
        
        <div 
          style={{ 
            border: '2px dashed #2b2d42', 
            borderRadius: '12px', 
            padding: '30px', 
            margin: '20px auto', 
            maxWidth: '500px', 
            cursor: 'pointer', 
            background: file ? 'rgba(45, 212, 191, 0.05)' : '#0c0d21',
            transition: '0.3s'
          }}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <Upload size={40} color={file ? "#34d399" : "#2dd4bf"} style={{ marginBottom: '10px' }} />
          <p style={{ color: file ? '#ffffff' : '#a1a1aa' }}>
            {file ? file.name : "Click to select CSV file"}
          </p>
          <input id="fileInput" type="file" hidden onChange={(e) => setFile(e.target.files[0])} accept=".csv" />
        </div>

        <button 
          onClick={handleUpload} 
          disabled={!file || uploading} 
          style={{...btnStyle, opacity: (!file || uploading) ? 0.5 : 1}}
        >
          {uploading ? "Analyzing Dataset..." : "Execute Batch Prediction"}
        </button>
      </div>

      {stats && (
        <div style={{ borderTop: '1px solid #2b2d42', paddingTop: '30px' }}>
          {/* Summary Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
            <div className="card" style={{ background: '#0c0d21', border: '1px solid #151630' }}>
              <p style={{ color: '#a1a1aa', fontSize: '0.75rem', textTransform: 'uppercase' }}>Processed</p>
              <h3 style={{ margin: '5px 0' }}>{stats.count} Students</h3>
            </div>
            <div className="card" style={{ background: '#0c0d21', border: '1px solid #151630' }}>
              <p style={{ color: '#a1a1aa', fontSize: '0.75rem', textTransform: 'uppercase' }}>Batch Mean</p>
              <h3 style={{ margin: '5px 0', color: '#2dd4bf' }}>{stats.mean_score || 'N/A'}%</h3>
            </div>
            <div className="card" style={{ background: '#0c0d21', border: '1px solid #151630' }}>
              <p style={{ color: '#a1a1aa', fontSize: '0.75rem', textTransform: 'uppercase' }}>At-Risk</p>
              <h3 style={{ margin: '5px 0', color: '#f87171' }}>{stats.at_risk_count || 0}</h3>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#a1a1aa' }} />
            <input 
              type="text" 
              placeholder="Search processed results..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={searchStyle}
            />
          </div>

          {/* Results Table Container with Scrolling */}
          <div style={{ 
            maxHeight: '450px', 
            overflowY: 'auto', 
            borderRadius: '8px',
            border: '1px solid #2b2d42',
            background: '#090a1e'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#151630', zIndex: 1 }}>
                <tr>
                  <th style={thStyle}>Full Name</th>
                  <th style={thStyle}>Reg No.</th>
                  <th style={thStyle}>Forecast</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length > 0 ? (
                  filteredResults.map((s, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #151630' }}>
                      <td style={tdStyle}>{s.name}</td>
                      <td style={tdStyle}>{s.reg_no}</td>
                      <td style={{ ...tdStyle, color: '#2dd4bf', fontWeight: 'bold' }}>{s.predicted_score}%</td>
                      <td style={tdStyle}>
                        <span style={{ 
                          padding: '4px 12px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold',
                          background: s.predicted_score < 50 ? 'rgba(248, 113, 113, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                          color: s.predicted_score < 50 ? '#f87171' : '#34d399',
                          textTransform: 'uppercase'
                        }}>
                          {s.predicted_score < 50 ? 'At Risk' : 'On Track'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#a1a1aa' }}>
                      No results match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const btnStyle = { 
  padding: '12px 40px', 
  background: '#2dd4bf', 
  border: 'none', 
  color: '#090a1e', 
  fontWeight: 'bold', 
  borderRadius: '6px', 
  cursor: 'pointer',
  marginTop: '10px'
};

const searchStyle = { 
  width: '100%', 
  padding: '12px 12px 12px 40px', 
  background: '#0c0d21', 
  border: '1px solid #2b2d42', 
  color: 'white', 
  borderRadius: '8px',
  outline: 'none'
};

const thStyle = { padding: '15px', textAlign: 'left', fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase' };
const tdStyle = { padding: '12px 15px', fontSize: '0.85rem', color: '#e2e8f0' };

export default BatchUpload;