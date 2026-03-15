import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileDown, Activity, Users, Target, InboxIcon, Search, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const fetchBatchAnalytics = async () => {
      try {
        const res = await axios.get('http://localhost:8000/analytics/current-batch');
        setAnalytics(res.data);
      } catch (err) {
        console.error('Dashboard sync failed:', err);
        setAnalytics({ total: 0, mean: 0, atRisk: 0, chartData: [], detailed_results: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchBatchAnalytics();
  }, []);

  const downloadFullReport = () => {
    const dataToExport = analytics?.detailed_results || [];
    if (dataToExport.length === 0) {
      alert('No data available to export. Please process a batch first.');
      return;
    }
    const headers = 'Student Name,Registration No,Predicted Grade,Risk Status\n';
    const rows = dataToExport.map(s => {
      const status = s.predicted_score < 50 ? 'At Risk' : 'Stable';
      return `${s.student_name || s.name},${s.reg_no},${s.predicted_score}%,${status}`;
    }).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CS_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const clearDashboard = async () => {
    if (!window.confirm('Clear all batch data? This cannot be undone.')) return;
    setClearing(true);
    try {
      await axios.delete('http://localhost:8000/analytics/reset');
      setAnalytics({ total: 0, mean: 0, atRisk: 0, chartData: [], detailed_results: [] });
      setSearchTerm('');
    } catch (err) {
      console.error('Clear failed:', err);
    } finally {
      setClearing(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', gap: '14px', color: '#a1a1aa' }}>
        <div style={{ width: '24px', height: '24px', border: '3px solid #2b2d42', borderTopColor: '#2dd4bf', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        Loading analytics…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Empty state
  if (!analytics || analytics.total === 0) {
    return (
      <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #1e1e3f' }}>
          <div>
            <h2 style={{ color: '#2dd4bf', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Institutional Analytics</h2>
            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: '8px 0 0 0' }}>Overview of current batch performance</p>
          </div>
        </div>
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: '#a1a1aa' }}>
          <InboxIcon size={56} style={{ marginBottom: '18px', opacity: 0.3 }} />
          <h3 style={{ color: '#e2e8f0', margin: '0 0 10px' }}>No Batch Data Yet</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Upload a student CSV from the <strong style={{ color: '#2dd4bf' }}>Batch Upload</strong> tab to see analytics here.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-in' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #1e1e3f' }}>
        <div>
          <h2 style={{ color: '#2dd4bf', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Institutional Analytics</h2>
          <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: '8px 0 0 0' }}>Overview of current batch performance</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={clearDashboard} disabled={clearing} style={clearBtnStyle}>
            <Trash2 size={16} /> {clearing ? 'Clearing…' : 'Clear Dashboard'}
          </button>
          <button onClick={downloadFullReport} style={downloadBtnStyle}>
            <FileDown size={18} /> Export Full Report
          </button>
        </div>
      </div>

      {/* Metric Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={statCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p style={labelStyle}>BATCH SIZE</p>
            <Users size={16} color="#2dd4bf" />
          </div>
          <h2 style={{ color: '#2dd4bf', margin: '10px 0 0 0' }}>{analytics.total} Students</h2>
        </div>

        <div className="card" style={statCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p style={labelStyle}>PREDICTED MEAN</p>
            <Target size={16} color="#fbbf24" />
          </div>
          <h2 style={{ color: '#fbbf24', margin: '10px 0 0 0' }}>{analytics.mean}%</h2>
        </div>

        <div className="card" style={statCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p style={labelStyle}>AT-RISK IDENTIFIED</p>
            <Activity size={16} color="#f87171" />
          </div>
          <h2 style={{ color: '#f87171', margin: '10px 0 0 0' }}>{analytics.atRisk}</h2>
        </div>
      </div>

      {/* Chart */}
      <div className="card" style={{ height: '400px', background: '#0c0d21' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '1rem', color: '#e2e8f0' }}>Grade Distribution Frequency</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={analytics.chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3f" vertical={false} />
            <XAxis dataKey="range" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(45, 212, 191, 0.05)' }}
              contentStyle={{ background: '#151630', border: '1px solid #2b2d42', borderRadius: '8px' }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={60}>
              {analytics.chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Student Results Table */}
      {analytics.detailed_results?.length > 0 && (() => {
        const filtered = analytics.detailed_results.filter(s =>
          (s.student_name || s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.reg_no || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
        return (
          <div className="card" style={{ background: '#0c0d21', marginTop: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#e2e8f0' }}>Student Results</h3>
              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={15} style={{ position: 'absolute', left: '11px', top: '11px', color: '#a1a1aa' }} />
                <input
                  type="text"
                  placeholder="Search name or reg no…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 10px 10px 36px',
                    background: '#090a1e', border: '1px solid #2b2d42',
                    color: 'white', borderRadius: '8px', outline: 'none',
                    boxSizing: 'border-box', fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>
            <div style={{ maxHeight: '420px', overflowY: 'auto', borderRadius: '8px', border: '1px solid #2b2d42', background: '#090a1e' }}>
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
                  {filtered.length > 0 ? filtered.map((s, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #151630' }}>
                      <td style={tdStyle}>{s.student_name || s.name}</td>
                      <td style={tdStyle}>{s.reg_no}</td>
                      <td style={{ ...tdStyle, color: '#2dd4bf', fontWeight: 'bold' }}>{s.predicted_score}%</td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '4px 12px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700',
                          background: s.predicted_score < 50 ? 'rgba(248,113,113,0.15)' : 'rgba(52,211,153,0.15)',
                          color: s.predicted_score < 50 ? '#f87171' : '#34d399',
                          textTransform: 'uppercase'
                        }}>
                          {s.predicted_score < 50 ? 'At Risk' : 'On Track'}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#a1a1aa' }}>
                        No results match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

const statCardStyle = { background: '#0c0d21', border: '1px solid #1e1e3f', padding: '20px' };
const labelStyle = { color: '#a1a1aa', fontSize: '0.7rem', fontWeight: 'bold', margin: 0 };
const downloadBtnStyle = {
  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
  background: 'transparent', border: '1px solid #2dd4bf', color: '#2dd4bf',
  borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0
};
const clearBtnStyle = {
  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
  background: 'transparent', border: '1px solid #f87171', color: '#f87171',
  borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0
};
const thStyle = { padding: '13px 15px', textAlign: 'left', fontSize: '0.72rem', color: '#a1a1aa', textTransform: 'uppercase' };
const tdStyle = { padding: '11px 15px', fontSize: '0.85rem', color: '#e2e8f0' };

export default Dashboard;