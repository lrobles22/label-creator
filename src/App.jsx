import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import ClientDashboard from './ClientDashboard';
import AdminDashboard from './AdminDashboard';

function App() {
  console.log("✅ App cargado"); // <--- Agregado

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/client" element={<ClientDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
