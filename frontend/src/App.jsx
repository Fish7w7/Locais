import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useState, useEffect } from 'react';
import api from './api/axios';

// Layouts
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Services from './pages/Services';
import Jobs from './pages/Jobs';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ModerateReviews from './pages/ModerateReviews';
import NotFound from './pages/NotFound';
import SetupAdmin from './pages/Setup.Admin';
import Login from './pages/Login';
import Chat from './pages/Chat';
import Maintenance from './pages/Maintenance';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Admin Only Route Component
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.type !== 'admin' && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const { user } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);

  // Verifica modo de manutenção
  const checkMaintenance = async () => {
    try {
      // Se for admin, não verifica manutenção
      if (user && (user.type === 'admin' || user.role === 'admin')) {
        setMaintenanceMode(false);
        setCheckingMaintenance(false);
        return;
      }

      // Faz uma requisição simples para verificar
      await api.get('/auth/me');
      setMaintenanceMode(false);
    } catch (error) {
      // Se retornar 503, está em manutenção
      if (error.response?.status === 503 || error.response?.data?.maintenance) {
        setMaintenanceMode(true);
      } else {
        setMaintenanceMode(false);
      }
    } finally {
      setCheckingMaintenance(false);
    }
  };

  useEffect(() => {
    checkMaintenance();
  }, [user]);

  // Interceptor para detectar modo de manutenção em qualquer requisição
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 503 || error.response?.data?.maintenance) {
          // Se não for admin, ativa modo manutenção
          if (!user || (user.type !== 'admin' && user.role !== 'admin')) {
            setMaintenanceMode(true);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [user]);

  // Loading inicial
  if (checkingMaintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Verificando sistema...</p>
        </div>
      </div>
    );
  }

  // Se em manutenção e não for admin
  if (maintenanceMode && (!user || (user.type !== 'admin' && user.role !== 'admin'))) {
    return <Maintenance onRetry={checkMaintenance} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota de Setup Admin - apenas desenvolvimento */}
        <Route path="/setup-admin" element={<SetupAdmin />} />
        
        {/* Rota de Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Rotas Protegidas */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="chat" element={<Chat />} />
          <Route path="profile" element={<Profile />} />
          <Route path="user/:userId" element={<PublicProfile />} />
          
          {/* Rota Admin Dashboard */}
          <Route path="admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          
          {/* Rota Admin Gerenciar Usuários */}
          <Route path="admin/users" element={
            <AdminRoute>
              <ManageUsers />
            </AdminRoute>
          } />
          
          {/* Rota Admin Moderar Avaliações */}
          <Route path="admin/reviews" element={
            <AdminRoute>
              <ModerateReviews />
            </AdminRoute>
          } />
        </Route>
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;