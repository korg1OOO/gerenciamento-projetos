import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext'; // Add useAuth import
import { ThemeProvider } from './context/ThemeContext';
import { ProfileProvider } from './context/ProfileContext';
import { MainLayout } from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Operacoes from './pages/Operacoes';
import Financeiro from './pages/Financeiro';
import Agenda from './pages/Agenda';
import Relatorios from './pages/Relatorios';
import Clientes from './pages/Clientes';
import Configuracoes from './pages/Configuracoes';
import ConfiguracoesAvancadas from './pages/ConfiguracoesAvancadas';
import Usuarios from './pages/Usuarios';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isLoading } = useAuth(); // Now properly imported

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <AuthProvider>
          <ProfileProvider>
            <AppProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Dashboard />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Dashboard />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/operacoes"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Operacoes />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/financeiro"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Financeiro />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agenda"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Agenda />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/relatorios"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Relatorios />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clientes"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Clientes />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/usuarios"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Usuarios />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/configuracoes"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Configuracoes />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/configuracoes-avancadas"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ConfiguracoesAvancadas />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppProvider>
          </ProfileProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;