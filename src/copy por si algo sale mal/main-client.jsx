// main-client.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import ClientDashboard from './ClientDashboard';
import { OrdersProvider } from './OrdersProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OrdersProvider>
      <ClientDashboard />
    </OrdersProvider>
  </React.StrictMode>
);
