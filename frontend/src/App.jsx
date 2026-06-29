import React, { useState } from 'react';
import { LayoutDashboard, UserCheck, FileUp, BarChart3, Settings } from 'lucide-react';

import ModelInsights from './components/ModelInsights';
import Dashboard from './components/Dashboard';
import IndividualPredictor from './components/IndividualPredictor';
import BatchUpload from './components/BatchUpload';
import HistoryTab from './components/HistoryTab';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabTitles = {
    dashboard:  'Institutional Analytics',
    individual: 'Individual Predictor',
    batch:      'Batch Prediction Upload',
    insights:   'Model Insights',
    history:    'Prediction History',
    settings:   'System Settings',
  };

  const handleNav = (id) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  const NavItem = ({ id, icon: Icon, label }) => (
    <div
      onClick={() => handleNav(id)}
      className={`nav-item ${activeTab === id ? 'active' : ''}`}
    >
      <Icon size={20} />
      <span className="nav-label">{label}</span>
    </div>
  );

  return (
    <div className="app-layout">

      {/* SIDEBAR OVERLAY (for mobile/tablet) */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* SIDEBAR */}
      <aside className={`sidebar no-print ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" />
          <h2>
            STUDENT <span style={{ color: '#2dd4bf' }}>ANALYTICS</span>
          </h2>
        </div>

        <nav className="sidebar-nav">
          <NavItem id="dashboard"  icon={LayoutDashboard} label="Dashboard" />
          <NavItem id="individual" icon={UserCheck}        label="Individual Predictor" />
          <NavItem id="batch"      icon={FileUp}           label="Batch Upload" />
          <NavItem id="insights"   icon={BarChart3}        label="Model Insights" />
          <NavItem id="history"    icon={Settings}         label="Prediction History" />
        </nav>

        <div className="sidebar-footer">
          <NavItem id="settings" icon={Settings} label="Settings" />
        </div>
      </aside>

      {/* MAIN WRAPPER: mobile header + main content in column flow */}
      <div className="main-wrapper">

        {/* MOBILE HEADER */}
        <div className="mobile-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="sidebar-logo-icon" style={{ width: '28px', height: '28px' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '1px' }}>
              STUDENT <span style={{ color: '#2dd4bf' }}>ANALYTICS</span>
            </span>
          </div>
          <button
            className={`hamburger-btn ${sidebarOpen ? 'open' : ''}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>

        {/* MAIN CONTENT */}
        <main className="main-content">

          {/* Page Header */}
          <header className="page-header" style={{ marginBottom: '40px' }}>
            <h1>{tabTitles[activeTab]}</h1>
            <p>Computer Science Department — CS Predictive Engine</p>
          </header>

          {/* Content Switcher */}
          <section>
            {activeTab === 'dashboard'  && <Dashboard />}
            {activeTab === 'individual' && <IndividualPredictor />}
            {activeTab === 'batch'      && <BatchUpload />}
            {activeTab === 'insights'   && <ModelInsights />}
            {activeTab === 'history'    && <HistoryTab />}

            {activeTab === 'settings' && (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#a1a1aa' }}>
                <Settings size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
                <h3 style={{ color: '#e2e8f0' }}>Model Configurations</h3>
                <p>Adjust hyperparameters and retrain triggers here.</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;