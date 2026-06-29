import React, { useState, useEffect } from 'react';
import { Info, TrendingUp, Hash, BarChart2 } from 'lucide-react';

const ModelInsights = () => {
  const [modelData, setModelData] = useState({
    weights: [], intercept: 0,
    r2_score: null, rmse: null,
    cv_mean_r2: null, cv_mean_rmse: null,
    records_used: 0, status: 'loading'
  });

  useEffect(() => { fetchModelConfig(); }, []);

  const fetchModelConfig = async () => {
    try {
      const response = await fetch('http://localhost:8000/model/config');
      const data = await response.json();
      setModelData({
        weights:      data.weights      || [],
        intercept:    data.intercept    ?? 0,
        r2_score:     data.r2_score     ?? null,
        rmse:         data.rmse         ?? null,
        cv_mean_r2:   data.cv_mean_r2   ?? null,
        cv_mean_rmse: data.cv_mean_rmse ?? null,
        records_used: data.records_used ?? 0,
        status:       data.status       || 'active',
      });
    } catch (err) {
      console.error('Failed to fetch model config:', err);
    }
  };

  const fmt = (v, decimals = 2) =>
    v != null ? Number(v).toFixed(decimals) : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ margin: 0 }}></h2>
          <p style={{ color: '#a1a1aa', margin: '5px 0 0' }}><b>View regression parameters and model performance</b></p>
        </div>
      </div>

      {/* 1. Regression Equation */}
      <div className="card" style={{ background: '#11122d', border: '1px solid #2dd4bf' }}>
        <h3 style={{ color: '#2dd4bf', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Hash size={20} /> Regression Equation
        </h3>
        <div className="equation-box" style={{ padding: '20px', background: '#090a1e', borderRadius: '12px', marginTop: '15px', fontFamily: 'monospace', fontSize: '1rem', textAlign: 'center', lineHeight: '1.8', wordBreak: 'break-word', overflowX: 'auto' }}>
          <span style={{ color: '#a1a1aa' }}>Score = </span>
          {modelData.weights.map((w, i) => (
            <span key={i}>
              <span style={{ color: '#2dd4bf' }}>({w.weight})</span>
              <span style={{ color: '#ffffff' }}> × {w.feature}{i < modelData.weights.length - 1 ? ' + ' : ' + '}</span>
            </span>
          ))}
          <span style={{ color: '#fbbf24' }}>{modelData.intercept}</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '10px' }}>
          * Derived via Ordinary Least Squares (OLS) optimisation.
        </p>
      </div>

      <div className="insights-grid">

        {/* 2. Feature Weights Table */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Feature Coefficients</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '280px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2b2d42', color: '#a1a1aa', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Feature</th>
                  <th style={{ padding: '12px' }}>Weight (β)</th>
                </tr>
              </thead>
              <tbody>
                {modelData.weights.map((w, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #151630' }}>
                    <td style={{ padding: '12px' }}>{w.feature}</td>
                    <td style={{ padding: '12px', color: '#2dd4bf', fontWeight: 'bold' }}>
                      {w.weight >= 0 ? '+' : ''}{w.weight}
                    </td>
                  </tr>
                ))}
                {!modelData.weights.length && (
                  <tr><td colSpan="2" style={{ padding: '12px', textAlign: 'center', color: '#a1a1aa' }}>Loading…</td></tr>
                )}
                <tr style={{ borderTop: '2px solid #2b2d42' }}>
                  <td style={{ padding: '12px', color: '#a1a1aa' }}>Intercept (β₀)</td>
                  <td style={{ padding: '12px', color: '#fbbf24', fontWeight: 'bold' }}>
                    {modelData.intercept >= 0 ? '+' : ''}{modelData.intercept}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Model Performance Stats */}
        <div className="card">
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={18} color="#2dd4bf" /> Model Performance
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <div style={statBox}>
              <TrendingUp size={18} color="#34d399" style={{ flexShrink: 0 }} />
              <div>
                <p style={statLabel}>R² Score (Hold-out)</p>
                <p style={statValue('#34d399')}>
                  {modelData.r2_score != null ? `${fmt(modelData.r2_score)} %` : '—'}
                </p>
                <p style={statHint}>Proportion of variance explained by the model (test set)</p>
              </div>
            </div>

            <div style={statBox}>
              <TrendingUp size={18} color="#f87171" style={{ flexShrink: 0 }} />
              <div>
                <p style={statLabel}>RMSE (Hold-out)</p>
                <p style={statValue('#f87171')}>
                  {modelData.rmse != null ? `${fmt(modelData.rmse)} marks` : '—'}
                </p>
                <p style={statHint}>Root Mean Squared Error — average prediction error magnitude</p>
              </div>
            </div>

            <div style={statBox}>
              <Info size={18} color="#2dd4bf" style={{ flexShrink: 0 }} />
              <div>
                <p style={statLabel}>5-Fold CV — Mean R²</p>
                <p style={statValue('#2dd4bf')}>
                  {modelData.cv_mean_r2 != null ? `${fmt(modelData.cv_mean_r2)} %` : '—'}
                </p>
                <p style={statHint}>Cross-validated R² (more reliable generalisation estimate)</p>
              </div>
            </div>

            <div style={statBox}>
              <Info size={18} color="#fbbf24" style={{ flexShrink: 0 }} />
              <div>
                <p style={statLabel}>5-Fold CV — Mean RMSE</p>
                <p style={statValue('#fbbf24')}>
                  {modelData.cv_mean_rmse != null ? `${fmt(modelData.cv_mean_rmse)} marks` : '—'}
                </p>
                <p style={statHint}>Cross-validated RMSE across 5 folds (trained on {modelData.records_used.toLocaleString()} records)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const statBox   = { display: 'flex', gap: '14px', padding: '13px', background: '#0c0d21', borderRadius: '8px', border: '1px solid #2b2d42', alignItems: 'flex-start' };
const statLabel = { margin: 0, fontSize: '0.75rem', color: '#a1a1aa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' };
const statValue = (color) => ({ margin: '4px 0 2px', fontSize: '1.05rem', fontWeight: '700', color });
const statHint  = { margin: 0, fontSize: '0.72rem', color: '#64748b', lineHeight: '1.4' };

export default ModelInsights;