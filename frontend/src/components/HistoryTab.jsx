import React, { useState, useEffect } from 'react';
import { Clock, History, CloudDownload, RefreshCw, AlertCircle } from 'lucide-react';

const HistoryTab = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/history');
      if (!response.ok) {
        throw new Error('Failed to fetch prediction history');
      }
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Unable to load history data. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const downloadCSV = () => {
    if (history.length === 0) return;

    const headers = [
      'Date',
      'Student Name',
      'Reg No',
      'Prediction Type',
      'Study Hours',
      'Prev. Mean Grade',
      'Sleep Hours',
      'Revision Intensity',
      'Predicted Score'
    ];

    const csvContent = [
      headers.join(','),
      ...history.map(row => [
        `"${formatDate(row.created_at)}"`,
        `"${row.student_name}"`,
        `"${row.reg_no}"`,
        `"${row.prediction_type}"`,
        row.study_hours !== null ? row.study_hours : 'N/A',
        row.prev_mean_grade !== null ? row.prev_mean_grade : 'N/A',
        row.sleep_hours !== null ? row.sleep_hours : 'N/A',
        row.revision_intensity !== null ? row.revision_intensity : 'N/A',
        row.predicted_score
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `prediction_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card" style={{ padding: '30px', animation: 'fade-in 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={24} color="#2dd4bf" />
            Prediction History Log
          </h2>
          <p style={{ color: '#a1a1aa', margin: '5px 0 0 0', fontSize: '0.95rem' }}>
            A comprehensive record of all individual and batch predictions made.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={fetchHistory}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? "spin" : ""} />
            Refresh
          </button>
          <button 
            onClick={downloadCSV}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            disabled={history.length === 0}
          >
            <CloudDownload size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {error ? (
        <div style={{ 
          background: 'rgba(248, 113, 113, 0.1)', 
          border: '1px solid rgba(248, 113, 113, 0.3)',
          padding: '20px', 
          borderRadius: '8px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px',
          color: '#f87171' 
        }}>
          <AlertCircle size={24} />
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      ) : loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#a1a1aa' }}>
          <RefreshCw size={40} className="spin" style={{ margin: '0 auto 20px', opacity: 0.5, display: 'block' }} />
          <p>Loading history records...</p>
        </div>
      ) : history.length === 0 ? (
        <div style={{ 
          padding: '80px 20px', 
          textAlign: 'center', 
          background: 'rgba(30, 32, 53, 0.4)', 
          borderRadius: '12px',
          border: '1px dashed #2b2d42'
        }}>
          <Clock size={48} style={{ opacity: 0.3, marginBottom: '20px' }} />
          <h3 style={{ margin: '0 0 10px 0', color: '#e2e8f0' }}>No History Available</h3>
          <p style={{ color: '#a1a1aa', margin: 0, maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
            No predictions have been recorded yet. Make an individual prediction or upload a batch CSV to start generating logs.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%', minWidth: '900px' }}>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Student Details</th>
                <th>Type</th>
                <th>Inputs (Hrs: Stu/Slp/Rev)</th>
                <th>Prev. Grade</th>
                <th>Predicted Score</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <tr key={record.id}>
                  <td style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
                    {formatDate(record.created_at)}
                  </td>
                  <td>
                    <div style={{ fontWeight: '500', color: '#e2e8f0' }}>{record.student_name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>{record.reg_no}</div>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem', 
                      fontWeight: '600',
                      background: record.prediction_type === 'Individual' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(167, 139, 250, 0.15)',
                      color: record.prediction_type === 'Individual' ? '#38bdf8' : '#a78bfa',
                      border: `1px solid ${record.prediction_type === 'Individual' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(167, 139, 250, 0.3)'}`
                    }}>
                      {record.prediction_type}
                    </span>
                  </td>
                  <td style={{ color: '#94a3b8' }}>
                    {record.study_hours !== null ? (
                      `${record.study_hours} / ${record.sleep_hours} / ${record.revision_intensity}`
                    ) : (
                      <span style={{ color: '#475569' }}>—</span>
                    )}
                  </td>
                  <td style={{ color: '#94a3b8' }}>
                    {record.prev_mean_grade !== null ? record.prev_mean_grade : <span style={{ color: '#475569' }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        fontWeight: '700', 
                        color: record.predicted_score >= 50 ? '#34d399' : '#f87171' 
                      }}>
                        {record.predicted_score}
                      </div>
                      {record.predicted_score < 50 && (
                        <div style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          background: '#f87171',
                          boxShadow: '0 0 8px #f87171'
                        }} title="At Risk" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Required additions for index.css if not present already */}
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default HistoryTab;
