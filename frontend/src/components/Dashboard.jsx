import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileDown, Activity, Users, Target } from 'lucide-react';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState({ 
    total: 0, 
    mean: 0, 
    atRisk: 0, 
    chartData: [], 
    detailed_results: [] 
  });

  useEffect(() => {
    const fetchBatchAnalytics = async () => {
      try {
        const res = await axios.get('http://localhost:8000/analytics/current-batch');
        setAnalytics(res.data);
      } catch (err) {
        console.error("Dashboard sync failed");
      }
    };
    fetchBatchAnalytics();
  }, []);

  const downloadFullReport = () => {
    const dataToExport = analytics.detailed_results || [];
    if (dataToExport.length === 0) {
      alert("No data available to export. Please process a batch first.");
      return;
    }

    const headers = "Student Name,Registration No,Predicted Grade,Risk Status\n";
    const rows = dataToExport.map(s => {
      const status = s.predicted_score < 50 ? "At Risk" : "Stable";
      return `${s.student_name || s.name},${s.reg_no},${s.predicted_score}%,${status}`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Institutional_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
      
      {/* --- NEW TOP HEADER --- */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid #1e1e3f'
      }}>
        <div>
          <h2 style={{ color: '#2dd4bf', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
            Institutional Analytics
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: '8px 0 0 0' }}>
            Overview of current batch performance
          </p>
        </div>
        <button onClick={downloadFullReport} style={downloadBtnStyle}>
          <FileDown size={18} /> Export Full Report
        </button>
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

      {/* Chart Section */}
      <div className="card" style={{ height: '450px', background: '#0c0d21' }}>
        <h3 style={{ marginBottom: '25px', fontSize: '1rem', color: '#e2e8f0' }}>Grade Distribution Frequency</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={analytics.chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3f" vertical={false} />
            <XAxis dataKey="range" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{fill: 'rgba(45, 212, 191, 0.05)'}}
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
    </div>
  );
};

const statCardStyle = { background: '#0c0d21', border: '1px solid #1e1e3f', padding: '20px' };
const labelStyle = { color: '#a1a1aa', fontSize: '0.7rem', fontWeight: 'bold', margin: 0 };
const downloadBtnStyle = {
  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
  background: 'transparent', border: '1px solid #2dd4bf', color: '#2dd4bf',
  borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem'
};

export default Dashboard;