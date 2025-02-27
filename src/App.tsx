import React from 'react';
import { Layout } from 'antd';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import AppRouter from './route/AppRouter';
import Login from './pages/Auth/login';
import Register from './pages/Auth/register';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from './auth/AuthContext';
import { Toaster } from 'sonner';

const { Content } = Layout;

// Helper function to check if the current route is an auth route
// const isAuthRoute = (pathname: string) => ['/login', '/register'].includes(pathname);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster richColors position="top-right" />
        <Routes>
          {/* Auth routes (No Layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Main app routes (With Layout) */}
          <Route path="/" element={<Navigate to="/cars" replace />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout style={{ minHeight: '100vh' }}>
                  <Sidebar />
                  <Layout style={{ display: 'flex', flex: 1 }}>
                    <Header />
                    <Content className="p-6 bg-gray-100">
                      <AppRouter />
                    </Content>
                    <Footer />
                  </Layout>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>    
  );
};

export default App;
