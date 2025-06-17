import React, { useState } from 'react';
import AdminDashboard from './AdminDashboard';
import ClientDashboard from './ClientDashboard';
import { OrdersProvider } from './OrdersProvider';
import './styles.css';

function UnifiedDashboard() {
  const [view, setView] = useState('admin');

  return (
    <OrdersProvider>
      <div className="unified-dashboard">
        {/* Toggle entre admin y cliente */}
        <div className="nav-toggle" style={{ display: 'flex', gap: '10px', padding: '10px' }}>
          <button
            className={view === 'admin' ? 'active' : ''}
            onClick={() => setView('admin')}
          >
            Panel Administrador
          </button>
          <button
            className={view === 'client' ? 'active' : ''}
            onClick={() => setView('client')}
          >
            Panel Cliente
          </button>
        </div>

        {/* Contenido dinámico */}
        <div className="dashboard-content">
          {view === 'admin' ? <AdminDashboard /> : <ClientDashboard />}
        </div>
      </div>
    </OrdersProvider>
  );
}

export default UnifiedDashboard;
