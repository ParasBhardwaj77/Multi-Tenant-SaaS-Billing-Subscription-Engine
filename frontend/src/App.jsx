import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import Overview from './pages/Overview';
import Invoices from './pages/Invoices';
import Plans from './pages/Plans';
import Members from './pages/Members';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="plans" element={<Plans />} />
          <Route path="members" element={<Members />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
