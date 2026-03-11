// Import your components

import React, { useState } from 'react';
import { LayoutDashboard, UserCheck, FileUp, History, Settings } from 'lucide-react';
import { BarChart3 } from 'lucide-react'; 


// Add ModelInsights to your imports at the top
import ModelInsights from './components/ModelInsights';
import Dashboard from './components/Dashboard';
import IndividualPredictor from './components/IndividualPredictor';
import BatchUpload from './components/BatchUpload';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Helper component for Sidebar items
  const NavItem = ({ id, icon: Icon, label }) => (
    <div 
      onClick={() => setActiveTab(id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 20px',
        cursor: 'pointer',
        borderRadius: '8px',
        marginBottom: '8px',
        background: activeTab === id ? 'rgba(45, 212, 191, 0.1)' : 'transparent',
        color: activeTab === id ? '#2dd4bf' : '#a1a1aa',
        transition: '0.3s'
      }}
    >
      <Icon size={20} />
      <span style={{ fontWeight: activeTab === id ? '600' : '400' }}>{label}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#090a1e', color: 'white' }}>
      
      {/* --- SIDEBAR --- */}
      <aside style={{ width: '260px', borderRight: '1px solid #2b2d42', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <div style={{ width: '32px', height: '32px', background: '#2dd4bf', borderRadius: '6px' }}></div>
          <h2 style={{ fontSize: '1.1rem', margin: 0, letterSpacing: '1px' }}>
            STUDENT <span style={{ color: '#2dd4bf' }}>ANALYTICS</span>
          </h2>
        </div>

        <nav style={{ flex: 1 }}>
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem id="individual" icon={UserCheck} label="Individual Predictor" />
          <NavItem id="batch" icon={FileUp} label="Batch Upload" />
          {/*<NavItem id="history" icon={History} label="Class History" />*/}  
          <NavItem id="insights" icon={BarChart3} label="Model Insights" />
        </nav>
        
        <div style={{ borderTop: '1px solid #2b2d42', paddingTop: '20px' }}>
          <NavItem id="settings" icon={Settings} label="Settings" />
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {/* Dynamic Header */}
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700' }}>
              
              {activeTab === 'individual' && 'Individual Predictor View'}
              {activeTab === 'batch' && 'Batch Prediction Upload'}
              {activeTab === 'history' && 'Class History'}
              {activeTab === 'settings' && 'System Settings'}
              {activeTab === 'insights' && <ModelInsights />}
            </h1>
            <p style={{ color: '#a1a1aa', margin: '8px 0 0 0' }}>
              
            </p>
          </div>

         
        </header>

        {/* Content Switcher */}
        <section>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'individual' && <IndividualPredictor />}
          {activeTab === 'batch' && <BatchUpload />}
          
          {activeTab === 'history' && (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#a1a1aa' }}>
              <History size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
              <h3>Historical Database View</h3>
              <p>This section will display past model runs from PostgreSQL.</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#a1a1aa' }}>
              <Settings size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
              <h3>Model Configurations</h3>
              <p>Adjust hyperparameters and retrain triggers here.</p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default App;