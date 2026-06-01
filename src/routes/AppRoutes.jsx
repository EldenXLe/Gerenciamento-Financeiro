import { Routes, Route, Navigate } from 'react-router-dom';
import { useFinance } from '../hooks/useFinance';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import Transactions from '../pages/Transactions';
import Reports from '../pages/Reports';
import Login from '../pages/Login';
import Settings from '../pages/Settings';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useFinance();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useFinance();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
