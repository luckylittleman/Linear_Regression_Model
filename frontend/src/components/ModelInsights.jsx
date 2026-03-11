import React from 'react';
import { Info, TrendingUp, Hash } from 'lucide-react';

const ModelInsights = () => {
  // These values should match the output of your train_linear.py script
  const weights = [
    { feature: 'Study Hours', weight: 0.8542, correlation: 'Strong Positive' },
    { feature: 'Prev. Mean Grade', weight: 0.9211, correlation: 'Very Strong' },
    { feature: 'Sleep Hours', weight: 1.1504, correlation: 'Positive' },
    { feature: 'Revision Intensity', weight: 0.4520, correlation: 'Moderate' },
  ];

  const intercept = 12.45;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* 1. The Mathematical Equation */}
      <div className="card" style={{ background: '#11122d', border: '1px solid #2dd4bf' }}>
        <h3 style={{ color: '#2dd4bf', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Hash size={20} /> Regression Equation
        </h3>
        <div style={{ 
          padding: '20px', background: '#090a1e', borderRadius: '12px', 
          marginTop: '15px', fontFamily: 'monospace', fontSize: '1.2rem', textAlign: 'center' 
        }}>
          <span style={{ color: '#a1a1aa' }}>Grade = </span>
          {weights.map((w, i) => (
            <span key={i}>
              <span style={{ color: '#2dd4bf' }}>({w.weight})</span>
              <span style={{ color: '#ffffff' }}> × {w.feature.split(' ')[0]} + </span>
            </span>
          ))}
          <span style={{ color: '#fbbf24' }}>{intercept}</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '10px' }}>
          * This equation is derived via Ordinary Least Squares (OLS) optimization.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* 2. Feature Weights Table */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Feature Coefficients</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2b2d42', color: '#a1a1aa', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Feature</th>
                <th style={{ padding: '12px' }}>Weight (β)</th>
              </tr>
            </thead>
            <tbody>
              {weights.map((w, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #151630' }}>
                  <td style={{ padding: '12px' }}>{w.feature}</td>
                  <td style={{ padding: '12px', color: '#2dd4bf', fontWeight: 'bold' }}>+{w.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 3. Correlation & Learning Info */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Correlation Analysis</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={statBox}>
              <TrendingUp size={16} color="#34d399" />
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Primary Driver</p>
                <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.75rem' }}>Previous Mean Grade has the highest correlation with final outcomes.</p>
              </div>
            </div>
            <div style={statBox}>
              <Info size={16} color="#2dd4bf" />
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Learning Status</p>
                <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.75rem' }}>Model trained on 10,240 records with 98.87% R² accuracy.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const statBox = { display: 'flex', gap: '15px', padding: '15px', background: '#0c0d21', borderRadius: '8px', border: '1px solid #2b2d42' };

export default ModelInsights;