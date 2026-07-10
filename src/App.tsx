import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import LoginPage from './pages/Login/LoginPage';
import AccessDeniedPage from './pages/AccessDenied/AccessDeniedPage';

/** Full-screen purple-tinted loading spinner */
function LoadingScreen() {
  return (
    <div className="lp-root" style={{ background: '#f5f0ff' }}>
      <div
        className="google-btn-spinner"
        style={{ width: 40, height: 40, borderWidth: 3 }}
        aria-label="Loading…"
      />
    </div>
  );
}

/**
 * Guards a route: user must be signed in AND have role='admin'.
 * - Not signed in  → /login
 * - Signed in, no admin role → /access-denied
 * - Admin → renders children
 */
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/access-denied" replace />;

  return <>{children}</>;
}

function AppRoutes() {
  const { user, role, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      {/* Public: login — redirect admins straight to dashboard */}
      <Route
        path="/login"
        element={
          !user ? (
            <LoginPage />
          ) : role === 'admin' ? (
            <Navigate to="/" replace />
          ) : (
            <Navigate to="/access-denied" replace />
          )
        }
      />

      {/* Public: access denied page (signed-in, non-admin users) */}
      <Route
        path="/access-denied"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : role === 'admin' ? (
            <Navigate to="/" replace />
          ) : (
            <AccessDeniedPage />
          )
        }
      />

      {/* Protected: admin-only dashboard */}
      <Route
        path="/"
        element={
          <AdminRoute>
            <AppLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="admin" element={<Navigate to="/" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
