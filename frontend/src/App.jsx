import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import JobAlerts from './JobAlerts';
import CurrentAffairs from './CurrentAffairs';
import DoubtSolver from './DoubtSolver';
import MockTest from './MockTest';
import AdminPanel from './AdminPanel';
import Leaderboard from './Leaderboard';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('shiksha_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/jobs" element={<JobAlerts />} />
        <Route path="/current-affairs" element={<CurrentAffairs />} />
        <Route path="/doubts" element={<DoubtSolver />} />
        
        {/* Mock Test route + alias for trailing dot */}
        <Route path="/mock-test" element={<MockTest />} />
        <Route path="/mock-test." element={<Navigate to="/mock-test" replace />} />
        
        <Route path="/admin" element={<AdminPanel />} />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all fallback redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}