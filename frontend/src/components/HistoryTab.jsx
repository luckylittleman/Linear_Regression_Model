import React, { useState, useEffect } from 'react';
import { Clock, History, CloudDownload, RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const getRiskColor = (score) => {
  if (score < 40) return '#f87171';
  if (score < 60) return '#fbbf24';
  return '#34d399';
};

const PAGE_SIZE = 50;

const HistoryTab = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [total,   setTotal]   = useState(0);
  const [skip,    setSkip]    = useState(0);

  const fetchHistory = async (offset = 0) => {
    setLoading(true); setError(null);
    try {
      const response = await fetch(`http://localhost:8000/history?skip=${offset}&limit=${PAGE_SIZE}`);
      if (!response.ok) throw new Error('Failed to fetch prediction history');
      const data = await response.json();
      setHistory(data.records || []);
      setTotal(data.total || 0);
      setSkip(offset);
    } catch (err) {
      setError('Unable to load history data. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(0); }, []);

  const formatDate = (ds) =>
    new Date(ds).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

  const downloadCSV = () => {
    if (!history.length) return;
    const headers = [
      'Date', 'Student Name', 'Reg No', 'Type',
      'Attendance Rate', 'CAT Score', 'Prev. Grade', 'HELB Status',
      'Predicted Score', 'Risk Category', 'Primary Risk Factor'
    ];
    const csvContent = [
      headers.join(','),
      ...history.map(r => [
        `"${formatDate(r.created_at)}"`,
        `"${r.student_name}"`,
        `"${r.reg_no}"`,
        `"${r.prediction_type}"`,
        r.attendance_rate  ?? 'N/A',
        r.cat_score        ?? 'N/A',
        r.prev_mean_grade  ?? 'N/A',
        r.helb_status      ?? 'N/A',
        r.predicted_score,
        `"${r.risk_category ?? ''}"`,
        `"${r.primary_risk_factor ?? ''}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link  = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `prediction_history_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const currentPage = Math.floor(skip / PAGE_SIZE) + 1;
  const totalPages  = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canPrev     = skip > 0;
  const canNext     = skip + PAGE_SIZE < total;

  return (
    <div className="card" style={{ padding: '30px', animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={24} color="#2dd4bf" /> Prediction History Log
          </h2>
          <p style={{ color: '#a1a1aa', margin: '5px 0 0', fontSize: '0.95rem' }}>
            A comprehensive record of all individual and batch predictions.
            {total > 0 && <span style={{ color: '#2dd4bf', fontWeight: 600 }}> ({total.toLocaleString()} total)</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => fetchHistory(skip)} className="btn-secondary" disabled={loading}>
            <RefreshCw size={18} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button onClick={downloadCSV} className="btn-primary" disabled={!history.length}>
            <CloudDownload size={18} /> Export CSV
          </button>
        </div>
      </div>

      {error ? (
        <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', padding: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px', color: '#f87171' }}>
          <AlertCircle size={24} /><p style={{ margin: 0 }}>{error}</p>
        </div>
      ) : loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#a1a1aa' }}>
          <RefreshCw size={40} className="spin" style={{ margin: '0 auto 20px', opacity: 0.5, display: 'block' }} />
          <p>Loading history records…</p>
        </div>
      ) : !history.length ? (
        <div style={{ padding: '80px 20px', textAlign: 'center', background: 'rgba(30,32,53,0.4)', borderRadius: '12px', border: '1px dashed #2b2d42' }}>
          <Clock size={48} style={{ opacity: 0.3, marginBottom: '20px' }} />
          <h3 style={{ margin: '0 0 10px', color: '#e2e8f0' }}>No History Available</h3>
          <p style={{ color: '#a1a1aa', margin: 0 }}>Make an individual prediction or upload a batch to start generating logs.</p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table" style={{ width: '100%', minWidth: '1000px' }}>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Student Details</th>
                  <th>Type</th>
                  <th>Attendance</th>
                  <th>CAT Score</th>
                  <th>Prev. Grade</th>
                  <th>HELB</th>
                  <th>Predicted Score</th>
                  <th>Risk Category</th>
                  <th>Primary Risk Factor</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => {
                  const riskColor = getRiskColor(r.predicted_score);
                  return (
                    <tr key={r.id}>
                      <td style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>{formatDate(r.created_at)}</td>
                      <td>
                        <div style={{ fontWeight: '500', color: '#e2e8f0' }}>{r.student_name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{r.reg_no}</div>
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '600',
                          background: r.prediction_type === 'Individual' ? 'rgba(56,189,248,0.15)' : 'rgba(167,139,250,0.15)',
                          color: r.prediction_type === 'Individual' ? '#38bdf8' : '#a78bfa',
                          border: `1px solid ${r.prediction_type === 'Individual' ? 'rgba(56,189,248,0.3)' : 'rgba(167,139,250,0.3)'}`
                        }}>
                          {r.prediction_type}
                        </span>
                      </td>
                      <td style={{ color: '#94a3b8' }}>{r.attendance_rate != null ? `${r.attendance_rate}%` : '—'}</td>
                      <td style={{ color: '#94a3b8' }}>{r.cat_score        != null ? r.cat_score        : '—'}</td>
                      <td style={{ color: '#94a3b8' }}>{r.prev_mean_grade  != null ? `${r.prev_mean_grade}%` : '—'}</td>
                      <td style={{ color: '#94a3b8' }}>
                        {r.helb_status != null
                          ? (r.helb_status === 1 ? '✅ Yes' : '❌ No')
                          : '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '700', color: riskColor }}>{r.predicted_score}%</span>
                          {r.predicted_score < 40 && (
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f87171', boxShadow: '0 0 8px #f87171' }} />
                          )}
                        </div>
                      </td>
                      <td>
                        {r.risk_category ? (
                          <span style={{
                            padding: '3px 10px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700',
                            color: riskColor, background: `${riskColor}22`, border: `1px solid ${riskColor}44`,
                            textTransform: 'uppercase'
                          }}>
                            {r.risk_category}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.8rem', maxWidth: '200px' }}>
                        {r.primary_risk_factor || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #2b2d42'
            }}>
              <span style={{ color: '#a1a1aa', fontSize: '0.82rem' }}>
                Showing {skip + 1}–{Math.min(skip + PAGE_SIZE, total)} of {total.toLocaleString()}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => fetchHistory(Math.max(0, skip - PAGE_SIZE))}
                  disabled={!canPrev}
                  className="btn-secondary"
                  style={{ padding: '6px 14px' }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span style={{
                  display: 'flex', alignItems: 'center', padding: '0 12px',
                  color: '#e2e8f0', fontSize: '0.85rem', fontWeight: '600'
                }}>
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => fetchHistory(skip + PAGE_SIZE)}
                  disabled={!canNext}
                  className="btn-secondary"
                  style={{ padding: '6px 14px' }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HistoryTab;
