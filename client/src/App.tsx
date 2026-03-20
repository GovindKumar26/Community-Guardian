import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import AlertDetail from './pages/AlertDetail';
import NewAlert from './pages/NewAlert';
import Login, { Register } from './pages/Login';
import Digest from './pages/Digest';
import SafeCircles from './pages/SafeCircles';
import CircleDetail from './pages/CircleDetail';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="loading" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /> Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/alerts/new" element={<ProtectedRoute><NewAlert /></ProtectedRoute>} />
      <Route path="/alerts/:id" element={<AlertDetail />} />
      <Route path="/digest" element={<ProtectedRoute><Digest /></ProtectedRoute>} />
      <Route path="/circles" element={<ProtectedRoute><SafeCircles /></ProtectedRoute>} />
      <Route path="/circles/:id" element={<ProtectedRoute><CircleDetail /></ProtectedRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
