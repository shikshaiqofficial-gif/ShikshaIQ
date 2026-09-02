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
        <Route path="/mock-test" element={<MockTest />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}