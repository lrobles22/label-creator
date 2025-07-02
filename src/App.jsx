// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import ClientDashboard from './ClientDashboard';
import AdminDashboard from './AdminDashboard';
import BillToPay from './BillToPay'; // ✅ Importación agregada

function App() {
  console.log("✅ App cargado");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/client" element={<ClientDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/bill-to-pay" element={<BillToPay />} /> {/* ✅ Nueva ruta */}
      </Routes>
    </Router>
  );
}

export default App;
