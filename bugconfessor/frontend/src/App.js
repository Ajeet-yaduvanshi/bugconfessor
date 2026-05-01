import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SessionPage from './pages/SessionPage';
import Analytics from './pages/Analytics';
import History from './pages/History';

const Loader = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
    <div className="spin" style={{ width:36, height:36 }} />
  </div>
);

const Private = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? children : <Navigate to="/login" replace />;
};
const Public = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const Layout = () => {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/"            element={<Public><Landing /></Public>} />
        <Route path="/login"       element={<Public><Login /></Public>} />
        <Route path="/register"    element={<Public><Register /></Public>} />
        <Route path="/dashboard"   element={<Private><Dashboard /></Private>} />
        <Route path="/session/:id" element={<Private><SessionPage /></Private>} />
        <Route path="/analytics"   element={<Private><Analytics /></Private>} />
        <Route path="/history"     element={<Private><History /></Private>} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Layout />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
