import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import Reports from './pages/Reports';
import { useAuth } from './contexts/AuthContext';
import type { ReactNode } from 'react';
import Layout from './components/layout/Layout';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';

// Componente para rutas protegidas
const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { state } = useAuth();
  if (state.isLoading) {
    return <div>Cargando...</div>;
  }
  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Componente de prueba (puedes eliminarlo después)
const TestAuth = () => {
  const { state } = useAuth();
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Estado de autenticación</h2>
      <p>Autenticado: {state.isAuthenticated ? 'Sí' : 'No'}</p>
      {state.user && (
        <div>
          <p>Usuario: {state.user.fullName}</p>
          <p>Rol: {state.user.role}</p>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/create-ticket"
            element={
              <PrivateRoute>
                <Layout>
                  <CreateTicket />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <TicketDetail />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Layout>
                  <Reports />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route path="/test" element={<TestAuth />} />
          <Route path="*" element={<Navigate to="/login" replace />} />

          <Route
            path="/users"
            element={
              <PrivateRoute>
                <Layout>
                  <UserManagement />
                </Layout>
              </PrivateRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;