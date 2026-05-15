import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Role } from './types';

// ── Pages ──────────────────────────────
import LoginPage       from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import EventDetails     from './pages/EventDetails';

// ── Protected Route ─────────────────────
const ProtectedRoute: React.FC<{ children: React.ReactNode; role: Role }> = ({ children, role }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1A3A6B',
            color: '#fff',
            border: '1px solid #374151',
            borderRadius: '12px',
            fontWeight: '600',
          },
          success: {
            iconTheme: { primary: '#FF6B00', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#fff' },
          },
        }}
      />
      <Routes>
        {/* ── Public root: Evenza login page ─── */}
        <Route path="/" element={<LoginPage />} />

        {/* ── Legacy redirects ──────────────── */}
        <Route path="/student/login"    element={<Navigate to="/" replace />} />
        <Route path="/faculty/login"    element={<Navigate to="/?tab=faculty" replace />} />
        <Route path="/student/register" element={<Navigate to="/?register=true" replace />} />

        {/* ── Protected dashboards ─────────── */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute role="STUDENT">
            <StudentDashboard />
          </ProtectedRoute>
        } />

        <Route path="/faculty/dashboard" element={
          <ProtectedRoute role="FACULTY">
            <FacultyDashboard />
          </ProtectedRoute>
        } />

        {/* ── Event detail ──────────────────── */}
        <Route path="/event/:id" element={<EventDetails />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
